import type { StyleGuide } from "@autovio/shared";

/**
 * Build style prefix for image generation prompt (color + tone + tempo → visual style).
 * Default is photorealistic: professional photography, natural lighting, lifelike look.
 */
export function buildImageStylePrefix(guide: StyleGuide): string {
  const parts: string[] = [];

  // Base: always lead with photorealistic default when we have any style guide
  parts.push("Professional photography, natural lighting, lifelike textures");

  if (guide.color_palette?.length) {
    const colorDesc = describeColorPalette(guide.color_palette);
    parts.push(colorDesc);
  }
  if (guide.tone) {
    const styleKeywords = toneToVisualStyle(guide.tone);
    parts.push(styleKeywords);
  }
  if (guide.tempo) {
    const compositionStyle = tempoToComposition(guide.tempo);
    parts.push(compositionStyle);
  }

  return parts.join(", ");
}

function describeColorPalette(hexCodes: string[]): string {
  const colors = hexCodes.map(hexToColorName).join(" and ");
  return `rich ${colors} color palette`;
}

function hexToColorName(hex: string): string {
  if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return "neutral";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (r > g && r > b) return "red";
  if (g > r && g > b) return "green";
  if (b > r && b > g) return "blue";
  if (r > 200 && g > 200 && b > 200) return "bright";
  return "neutral";
}

function toneToVisualStyle(tone: string): string {
  const lower = tone.toLowerCase();
  if (lower.includes("energetic") || lower.includes("dynamic")) {
    return "dynamic but realistic composition, high contrast, natural lighting";
  }
  if (lower.includes("professional") || lower.includes("corporate")) {
    return "clean composition, balanced lighting, professional quality";
  }
  if (lower.includes("calm") || lower.includes("peaceful")) {
    return "soft natural lighting, gentle composition, serene atmosphere";
  }
  if (lower.includes("playful") || lower.includes("fun")) {
    return "lifelike composition, natural lighting, playful but realistic mood";
  }
  return "high-quality, realistic composition";
}

function tempoToComposition(tempo: string): string {
  const t = tempo.toLowerCase();
  if (t === "fast") return "dynamic framing, bold composition";
  if (t === "slow") return "steady composition, balanced framing";
  return "balanced, natural composition";
}
