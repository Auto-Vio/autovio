export interface EZFFMPEGOptions {
  fps?: number;
  width?: number;
  height?: number;
}

export interface ResolvedOptions {
  fps: number;
  width: number;
  height: number;
}

export interface VideoClipObj {
  type: "video";
  url: string;
  position: number;
  end: number;
  cutFrom?: number;
  volume?: number;
  transition?: string;
  transitionDuration?: number;
}

export interface AudioClipObj {
  type: "audio";
  url: string;
  position: number;
  end: number;
  cutFrom?: number;
  volume?: number;
}

export interface TextClipObj {
  type: "text";
  text: string;
  position: number;
  end: number;
  fontFile?: string;
  fontSize?: number;
  fontColor?: string;
  centerX?: number;
  centerY?: number;
  x?: number;
  y?: number;
  borderColor?: string;
  borderWidth?: number;
  shadowColor?: string;
  shadowX?: number;
  shadowY?: number;
  backgroundColor?: string;
  backgroundOpacity?: number;
  padding?: number;
}

export type ClipObj = VideoClipObj | AudioClipObj | TextClipObj;

export interface InternalVideoClip extends VideoClipObj {
  volume: number;
  cutFrom: number;
  iphoneRotation: number;
  hasAudio: boolean;
  transition?: string;
  transitionDuration?: number;
  /** Actual duration of the source video file in seconds */
  sourceDuration: number | null;
}

export interface InternalAudioClip extends AudioClipObj {
  volume: number;
  cutFrom: number;
}

export interface InternalTextClip {
  type: "text";
  text: string;
  position: number;
  end: number;
  fontFile: string;
  fontSize: number;
  fontColor: string;
  centerX?: number;
  centerY?: number;
  x?: number;
  y?: number;
  borderColor?: string;
  borderWidth?: number;
  shadowColor?: string;
  shadowX?: number;
  shadowY?: number;
  backgroundColor?: string;
  backgroundOpacity?: number;
  padding?: number;
}

export type InternalClip = InternalVideoClip | InternalAudioClip;

export interface ExportParams {
  outputPath?: string;
  onProgress?: (progress: number, stage: string) => void;
}

export interface VideoMetadata {
  iphoneRotation: number;
  hasAudio: boolean;
  width: number | null;
  height: number | null;
  duration: number | null;
}

export type Logger = (message: string, ...args: unknown[]) => void;
