import { z } from "zod";

export const UserIntentSchema = z.object({
  mode: z.enum(["style_transfer", "content_remix"]),
  product_name: z.string().optional(),
  product_description: z.string().optional(),
  target_audience: z.string().optional(),
  language: z.string().optional(),
  video_duration: z.number().optional(),
  scene_count: z.number().optional(),
});

export const ScenarioSceneSchema = z.object({
  scene_index: z.number(),
  duration_seconds: z.number(),
  image_prompt: z.string(),
  negative_prompt: z.string().nullable().default(""),
  video_prompt: z.string(),
  text_overlay: z.string().nullable().optional(),
  transition: z.string().nullable().default("cut"),
});

export type UserIntent = z.infer<typeof UserIntentSchema>;
export type ScenarioScene = z.infer<typeof ScenarioSceneSchema>;
