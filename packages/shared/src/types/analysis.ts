import { z } from "zod";

export const SceneAnalysisSchema = z.object({
  index: z.number(),
  duration_seconds: z.number(),
  description: z.string(),
  transition: z.string().nullable().default("cut"),
  text_overlay: z.string().nullable().optional(),
  camera_movement: z.string().nullable().optional(),
});

export const AnalysisResultSchema = z.object({
  scene_count: z.number(),
  overall_tone: z.string(),
  color_palette: z.array(z.string()),
  tempo: z.string(),
  has_text_overlay: z.boolean(),
  scenes: z.array(SceneAnalysisSchema),
});

export type SceneAnalysis = z.infer<typeof SceneAnalysisSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
