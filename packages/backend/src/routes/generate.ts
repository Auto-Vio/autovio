import { Router } from "express";
import { z } from "zod";
import { getImageProvider, getVideoProvider } from "../providers/registry.js";
import { isStyleGuideEmpty } from "@viragen/shared";
import type { StyleGuide } from "@viragen/shared";
import { buildImageStylePrefix } from "../prompts/image.js";
import { buildVideoStylePrefix } from "../prompts/video.js";
import { authenticate, requireScope } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

/** Check if image_url is our own auth-protected media URL (would 401 when provider fetches it). */
function isInternalMediaUrl(url: string): boolean {
  try {
    const path = new URL(url, "http://x").pathname;
    return /^\/api\/projects\/[^/]+\/works\/[^/]+\/media\/scene\/\d+\/image$/.test(path);
  } catch {
    return false;
  }
}

/**
 * If image_url points to our media, fetch it with the request's auth and return a data URL
 * so the video provider can use it without hitting 401.
 */
async function resolveImageUrlForVideo(
  imageUrl: string,
  authHeader: string | undefined,
): Promise<string> {
  if (!isInternalMediaUrl(imageUrl)) return imageUrl;
  const path = new URL(imageUrl, "http://x").pathname;
  const backendBase =
    process.env.BACKEND_URL || `http://127.0.0.1:${process.env.PORT || 3001}`;
  const resolved = `${backendBase}${path}`;
  const headers: Record<string, string> = {};
  if (authHeader) headers.Authorization = authHeader;
  const res = await fetch(resolved, { headers });
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mime = res.headers.get("content-type") || "image/png";
  return `data:${mime};base64,${base64}`;
}

const StyleGuideSchema = z
  .object({
    tone: z.string().optional(),
    color_palette: z.array(z.string()).optional(),
    tempo: z.enum(["fast", "medium", "slow"]).optional(),
    camera_style: z.string().optional(),
    brand_voice: z.string().optional(),
    must_include: z.array(z.string()).optional(),
    must_avoid: z.array(z.string()).optional(),
  })
  .optional();

const ImageRequestSchema = z.object({
  prompt: z.string(),
  negative_prompt: z.string().default(""),
  image_instruction: z.string().optional(),
  styleGuide: StyleGuideSchema,
});

const VideoRequestSchema = z.object({
  image_url: z.string(),
  prompt: z.string(),
  duration: z.number().default(5),
  video_instruction: z.string().optional(),
  styleGuide: StyleGuideSchema,
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

router.post("/image", requireScope("ai:generate"), async (req, res, next) => {
  try {
    const providerId = req.headers["x-image-provider"] as string || "dalle";
    const rawModelId = req.headers["x-model-id"] as string | undefined;
    const apiKey = req.headers["x-api-key"] as string;

    if (!apiKey) {
      res.status(400).json({ error: "API key required (x-api-key header)" });
      return;
    }

    const { prompt, negative_prompt, image_instruction, styleGuide } =
      ImageRequestSchema.parse(req.body);
    const provider = getImageProvider(providerId);
    const modelId = resolveModelId(rawModelId, provider.models);

    let fullPrompt = "";
    if (styleGuide && !isStyleGuideEmpty(styleGuide as StyleGuide)) {
      const prefix = buildImageStylePrefix(styleGuide as StyleGuide);
      if (prefix) fullPrompt += prefix + "\n\n";
    }
    if (image_instruction?.trim()) fullPrompt += image_instruction.trim() + "\n\n";
    fullPrompt += prompt;

    console.log(`[generate/image] provider=${providerId} model=${modelId}`);
    console.log("[generate/image] full prompt:\n", fullPrompt);
    if (negative_prompt) console.log("[generate/image] negative_prompt:\n", negative_prompt);

    const imageUrl = await provider.generate(fullPrompt, negative_prompt, apiKey, modelId);

    console.log(`[generate/image] success, url length=${imageUrl.length}`);
    res.json({ imageUrl });
  } catch (err) {
    next(err);
  }
});

router.post("/video", requireScope("ai:generate"), async (req, res, next) => {
  try {
    const providerId = req.headers["x-video-provider"] as string || "runway";
    const rawModelId = req.headers["x-model-id"] as string | undefined;
    const apiKey = req.headers["x-api-key"] as string;

    if (!apiKey) {
      res.status(400).json({ error: "API key required (x-api-key header)" });
      return;
    }

    const { image_url, prompt, duration, video_instruction, styleGuide } =
      VideoRequestSchema.parse(req.body);
    const provider = getVideoProvider(providerId);
    const modelId = resolveModelId(rawModelId, provider.models);

    let fullPrompt = "";
    if (styleGuide && !isStyleGuideEmpty(styleGuide as StyleGuide)) {
      const prefix = buildVideoStylePrefix(styleGuide as StyleGuide);
      if (prefix) fullPrompt += prefix + "\n\n";
    }
    if (video_instruction?.trim()) fullPrompt += video_instruction.trim() + "\n\n";
    fullPrompt += prompt;

    const authHeader = req.headers.authorization as string | undefined;
    const resolvedImageUrl = await resolveImageUrlForVideo(image_url, authHeader);

    console.log(`[generate/video] provider=${providerId} model=${modelId} duration=${duration}s`);
    console.log("[generate/video] full prompt:\n", fullPrompt);

    const videoUrl = await provider.convert(resolvedImageUrl, fullPrompt, duration, apiKey, modelId);

    console.log(`[generate/video] success, url length=${videoUrl.length}`);
    res.json({ videoUrl });
  } catch (err) {
    next(err);
  }
});

export default router;
