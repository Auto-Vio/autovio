export function getAnalyzerPrompt(mode: "style_transfer" | "content_remix"): string {
  const modeContext =
    mode === "style_transfer"
      ? "Focus on visual style, colors, transitions, camera movements, and composition."
      : "Focus on content structure, messaging, storytelling flow, and audience engagement.";

  return `You are a professional video analyst. Analyze this social media video scene by scene.
${modeContext}

Return a JSON object with this exact structure:
{
  "scene_count": <number>,
  "overall_tone": "<string describing tone: energetic, calm, professional, playful, etc>",
  "color_palette": ["<hex colors used>"],
  "tempo": "<fast | medium | slow>",
  "has_text_overlay": <boolean>,
  "scenes": [
    {
      "index": <1-based>,
      "duration_seconds": <number>,
      "description": "<detailed visual description of the scene>",
      "transition": "<cut | fade | dissolve | slide | zoom>",
      "text_overlay": "<text shown in scene, if any>",
      "camera_movement": "<static | pan left | pan right | zoom in | zoom out | tracking>"
    }
  ]
}

Be precise with scene boundaries. Return ONLY the JSON, no extra text.`;
}
