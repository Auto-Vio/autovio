import type { AnalysisResult, UserIntent, StyleGuide } from "@autovio/shared";
import { DEFAULT_SCENARIO_SYSTEM_PROMPT } from "@autovio/shared";

/**
 * Format StyleGuide into markdown for scenario system prompt
 */
export function formatStyleGuideForPrompt(guide: StyleGuide): string {
  const parts: string[] = ["## Project Style Guide"];

  if (guide.tone) {
    parts.push(`**Tone:** ${guide.tone}`);
  }
  if (guide.color_palette?.length) {
    parts.push(`**Color Palette:** ${guide.color_palette.join(", ")}`);
  }
  if (guide.tempo) {
    parts.push(`**Tempo:** ${guide.tempo}-paced`);
  }
  if (guide.camera_style) {
    parts.push(`**Camera Style:** ${guide.camera_style}`);
  }
  if (guide.brand_voice) {
    parts.push(`**Brand Voice:** ${guide.brand_voice}`);
  }
  if (guide.must_include?.length) {
    parts.push(`**Must Include:** ${guide.must_include.join(", ")}`);
  }
  if (guide.must_avoid?.length) {
    parts.push(`**Must Avoid:** ${guide.must_avoid.join(", ")}`);
  }

  return parts.join("\n");
}

/** Returns the default scenario system prompt. Sourced from shared so new projects and fallback use the same text. */
export function getScenarioSystemPrompt(): string {
  return DEFAULT_SCENARIO_SYSTEM_PROMPT;
}

export function getScenarioUserPrompt(analysis: AnalysisResult | undefined, intent: UserIntent): string {
  let intentDescription: string;

  if (intent.mode === "style_transfer") {
    intentDescription = `Create a new video${analysis ? " with the SAME visual style as the reference but" : ""} for the following product.
Product: ${intent.product_name || "N/A"}
Description: ${intent.product_description || "N/A"}
Target Audience: ${intent.target_audience || "General"}`;
  } else {
    if (analysis) {
      const remixDirection = [intent.product_name, intent.product_description, intent.target_audience].filter(Boolean).length
        ? `\n\nOptional user direction for the remix:\n${intent.product_name ? `Product/Topic: ${intent.product_name}\n` : ""}${intent.product_description ? `Description: ${intent.product_description}\n` : ""}${intent.target_audience ? `Target Audience: ${intent.target_audience}` : ""}`
        : "";
      intentDescription = `Remix this video's content from a different perspective.
Keep the same topic but change the angle, tone, or approach.${remixDirection}`;
    } else {
      intentDescription = `Create an original social media video based on the user's description.
Product: ${intent.product_name || "N/A"}
Description: ${intent.product_description || "N/A"}
Target Audience: ${intent.target_audience || "General"}`;
    }
  }

  const analysisSection = analysis
    ? `## Reference Video Analysis\n${JSON.stringify(analysis, null, 2)}\n\n`
    : "## No Reference Video\nCreate an original concept from scratch.\n\n";

  return `${analysisSection}## User Intent
${intentDescription}

Important: The scenes must form one continuous video. Each scene is the continuation of the previous one (same story, same world, same characters). Do not produce unrelated or disjointed shots.
${intent.language ? `Language: ${intent.language}` : ""}
${intent.video_duration ? `Target total video duration: ${intent.video_duration} seconds. Create as many scenes as needed so that the sum of each scene's duration_seconds is about ${intent.video_duration}.` : "Default: create 1-2 scenes, 3-5 seconds each."}
${intent.scene_count ? `Create exactly ${intent.scene_count} scenes.` : ""}

## Output Format
Return a JSON array of scenes in order. Use 0-based indexing: first scene has scene_index: 0, second has scene_index: 1, etc. The array is a single sequence: each scene continues from the previous one. Each element must have:
{
  "scene_index": <number starting from 0>,
  "duration_seconds": <number> (length of this scene in seconds; all scenes' duration_seconds should add up to the target total if one was given),
  "image_prompt": "<detailed prompt for image generation>",
  "negative_prompt": "<what to avoid>",
  "video_prompt": "<camera/motion description for image-to-video>",
  "text_overlay": "<text to show, if any>",
  "transition": "<transition to next scene>"
}
Ensure narrative and visual continuity across all scenes so the result is one coherent video.`;
}
