import fs from "fs/promises";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";
import { execFile } from "child_process";
import { promisify } from "util";
import {
  getTrimEnd,
  getClipAudioString,
  getBlackString,
  escapeSingleQuotes,
} from "./helpers.js";
import type {
  EZFFMPEGOptions,
  ResolvedOptions,
  ClipObj,
  VideoClipObj,
  AudioClipObj,
  ExportParams,
  InternalVideoClip,
  InternalAudioClip,
  InternalTextClip,
  InternalClip,
  VideoMetadata,
  Logger,
} from "./types.js";

export type { ClipObj, ExportParams, EZFFMPEGOptions } from "./types.js";

const execFileAsync = promisify(execFile);
const tempDir = os.tmpdir();

const defaultFontFile = path.join(
  import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
  "..",
  "..",
  "..",
  "..",
  "fonts",
  "Arial-Bold.ttf",
);

export class EZFFMPEG {
  private options: ResolvedOptions;
  private videoOrAudioClips: InternalClip[] = [];
  private textClips: InternalTextClip[] = [];
  private filesToClean: string[] = [];
  private log: Logger;

  constructor(options: EZFFMPEGOptions = {}, logger?: Logger) {
    this.options = {
      fps: options.fps ?? 30,
      width: options.width ?? 1920,
      height: options.height ?? 1080,
    };
    this.log = logger ?? (() => {});
  }

  private getInputStreams(): string {
    return this.videoOrAudioClips.map((clip) => `-i "${clip.url}"`).join(" ");
  }

  private async getVideoMetadata(url: string): Promise<VideoMetadata> {
    try {
      const { stdout } = await execFileAsync("ffprobe", [
        "-v", "error",
        "-show_streams",
        "-show_format",
        "-of", "json",
        url,
      ]);
      const metadata = JSON.parse(stdout);
      const videoStream = metadata.streams?.find(
        (s: { codec_type: string }) => s.codec_type === "video",
      );
      const hasAudio = metadata.streams?.some(
        (s: { codec_type: string }) => s.codec_type === "audio",
      );
      const iphoneRotation =
        videoStream?.side_data_list?.[0]?.rotation ?? 0;
      
      // Get duration from format or video stream
      let duration: number | null = null;
      if (metadata.format?.duration) {
        duration = parseFloat(metadata.format.duration);
      } else if (videoStream?.duration) {
        duration = parseFloat(videoStream.duration);
      }
      
      return {
        iphoneRotation,
        hasAudio: !!hasAudio,
        width: videoStream?.width ?? null,
        height: videoStream?.height ?? null,
        duration,
      };
    } catch (err) {
      this.log("Error getting video metadata:", err);
      return { iphoneRotation: 0, hasAudio: false, width: null, height: null, duration: null };
    }
  }

  private async unrotateVideo(url: string): Promise<string> {
    const unrotatedUrl = path.join(tempDir, `unrotated-${randomUUID()}.mp4`);
    await execFileAsync("ffmpeg", ["-y", "-i", url, unrotatedUrl]);
    return unrotatedUrl;
  }

  async cleanup(): Promise<void> {
    for (const file of this.filesToClean) {
      try {
        await fs.unlink(file);
        this.log("File cleaned up:", file);
      } catch (err) {
        this.log("Error cleaning up file:", err);
      }
    }
    this.filesToClean = [];
  }

  private async loadVideo(clipObj: VideoClipObj): Promise<void> {
    const metadata = await this.getVideoMetadata(clipObj.url);
    this.videoOrAudioClips.push({
      ...clipObj,
      volume: clipObj.volume ?? 1,
      cutFrom: clipObj.cutFrom ?? 0,
      iphoneRotation: metadata.iphoneRotation,
      hasAudio: metadata.hasAudio,
      transition: clipObj.transition,
      transitionDuration: clipObj.transitionDuration,
      sourceDuration: metadata.duration,
    });
  }

  private loadAudio(clipObj: AudioClipObj): void {
    this.videoOrAudioClips.push({
      ...clipObj,
      volume: clipObj.volume ?? 1,
      cutFrom: clipObj.cutFrom ?? 0,
    } as InternalAudioClip);
  }

  private loadText(clipObj: ClipObj & { type: "text" }): void {
    const clip: InternalTextClip = {
      ...clipObj,
      fontFile: clipObj.fontFile ?? defaultFontFile,
      fontSize: clipObj.fontSize ?? 48,
      fontColor: clipObj.fontColor ?? "#000000",
    };

    if (typeof clipObj.centerX === "number") clip.centerX = clipObj.centerX;
    else if (typeof clipObj.x === "number") clip.x = clipObj.x;
    else clip.centerX = 0;

    if (typeof clipObj.centerY === "number") clip.centerY = clipObj.centerY;
    else if (typeof clipObj.y === "number") clip.y = clipObj.y;
    else clip.centerY = 0;

    this.textClips.push(clip);
  }

  async load(clipObjs: ClipObj[]): Promise<void> {
    await Promise.all(
      clipObjs.map((clipObj) => {
        if (clipObj.type === "video") return this.loadVideo(clipObj);
        if (clipObj.type === "audio") {
          this.loadAudio(clipObj);
          return;
        }
        if (clipObj.type === "text") {
          this.loadText(clipObj);
          return;
        }
      }),
    );
  }

  async export(params: ExportParams = {}): Promise<string> {
    const outputPath = params.outputPath ?? "./output.mp4";

    // 1. Separate video and audio clips, then sort videos by position
    const videoClips = this.videoOrAudioClips.filter((c) => c.type === "video") as InternalVideoClip[];
    const audioClips = this.videoOrAudioClips.filter((c) => c.type === "audio") as InternalAudioClip[];
    
    videoClips.sort((a, b) => {
      if (a.position == null) return -1;
      if (b.position == null) return 1;
      return a.position - b.position;
    });

    // 2. Un-rotate any iPhone-rotated videos
    await Promise.all(
      videoClips.map(async (clip) => {
        if (clip.iphoneRotation !== 0) {
          const unrotatedUrl = await this.unrotateVideo(clip.url);
          this.filesToClean.push(unrotatedUrl);
          clip.url = unrotatedUrl;
        }
      }),
    );

    // Build ordered input list: videos first, then audio files
    const orderedInputs: InternalClip[] = [...videoClips, ...audioClips];

    let filterComplex = "";
    let videoString = "";
    let audioString = "";
    let textString = "";
    const videoConcatInputs: string[] = [];
    const videoSegmentInfos: { label: string; clip: InternalVideoClip; duration: number }[] = [];
    const audioConcatInputs: string[] = [];
    let blackConcatCount = 0;
    let currentPosition = 0;

    // 3. Build filter_complex for video clips
    videoClips.forEach((videoClip, videoIndex) => {
      const segDuration = videoClip.end - videoClip.position;

      // Fill gap before this clip with black
      if (videoClip.position > currentPosition) {
        const { blackStringPart, blackConcatInput } = getBlackString(
          videoClip.position - currentPosition,
          this.options.width,
          this.options.height,
          blackConcatCount,
        );
        videoString += blackStringPart;
        videoConcatInputs.push(blackConcatInput);
        blackConcatCount++;
      }

      // Trim + scale + pad - use videoIndex as FFmpeg input index
      const trimEnd = getTrimEnd(videoClip);
      this.log(`Video ${videoIndex}: url=${videoClip.url}, cutFrom=${videoClip.cutFrom}, trimEnd=${trimEnd}, sourceDuration=${videoClip.sourceDuration}, position=${videoClip.position}, end=${videoClip.end}, segDuration=${segDuration}`);
      
      videoString +=
        `[${videoIndex}:v]trim=start=${videoClip.cutFrom}:end=${trimEnd},` +
        `setpts=PTS-STARTPTS,` +
        `fps=${this.options.fps},` +
        `scale=${this.options.width}:${this.options.height}:force_original_aspect_ratio=decrease,` +
        `pad=${this.options.width}:${this.options.height}:(ow-iw)/2:(oh-ih)/2[v${videoIndex}];`;
      videoConcatInputs.push(`[v${videoIndex}]`);
      videoSegmentInfos.push({ label: `[v${videoIndex}]`, clip: videoClip, duration: segDuration });

      if (videoClip.hasAudio) {
        const { audioStringPart, audioConcatInput } = getClipAudioString(
          videoClip,
          videoIndex,
        );
        audioString += audioStringPart;
        audioConcatInputs.push(audioConcatInput);
      }

      currentPosition = videoClip.end;

      // Fill trailing gap after last video clip
      if (videoIndex === videoClips.length - 1) {
        const maxEnd = Math.max(
          ...videoClips.map((c) => c.end),
          ...this.textClips.map((c) => c.end),
        );
        if (currentPosition < maxEnd) {
          const { blackStringPart, blackConcatInput } = getBlackString(
            maxEnd - currentPosition,
            this.options.width,
            this.options.height,
            blackConcatCount,
          );
          videoString += blackStringPart;
          videoConcatInputs.push(blackConcatInput);
          blackConcatCount++;
          currentPosition = maxEnd;
        }
      }
    });

    // 4. Build filter_complex for audio clips (external audio files)
    audioClips.forEach((audioClip, audioIndex) => {
      // Audio input index starts after all video inputs
      const ffmpegInputIndex = videoClips.length + audioIndex;
      const { audioStringPart, audioConcatInput } = getClipAudioString(
        audioClip,
        ffmpegInputIndex,
      );
      audioString += audioStringPart;
      audioConcatInputs.push(audioConcatInput);
    });

    // Store ordered inputs for later use
    this.videoOrAudioClips = orderedInputs;

    filterComplex += videoString + audioString;

    let combinedVideoName = "[outv]";

    // 4. Concat or xfade video segments
    // Only use xfade if there are actual transitions (not "cut" and duration > 0)
    const hasRealTransitions = videoSegmentInfos.some(
      (s) => s.clip.transition && s.clip.transition !== "cut" && (s.clip.transitionDuration ?? 0) > 0
    );
    const xfadeMap: Record<string, string> = {
      fade: "fade",
      dissolve: "dissolve",
      wipeleft: "wipeleft",
      wiperight: "wiperight",
      slideup: "slideup",
      slidedown: "slidedown",
    };

    if (videoConcatInputs.length > 0) {
      if (hasRealTransitions && videoSegmentInfos.length >= 2) {
        // Use xfade for transitions
        let accLabel = videoSegmentInfos[0].label;
        let accDuration = videoSegmentInfos[0].duration;
        for (let i = 1; i < videoSegmentInfos.length; i++) {
          const seg = videoSegmentInfos[i];
          const prev = videoSegmentInfos[i - 1];
          const trans = prev.clip.transition ?? "cut";
          const dur = prev.clip.transitionDuration ?? 0.5;
          
          // Skip xfade for "cut" or zero duration - will be handled by concat
          if (trans === "cut" || dur <= 0) {
            // For cut transitions within xfade chain, we need to concat
            const outLabel = i === videoSegmentInfos.length - 1 ? "outv" : `concat${i}`;
            filterComplex += `${accLabel}${seg.label}concat=n=2:v=1:a=0[${outLabel}];`;
            accLabel = `[${outLabel}]`;
            accDuration = accDuration + seg.duration;
          } else {
            const xfadeType = xfadeMap[trans] ?? "fade";
            const offset = Math.max(0, accDuration - dur);
            const outLabel = i === videoSegmentInfos.length - 1 ? "outv" : `xfade${i}`;
            filterComplex += `${accLabel}${seg.label}xfade=transition=${xfadeType}:duration=${dur}:offset=${offset}[${outLabel}];`;
            accLabel = `[${outLabel}]`;
            accDuration = accDuration + seg.duration - dur;
          }
        }
        combinedVideoName = videoSegmentInfos.length === 1 ? videoSegmentInfos[0].label : "[outv]";
      } else {
        // No transitions - use simple concat
        filterComplex += videoConcatInputs.join("");
        filterComplex += `concat=n=${videoConcatInputs.length}:v=1:a=0${combinedVideoName};`;
      }
    }

    // 5. Mix audio
    if (audioConcatInputs.length > 0) {
      filterComplex += audioConcatInputs.join("");
      filterComplex += `amix=inputs=${audioConcatInputs.length}:duration=longest[outa];`;
    }

    // 6. Text overlays
    if (this.textClips.length > 0) {
      textString += `${combinedVideoName}`;

      this.textClips.forEach((clip, index) => {
        textString +=
          `drawtext=text='${escapeSingleQuotes(clip.text)}'` +
          `:fontsize=${clip.fontSize}` +
          `:fontcolor=${clip.fontColor}` +
          `:enable='between(t\\,${clip.position}\\,${clip.end})'`;

        // Add fontfile only if it exists
        if (clip.fontFile) {
          textString += `:fontfile=${clip.fontFile}`;
        }

        // Positioning
        if (typeof clip.centerX === "number") {
          textString += `:x=(${this.options.width} - text_w)/2 + ${clip.centerX}`;
        } else if (typeof clip.x === "number") {
          textString += `:x=${clip.x}`;
        }

        if (typeof clip.centerY === "number") {
          textString += `:y=(${this.options.height} - text_h)/2 + ${clip.centerY}`;
        } else if (typeof clip.y === "number") {
          textString += `:y=${clip.y}`;
        }

        // Text decorations
        if (clip.borderColor) textString += `:bordercolor=${clip.borderColor}`;
        if (clip.borderWidth) textString += `:borderw=${clip.borderWidth}`;
        if (clip.shadowColor) textString += `:shadowcolor=${clip.shadowColor}`;
        if (clip.shadowX) textString += `:shadowx=${clip.shadowX}`;
        if (clip.shadowY) textString += `:shadowy=${clip.shadowY}`;
        if (clip.backgroundColor) {
          textString += `:box=1:boxcolor=${clip.backgroundColor}`;
          if (clip.backgroundOpacity)
            textString += `@${clip.backgroundOpacity}`;
        }
        if (clip.padding) textString += `:boxborderw=${clip.padding}`;

        textString +=
          index === this.textClips.length - 1
            ? `[outVideoAndText];`
            : `[text${index}];[text${index}]`;
      });

      combinedVideoName = "[outVideoAndText]";
    }

    filterComplex += textString;

    // 7. Build final ffmpeg command args
    const args: string[] = ["-y"];

    // Add input files
    for (const clip of this.videoOrAudioClips) {
      args.push("-i", clip.url);
    }

    args.push("-filter_complex", filterComplex);

    if (videoConcatInputs.length > 0) {
      args.push("-map", combinedVideoName);
    }
    if (audioConcatInputs.length > 0) {
      args.push("-map", "[outa]");
    }
    if (videoConcatInputs.length > 0) {
      args.push("-c:v", "libx264", "-preset", "medium", "-crf", "23");
    }
    if (audioConcatInputs.length > 0) {
      args.push("-c:a", "aac", "-b:a", "192k");
    }

    args.push(outputPath);

    this.log("ezffmpeg: Export started");
    this.log("filter_complex:", filterComplex);
    this.log("ffmpeg args:", args.join(" "));

    try {
      await execFileAsync("ffmpeg", args, { maxBuffer: 50 * 1024 * 1024 });
      this.log("ezffmpeg: Export finished");
      return outputPath;
    } catch (err) {
      throw err;
    } finally {
      await this.cleanup();
    }
  }
}
