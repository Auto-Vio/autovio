import type { AnalysisResult } from "./analysis.js";

/**
 * Structured style guide for project-level visual consistency.
 * All fields are optional - users can fill as much or as little as needed.
 */
export interface StyleGuide {
  /** Overall tone, e.g. "energetic", "professional" */
  tone?: string;
  /** Hex color codes, e.g. ["#FF5733", "#33C3FF"] */
  color_palette?: string[];
  /** Pacing of the video */
  tempo?: "fast" | "medium" | "slow";
  /** Camera movement preferences */
  camera_style?: string;
  /** Brand communication tone */
  brand_voice?: string;
  /** Elements that must appear */
  must_include?: string[];
  /** Elements to avoid */
  must_avoid?: string[];
}

/**
 * Extract StyleGuide fields from AnalysisResult.
 * Maps analysis data to style guide structure (1:1 mapping).
 *
 * @param analysis - Video analysis result from vision AI
 * @returns Partial StyleGuide with mapped fields
 */
export function styleGuideFromAnalysis(
  analysis: AnalysisResult
): Partial<StyleGuide> {
  const tempoLower = analysis.tempo?.toLowerCase();
  const tempo: StyleGuide["tempo"] =
    tempoLower === "fast" || tempoLower === "medium" || tempoLower === "slow"
      ? tempoLower
      : undefined;
  return {
    tone: analysis.overall_tone,
    color_palette:
      analysis.color_palette?.length > 0 ? analysis.color_palette : undefined,
    tempo,
    camera_style: analysis.scenes?.[0]?.camera_movement || undefined,
  };
}

/**
 * Check if StyleGuide is empty (no fields set).
 *
 * @param guide - Style guide to check
 * @returns true if guide is undefined or has no meaningful fields
 */
export function isStyleGuideEmpty(guide?: StyleGuide): boolean {
  if (!guide) return true;
  return (
    !guide.tone &&
    !guide.color_palette?.length &&
    !guide.tempo &&
    !guide.camera_style &&
    !guide.brand_voice &&
    !guide.must_include?.length &&
    !guide.must_avoid?.length
  );
}
