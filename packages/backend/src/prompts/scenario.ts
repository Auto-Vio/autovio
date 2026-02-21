import type { AnalysisResult, UserIntent } from "@viragen/shared";

export function getScenarioSystemPrompt(): string {
  return `You are a creative director specializing in social media video production.
Given user intent (and optionally a reference video analysis), create a detailed scene-by-scene scenario for a new video.
Each scene must have prompts ready for AI image and video generation.

For image prompts: Be highly descriptive, include lighting, lens type, style, quality keywords.
For video prompts: Describe camera movement, motion, and cinematic style.
For negative prompts: List what should NOT appear in the image.

Return ONLY a JSON array of scenes.`;
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
${intent.language ? `Language: ${intent.language}` : ""}
${intent.video_duration ? `Target total video duration: ${intent.video_duration} seconds. Create as many scenes as needed so that the sum of each scene's duration_seconds is about ${intent.video_duration}.` : "Default: create 4-6 scenes, 3-5 seconds each."}
${intent.scene_count ? `Create exactly ${intent.scene_count} scenes.` : ""}

## Output Format
Return a JSON array where each element has:
{
  "scene_index": <number>,
  "duration_seconds": <number> (length of this scene in seconds; all scenes' duration_seconds should add up to the target total if one was given),
  "image_prompt": "<detailed prompt for image generation>",
  "negative_prompt": "<what to avoid>",
  "video_prompt": "<camera/motion description for image-to-video>",
  "text_overlay": "<text to show, if any>",
  "transition": "<transition to next scene>"
}`;
}
