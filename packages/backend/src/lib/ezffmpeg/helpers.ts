import type { InternalVideoClip, InternalAudioClip } from "./types.js";

type TrimmableClip = InternalVideoClip | InternalAudioClip;

export function getTrimEnd(clip: TrimmableClip): number {
  return clip.cutFrom + (clip.end - clip.position);
}

export function getClipAudioString(
  clip: TrimmableClip,
  index: number,
): { audioStringPart: string; audioConcatInput: string } {
  const adelay = clip.position * 1000;
  const audioConcatInput = `[a${index}]`;
  const audioStringPart =
    `[${index}:a]volume=${clip.volume},atrim=start=${clip.cutFrom}:end=${getTrimEnd(clip)},` +
    `adelay=${adelay}|${adelay},asetpts=PTS-STARTPTS${audioConcatInput};`;

  return { audioStringPart, audioConcatInput };
}

export function getBlackString(
  duration: number,
  width: number,
  height: number,
  index: number,
): { blackStringPart: string; blackConcatInput: string } {
  const blackConcatInput = `[black${index}]`;
  return {
    blackStringPart: `color=c=black:s=${width}x${height}:d=${duration}${blackConcatInput};`,
    blackConcatInput,
  };
}

export function escapeSingleQuotes(text: string): string {
  return text.replace(/'/g, "\\'");
}
