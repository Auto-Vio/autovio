import type { StyleGuide } from "@autovio/shared";

/**
 * Build style prefix for video generation prompt (camera + tempo + tone)
 */
export function buildVideoStylePrefix(guide: StyleGuide): string {
  const parts: string[] = [];

  if (guide.camera_style) {
    parts.push(guide.camera_style);
  }
  if (guide.tempo) {
    parts.push(tempoToMotion(guide.tempo));
  }
  if (guide.tone) {
    parts.push(toneToCinematic(guide.tone));
  }

  return parts.length > 0 ? parts.join(", ") : "";
}

function tempoToMotion(tempo: string): string {
  const t = tempo.toLowerCase();
  if (t.includes("fast")) return "quick motion, dynamic camera movement";
  if (t.includes("slow")) return "slow motion, smooth camera movement";
  return "steady camera movement";
}

function toneToCinematic(tone: string): string {
  const lower = tone.toLowerCase();
  if (lower.includes("energetic")) return "energetic pacing, dynamic cuts";
  if (lower.includes("professional")) return "smooth professional transitions";
  if (lower.includes("calm")) return "gentle pacing, soft transitions";
  return "cinematic quality";
}
