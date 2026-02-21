import { Router } from "express";
import { z } from "zod";
import { getImageProvider, getVideoProvider } from "../providers/registry.js";

const router = Router();

const ImageRequestSchema = z.object({
  prompt: z.string(),
  negative_prompt: z.string().default(""),
  image_instruction: z.string().optional(),
});

const VideoRequestSchema = z.object({
  image_url: z.string(),
  prompt: z.string(),
  duration: z.number().default(5),
  video_instruction: z.string().optional(),
});

/** Validate modelId against provider's supported models, fallback to first if invalid */
function resolveModelId(
  modelId: string | undefined,
  providerModels: { id: string }[],
): string | undefined {
  if (!modelId) return undefined; // use provider default
  const valid = providerModels.some((m) => m.id === modelId);
  if (!valid) {
    const fallback = providerModels[0]?.id;
    console.log(`[model] Invalid model "${modelId}", falling back to "${fallback}"`);
    return fallback;
  }
  return modelId;
}

router.post("/image", async (req, res, next) => {
  try {
    const providerId = req.headers["x-image-provider"] as string || "dalle";
    const rawModelId = req.headers["x-model-id"] as string | undefined;
    const apiKey = req.headers["x-api-key"] as string;

    if (!apiKey) {
      res.status(400).json({ error: "API key required (x-api-key header)" });
      return;
    }

    const { prompt, negative_prompt, image_instruction } = ImageRequestSchema.parse(req.body);
    const provider = getImageProvider(providerId);
    const modelId = resolveModelId(rawModelId, provider.models);
    const fullPrompt = image_instruction?.trim() ? `${image_instruction.trim()}\n\n${prompt}` : prompt;

    console.log(`[generate/image] provider=${providerId} model=${modelId} prompt="${fullPrompt.slice(0, 80)}..."`);

    const imageUrl = await provider.generate(fullPrompt, negative_prompt, apiKey, modelId);

    console.log(`[generate/image] success, url length=${imageUrl.length}`);
    res.json({ imageUrl });
  } catch (err) {
    next(err);
  }
});

router.post("/video", async (req, res, next) => {
  try {
    const providerId = req.headers["x-video-provider"] as string || "runway";
    const rawModelId = req.headers["x-model-id"] as string | undefined;
    const apiKey = req.headers["x-api-key"] as string;

    if (!apiKey) {
      res.status(400).json({ error: "API key required (x-api-key header)" });
      return;
    }

    const { image_url, prompt, duration, video_instruction } = VideoRequestSchema.parse(req.body);
    const provider = getVideoProvider(providerId);
    const modelId = resolveModelId(rawModelId, provider.models);
    const fullPrompt = video_instruction?.trim() ? `${video_instruction.trim()}\n\n${prompt}` : prompt;

    console.log(`[generate/video] provider=${providerId} model=${modelId} duration=${duration}s prompt="${fullPrompt.slice(0, 80)}..."`);

    const videoUrl = await provider.convert(image_url, fullPrompt, duration, apiKey, modelId);

    console.log(`[generate/video] success, url length=${videoUrl.length}`);
    res.json({ videoUrl });
  } catch (err) {
    next(err);
  }
});

export default router;
