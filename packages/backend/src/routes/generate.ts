import { Router } from "express";
import { z } from "zod";
import { getImageProvider, getVideoProvider } from "../providers/registry.js";
import { isStyleGuideEmpty } from "@autovio/shared";
import type { StyleGuide, AssetUsageMode, ProjectAsset } from "@autovio/shared";
import { DEFAULT_IMAGE_INSTRUCTION, DEFAULT_VIDEO_INSTRUCTION } from "@autovio/shared";
import { buildImageStylePrefix } from "../prompts/image.js";
import { buildVideoStylePrefix } from "../prompts/video.js";
import { authenticate, requireScope } from "../middleware/auth.js";
import { getAssetFilePath } from "../storage/assets.js";
import fs from "fs/promises";

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
    tempo: z.string().optional(), // Accept any string, validate to enum in code if needed
    camera_style: z.string().optional(),
    brand_voice: z.string().optional(),
    must_include: z.array(z.string()).optional(),
    must_avoid: z.array(z.string()).optional(),
  })
  .passthrough()
  .optional();

const ResolutionSchema = z.object({ width: z.number(), height: z.number() }).optional();

const ImageRequestSchema = z.object({
  prompt: z.string(),
  negative_prompt: z.string().default(""),
  image_instruction: z.string().optional(),
  styleGuide: StyleGuideSchema,
  resolution: ResolutionSchema,
});

const VideoRequestSchema = z.object({
  image_url: z.string(),
  prompt: z.string(),
  duration: z.number().default(5),
  video_instruction: z.string().optional(),
  styleGuide: StyleGuideSchema,
  resolution: ResolutionSchema,
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

/** Scene shape needed for generateSceneImageAndVideo (subset of ScenarioScene). */
export interface SceneForGeneration {
  image_prompt: string;
  negative_prompt?: string;
  video_prompt: string;
  duration_seconds?: number;
}

export interface GenerateSceneImageAndVideoOptions {
  imageInstruction?: string;
  videoInstruction?: string;
  styleGuide?: StyleGuide;
  apiKey: string;
  imageProviderId: string;
  imageModelId: string | undefined;
  videoProviderId: string;
  videoModelId: string | undefined;
  // Direct mode options
  assetUsageMode?: AssetUsageMode;
  selectedAssets?: ProjectAsset[];
  sceneIndex?: number;
  projectId?: string;
  resolution?: { width: number; height: number };
}

/**
 * Generate image for a scene, then generate video from that same image (UI flow).
 * The image returned by the image provider is passed directly to the video provider—no re-fetch.
 */
export async function generateSceneImageAndVideo(
  scene: SceneForGeneration,
  options: GenerateSceneImageAndVideoOptions,
): Promise<{ imageUrl: string; videoUrl: string }> {
  const {
    imageInstruction,
    videoInstruction,
    styleGuide,
    apiKey,
    imageProviderId,
    imageModelId,
    videoProviderId,
    videoModelId,
    assetUsageMode,
    selectedAssets,
    sceneIndex,
    projectId,
    resolution,
  } = options;

  let imageUrl: string;

  console.log(`🔍 [IMAGE GEN CHECK] assetUsageMode=${assetUsageMode}, selectedAssets=${selectedAssets?.length || 0}, projectId=${projectId}, sceneIndex=${sceneIndex}`);

  // DIRECT MODE: Skip image generation, use asset directly
  if (assetUsageMode === "direct" && selectedAssets && selectedAssets.length > 0 && projectId !== undefined && sceneIndex !== undefined) {
    const assetIndex = sceneIndex % selectedAssets.length;
    const asset = selectedAssets[assetIndex];
    
    console.log(`🎯 [DIRECT MODE IMAGE] Using asset ${assetIndex + 1}/${selectedAssets.length}: ${asset.name} (${asset.id})`);
    
    // Load asset file and convert to data URL
    const assetPath = await getAssetFilePath(projectId, asset.id);
    console.log(`🎯 [DIRECT MODE IMAGE] Asset path: ${assetPath}`);
    
    if (!assetPath) {
      throw new Error(`Asset file not found: ${asset.id}`);
    }
    
    const buffer = await fs.readFile(assetPath);
    const base64 = buffer.toString("base64");
    imageUrl = `data:${asset.mimeType};base64,${base64}`;
    
    console.log(`🎯 [DIRECT MODE IMAGE] Successfully loaded asset as data URL (${(buffer.length / 1024).toFixed(2)} KB)`);
  } else {
    console.log(`⚠️ [NORMAL IMAGE GEN] Mode: ${assetUsageMode}, Assets: ${selectedAssets?.length || 0}, ProjectId: ${projectId}, SceneIndex: ${sceneIndex}`);
    // NORMAL MODE or REFERENCE MODE: Generate image with AI
    const imageProvider = getImageProvider(imageProviderId);
    const imgModel = resolveModelId(imageModelId, imageProvider.models);

    let imageFullPrompt = "";
    if (styleGuide && !isStyleGuideEmpty(styleGuide)) {
      const prefix = buildImageStylePrefix(styleGuide);
      if (prefix) imageFullPrompt += prefix + "\n\n";
    }
    const imgInstr = imageInstruction?.trim() || DEFAULT_IMAGE_INSTRUCTION;
    imageFullPrompt += imgInstr + "\n\n";
    imageFullPrompt += scene.image_prompt;

    imageUrl = await imageProvider.generate(
      imageFullPrompt,
      scene.negative_prompt ?? "",
      apiKey,
      imgModel,
      resolution,
    );
  }

  const videoProvider = getVideoProvider(videoProviderId);
  const vidModel = resolveModelId(videoModelId, videoProvider.models);
  const duration = scene.duration_seconds ?? 5;

  let videoFullPrompt = "";
  if (styleGuide && !isStyleGuideEmpty(styleGuide)) {
    const prefix = buildVideoStylePrefix(styleGuide);
    if (prefix) videoFullPrompt += prefix + "\n\n";
  }
  const vidInstr = videoInstruction?.trim() || DEFAULT_VIDEO_INSTRUCTION;
  videoFullPrompt += vidInstr + "\n\n";
  videoFullPrompt += scene.video_prompt;

  const videoUrl = await videoProvider.convert(
    imageUrl,
    videoFullPrompt,
    duration,
    apiKey,
    vidModel,
    resolution,
  );

  return { imageUrl, videoUrl };
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

    console.log("[generate/image] raw body:", JSON.stringify(req.body, null, 2));

    const { prompt, negative_prompt, image_instruction, styleGuide, resolution } =
      ImageRequestSchema.parse(req.body);
    const provider = getImageProvider(providerId);
    const modelId = resolveModelId(rawModelId, provider.models);

    let fullPrompt = "";
    if (styleGuide && !isStyleGuideEmpty(styleGuide as StyleGuide)) {
      const prefix = buildImageStylePrefix(styleGuide as StyleGuide);
      if (prefix) fullPrompt += prefix + "\n\n";
    }
    const imageInstruction = image_instruction?.trim() || DEFAULT_IMAGE_INSTRUCTION;
    fullPrompt += imageInstruction + "\n\n";
    fullPrompt += prompt;

    console.log(`[generate/image] provider=${providerId} model=${modelId}`);
    console.log("[generate/image] full prompt:\n", fullPrompt);
    if (negative_prompt) console.log("[generate/image] negative_prompt:\n", negative_prompt);

    const imageUrl = await provider.generate(fullPrompt, negative_prompt, apiKey, modelId, resolution);

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

    const { image_url, prompt, duration, video_instruction, styleGuide, resolution } =
      VideoRequestSchema.parse(req.body);
    const provider = getVideoProvider(providerId);
    const modelId = resolveModelId(rawModelId, provider.models);

    let fullPrompt = "";
    if (styleGuide && !isStyleGuideEmpty(styleGuide as StyleGuide)) {
      const prefix = buildVideoStylePrefix(styleGuide as StyleGuide);
      if (prefix) fullPrompt += prefix + "\n\n";
    }
    const videoInstruction = video_instruction?.trim() || DEFAULT_VIDEO_INSTRUCTION;
    fullPrompt += videoInstruction + "\n\n";
    fullPrompt += prompt;

    const authHeader = req.headers.authorization as string | undefined;
    const resolvedImageUrl = await resolveImageUrlForVideo(image_url, authHeader);

    console.log(`[generate/video] provider=${providerId} model=${modelId} duration=${duration}s`);
    console.log("[generate/video] full prompt:\n", fullPrompt);

    const videoUrl = await provider.convert(resolvedImageUrl, fullPrompt, duration, apiKey, modelId, resolution);

    console.log(`[generate/video] success, url length=${videoUrl.length}`);
    res.json({ videoUrl });
  } catch (err) {
    next(err);
  }
});

export default router;
