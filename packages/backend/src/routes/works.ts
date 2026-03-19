import { Router, type Request } from "express";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import type { WorkSnapshot, EditorStateSnapshot } from "@autovio/shared";
import {
  listWorks,
  getWork,
  saveWork,
  updateWorkScenes,
  createWork,
  deleteWork,
  workExists,
  getReferenceVideoPath,
  getSceneImagePath,
  getSceneVideoPath,
  getWorkAudioPath,
  getResolvedWorkAudioPath,
  resolveSceneImagePath,
  resolveSceneVideoPath,
} from "../storage/works.js";
import { projectExists, getProject } from "../storage/projects.js";
import { getTemplate } from "../storage/templates.js";
import { workDir } from "../storage/path.js";
import { authenticate, requireScope } from "../middleware/auth.js";
import { generateScenario } from "./scenario.js";
import { generateSceneImageAndVideo } from "./generate.js";
import { getWorkAssets } from "../utils/asset-integration.js";
import { applyTemplateLogic } from "./templates.js";

const router = Router({ mergeParams: true });
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 },
});

router.use(authenticate);

function getProjectId(req: Request): string {
  return String((req.params as { projectId?: string }).projectId ?? "");
}

function getWorkId(req: Request): string {
  return String((req.params as { workId?: string }).workId ?? "");
}

function defaultEditorState(resolution?: { width: number; height: number }): EditorStateSnapshot {
  return {
    editorData: {
      videoTrack: [],
      textTrack: [],
      imageTrack: [],
      audioTrack: [],
    },
    textOverlays: {},
    imageOverlays: {},
    audioVolume: 1,
    exportSettings: {
      width: resolution?.width ?? 1080,
      height: resolution?.height ?? 1920,
      fps: 30,
    },
  };
}

function mergeTemplateIntoEditorState(
  editorState: EditorStateSnapshot,
  result: ReturnType<typeof applyTemplateLogic>
): EditorStateSnapshot {
  const textTrack = [...(editorState.editorData.textTrack ?? []), ...result.textTrackActions];
  const imageTrack = [...(editorState.editorData.imageTrack ?? []), ...result.imageTrackActions];
  return {
    ...editorState,
    editorData: {
      ...editorState.editorData,
      textTrack,
      imageTrack,
    },
    textOverlays: { ...editorState.textOverlays, ...result.textOverlays },
    imageOverlays: { ...(editorState.imageOverlays ?? {}), ...result.imageOverlays },
    exportSettings: result.exportSettings ?? editorState.exportSettings,
  };
}

// List works
router.get("/", requireScope("works:read"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = getProjectId(req);
    if (!(await projectExists(projectId, userId))) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    const works = await listWorks(projectId);
    res.json(works);
  } catch (e) {
    next(e);
  }
});

// Create work (all CreateWorkRequest body fields are applied)
router.post("/", requireScope("works:write"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = getProjectId(req);
    if (!(await projectExists(projectId, userId))) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    const body = req.body ?? {};
    const name = (body.name as string) || "Yeni Çalışma";
    const resolution = body.resolution as { width: number; height: number } | undefined;
    const work = await createWork(projectId, name, {
      mode: body.mode,
      productName: body.productName,
      productDescription: body.productDescription,
      targetAudience: body.targetAudience,
      language: body.language,
      videoDuration: body.videoDuration,
      sceneCount: body.sceneCount,
      resolution,
    });
    res.status(201).json(work);
  } catch (e) {
    next(e);
  }
});

// Generate scenario from work (same logic as UI "Build Scenario")
router.post("/:workId/scenario", requireScope("ai:generate"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = getProjectId(req);
    const workId = getWorkId(req);
    const apiKey = req.headers["x-api-key"] as string;
    if (!apiKey) {
      res.status(400).json({ error: "API key required (x-api-key header)" });
      return;
    }
    if (!(await projectExists(projectId, userId))) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    const project = await getProject(projectId, userId);
    const work = await getWork(projectId, workId);
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    if (!work) {
      res.status(404).json({ error: "Work not found" });
      return;
    }
    // Load selected assets
    const selectedAssets = await getWorkAssets(projectId, work.selectedAssetIds);
    
    // Auto-set scene count for Direct mode
    let sceneCount = work.sceneCount;
    if (work.assetUsageMode === "direct" && selectedAssets.length > 0) {
      sceneCount = selectedAssets.length;
      console.log(`🎯 [DIRECT MODE] Auto-setting scene count to ${sceneCount} (${selectedAssets.length} assets selected)`);
    }
    
    console.log(`🎯 [SCENARIO] Mode: ${work.assetUsageMode}, Assets: ${selectedAssets.length}, Scene Count: ${sceneCount}`);
    
    const intent = {
      mode: work.mode,
      product_name: work.productName || undefined,
      product_description: work.productDescription || undefined,
      target_audience: work.targetAudience || undefined,
      language: work.language || undefined,
      video_duration: work.videoDuration,
      scene_count: sceneCount,
    };
    const providerId = (req.headers["x-llm-provider"] as string) || "gemini";
    const modelId = req.headers["x-model-id"] as string | undefined;
    const scenes = await generateScenario(
      work.analysis,
      intent,
      {
        systemPrompt: work.systemPrompt,
        knowledge: project.knowledge,
        styleGuide: project.styleGuide,
        selectedAssets,
        assetUsageMode: work.assetUsageMode,
      },
      apiKey,
      providerId,
      modelId
    );
    const updated = await updateWorkScenes(projectId, workId, scenes);
    if (!updated) {
      res.status(404).json({ error: "Work not found" });
      return;
    }
    res.json({ scenes });
  } catch (e) {
    next(e);
  }
});

/** Write a data URL (e.g. data:image/png;base64,...) to a file path. */
async function writeDataUrlToFile(dataUrl: string, destPath: string): Promise<void> {
  const match = dataUrl.match(/^data:(.+?);base64,(.+)$/);
  if (!match) throw new Error("Invalid data URL");
  const buffer = Buffer.from(match[2], "base64");
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.writeFile(destPath, buffer);
}

// Generate image then video for one scene (same flow as UI: same image sent to video AI)
router.post("/:workId/generate/scene/:sceneIndex", requireScope("ai:generate"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = getProjectId(req);
    const workId = getWorkId(req);
    const sceneIndex = parseInt(String(req.params.sceneIndex ?? "0"), 10);
    if (Number.isNaN(sceneIndex) || sceneIndex < 0) {
      res.status(400).json({ error: "Invalid scene index" });
      return;
    }
    const apiKey = req.headers["x-api-key"] as string;
    if (!apiKey) {
      res.status(400).json({ error: "API key required (x-api-key header)" });
      return;
    }
    if (!(await projectExists(projectId, userId))) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    const project = await getProject(projectId, userId);
    const work = await getWork(projectId, workId);
    if (!project || !work) {
      res.status(404).json({ error: "Project or work not found" });
      return;
    }
    const scene = work.scenes?.[sceneIndex];
    if (!scene) {
      res.status(404).json({ error: "Scene not found or scenario not generated" });
      return;
    }
    const imageProviderId = (req.headers["x-image-provider"] as string) || "gemini";
    const imageModelId = (req.headers["x-image-model-id"] as string) || (req.headers["x-model-id"] as string);
    const videoProviderId = (req.headers["x-video-provider"] as string) || "gemini";
    const videoModelId = (req.headers["x-video-model-id"] as string) || (req.headers["x-model-id"] as string);

    // Load selected assets for Direct mode
    const selectedAssets = await getWorkAssets(projectId, work.selectedAssetIds);
    
    console.log(`[GENERATE SCENE ${sceneIndex}] Mode: ${work.assetUsageMode}, Assets loaded: ${selectedAssets.length}, Scene index: ${sceneIndex}`);

    const { imageUrl: imageDataUrl, videoUrl: videoDataUrl } = await generateSceneImageAndVideo(
      {
        image_prompt: scene.image_prompt,
        negative_prompt: scene.negative_prompt ?? undefined,
        video_prompt: scene.video_prompt,
        duration_seconds: scene.duration_seconds,
      },
      {
        imageInstruction: work.imageSystemPrompt?.trim() || undefined,
        videoInstruction: work.videoSystemPrompt?.trim() || undefined,
        styleGuide: project.styleGuide ?? undefined,
        apiKey,
        imageProviderId,
        imageModelId,
        videoProviderId,
        videoModelId,
        assetUsageMode: work.assetUsageMode,
        selectedAssets,
        sceneIndex,
        projectId,
        resolution: work.resolution,
      },
    );

    const imageMime = imageDataUrl.match(/^data:(.+?);base64,/)?.[1] || "image/png";
    const videoMime = videoDataUrl.match(/^data:(.+?);base64,/)?.[1] || "video/mp4";
    const imageDest = getSceneImagePath(projectId, workId, sceneIndex, imageMime);
    const videoDest = getSceneVideoPath(projectId, workId, sceneIndex, videoMime);
    await writeDataUrlToFile(imageDataUrl, imageDest);
    await writeDataUrlToFile(videoDataUrl, videoDest);

    const base = `/api/projects/${projectId}/works/${workId}/media/scene/${sceneIndex}`;
    const mediaImageUrl = `${base}/image`;
    const mediaVideoUrl = `${base}/video`;

    const generatedScenes = Array.from(work.generatedScenes ?? []);
    while (generatedScenes.length <= sceneIndex) {
      generatedScenes.push({
        sceneIndex: generatedScenes.length,
        status: "pending",
      });
    }
    generatedScenes[sceneIndex] = {
      sceneIndex,
      imageUrl: mediaImageUrl,
      videoUrl: mediaVideoUrl,
      status: "done",
    };
    const updatedWork: WorkSnapshot = {
      ...work,
      generatedScenes,
      updatedAt: Date.now(),
    };
    await saveWork(projectId, updatedWork);

    res.json({ imageUrl: mediaImageUrl, videoUrl: mediaVideoUrl });
  } catch (e) {
    next(e);
  }
});

// Get work
router.get("/:workId", requireScope("works:read"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = getProjectId(req);
    const workId = getWorkId(req);
    if (!(await projectExists(projectId, userId))) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    const work = await getWork(projectId, workId);
    if (!work) {
      res.status(404).json({ error: "Work not found" });
      return;
    }
    res.json(work);
  } catch (e) {
    next(e);
  }
});

// Save work
router.put("/:workId", requireScope("works:write"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = getProjectId(req);
    const workId = getWorkId(req);
    const snapshot = req.body as WorkSnapshot;
    if (snapshot.projectId !== projectId || snapshot.id !== workId) {
      res.status(400).json({ error: "ID mismatch" });
      return;
    }
    if (!(await projectExists(projectId, userId))) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    if (!(await workExists(projectId, workId))) {
      res.status(404).json({ error: "Work not found" });
      return;
    }
    await saveWork(projectId, snapshot);
    res.json(snapshot);
  } catch (e) {
    next(e);
  }
});

// Apply template to work and persist (automated: apply + save editorState)
router.post("/:workId/apply-template", requireScope("works:write"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = getProjectId(req);
    const workId = getWorkId(req);
    const body = (req.body ?? {}) as { templateId?: string; placeholderValues?: Record<string, string> };
    const templateId = body.templateId;
    if (!templateId || typeof templateId !== "string") {
      res.status(400).json({ error: "templateId is required" });
      return;
    }
    if (!(await projectExists(projectId, userId))) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    if (!(await workExists(projectId, workId))) {
      res.status(404).json({ error: "Work not found" });
      return;
    }
    const work = await getWork(projectId, workId);
    if (!work) {
      res.status(404).json({ error: "Work not found" });
      return;
    }
    const template = await getTemplate(projectId, templateId, userId);
    if (!template) {
      res.status(404).json({ error: "Template not found" });
      return;
    }
    const videoDuration =
      work.videoDuration ??
      (work.scenes?.length
        ? work.scenes.reduce((s, sc) => s + (sc.duration_seconds ?? 5), 0)
        : undefined) ??
      10;
    const result = applyTemplateLogic(template, videoDuration, body.placeholderValues);
    const baseEditorState = work.editorState ?? defaultEditorState(work.resolution);
    const mergedEditorState = mergeTemplateIntoEditorState(baseEditorState, result);
    const updatedWork: WorkSnapshot = {
      ...work,
      editorState: mergedEditorState,
      updatedAt: Date.now(),
    };
    await saveWork(projectId, updatedWork);
    const saved = await getWork(projectId, workId);
    res.json(saved ?? updatedWork);
  } catch (e) {
    next(e);
  }
});

// Delete work
router.delete("/:workId", requireScope("works:write"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = getProjectId(req);
    const workId = getWorkId(req);
    if (!(await projectExists(projectId, userId))) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    if (!(await workExists(projectId, workId))) {
      res.status(404).json({ error: "Work not found" });
      return;
    }
    await deleteWork(projectId, workId);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

// --- Media ---

router.post("/:workId/media/reference", requireScope("works:write"), upload.single("video"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = getProjectId(req);
    const workId = getWorkId(req);
    if (!(await projectExists(projectId, userId))) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    if (!(await workExists(projectId, workId))) {
      res.status(404).json({ error: "Work not found" });
      return;
    }
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No video file" });
      return;
    }
    const dest = getReferenceVideoPath(projectId, workId);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, file.buffer);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

router.get("/:workId/media/reference", requireScope("works:read"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = getProjectId(req);
    const workId = getWorkId(req);
    if (!(await projectExists(projectId, userId))) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    const dest = getReferenceVideoPath(projectId, workId);
    try {
      await fs.access(dest);
    } catch {
      res.status(404).json({ error: "Reference video not found" });
      return;
    }
    res.sendFile(path.resolve(dest), { headers: { "Content-Type": "video/mp4" } }, (err) => {
      if (err) next(err);
    });
  } catch (e) {
    next(e);
  }
});

router.post("/:workId/media/scene/:index/image", requireScope("works:write"), upload.single("file"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = getProjectId(req);
    const workId = getWorkId(req);
    const index = String(req.params.index ?? "0");
    const i = parseInt(index, 10);
    if (Number.isNaN(i) || i < 0) {
      res.status(400).json({ error: "Invalid scene index" });
      return;
    }
    if (!(await projectExists(projectId, userId))) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    if (!(await workExists(projectId, workId))) {
      res.status(404).json({ error: "Work not found" });
      return;
    }
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No file" });
      return;
    }
    const dest = getSceneImagePath(projectId, workId, i, file.mimetype);
    await fs.mkdir(workDir(projectId, workId), { recursive: true });
    await fs.writeFile(dest, file.buffer);
    res.json({ ok: true, url: `/api/projects/${projectId}/works/${workId}/media/scene/${i}/image` });
  } catch (e) {
    next(e);
  }
});

router.post("/:workId/media/scene/:index/video", requireScope("works:write"), upload.single("file"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = getProjectId(req);
    const workId = getWorkId(req);
    const index = String(req.params.index ?? "0");
    const i = parseInt(index, 10);
    if (Number.isNaN(i) || i < 0) {
      res.status(400).json({ error: "Invalid scene index" });
      return;
    }
    if (!(await projectExists(projectId, userId))) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    if (!(await workExists(projectId, workId))) {
      res.status(404).json({ error: "Work not found" });
      return;
    }
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No file" });
      return;
    }
    const dest = getSceneVideoPath(projectId, workId, i, file.mimetype);
    await fs.mkdir(workDir(projectId, workId), { recursive: true });
    await fs.writeFile(dest, file.buffer);
    res.json({ ok: true, url: `/api/projects/${projectId}/works/${workId}/media/scene/${i}/video` });
  } catch (e) {
    next(e);
  }
});

router.get("/:workId/media/scene/:index/image", requireScope("works:read"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = getProjectId(req);
    const workId = getWorkId(req);
    const index = String(req.params.index ?? "0");
    const i = parseInt(index, 10);
    if (Number.isNaN(i) || i < 0) {
      res.status(400).json({ error: "Invalid scene index" });
      return;
    }
    if (!(await projectExists(projectId, userId))) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    const filePath = await resolveSceneImagePath(projectId, workId, i);
    if (!filePath) {
      res.status(404).json({ error: "Scene image not found" });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const mime = ext === ".png" ? "image/png" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : ext === ".webp" ? "image/webp" : "application/octet-stream";
    res.sendFile(path.resolve(filePath), { headers: { "Content-Type": mime } }, (err) => {
      if (err) next(err);
    });
  } catch (e) {
    next(e);
  }
});

router.get("/:workId/media/scene/:index/video", requireScope("works:read"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = getProjectId(req);
    const workId = getWorkId(req);
    const index = String(req.params.index ?? "0");
    const i = parseInt(index, 10);
    if (Number.isNaN(i) || i < 0) {
      res.status(400).json({ error: "Invalid scene index" });
      return;
    }
    if (!(await projectExists(projectId, userId))) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    const filePath = await resolveSceneVideoPath(projectId, workId, i);
    if (!filePath) {
      res.status(404).json({ error: "Scene video not found" });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const mime = ext === ".mp4" ? "video/mp4" : ext === ".webm" ? "video/webm" : "application/octet-stream";
    res.sendFile(path.resolve(filePath), { headers: { "Content-Type": mime } }, (err) => {
      if (err) next(err);
    });
  } catch (e) {
    next(e);
  }
});

const AUDIO_MIME_EXT: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/wav": "wav",
  "audio/ogg": "ogg",
  "audio/webm": "webm",
};

router.post("/:workId/media/audio", requireScope("works:write"), upload.single("audio"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = getProjectId(req);
    const workId = getWorkId(req);
    if (!(await projectExists(projectId, userId))) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    if (!(await workExists(projectId, workId))) {
      res.status(404).json({ error: "Work not found" });
      return;
    }
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No audio file" });
      return;
    }
    const ext = AUDIO_MIME_EXT[file.mimetype] ?? "mp3";
    const dest = getWorkAudioPath(projectId, workId, ext);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, file.buffer);
    const audioUrl = `/api/projects/${projectId}/works/${workId}/media/audio`;
    res.json({ ok: true, audioUrl });
  } catch (e) {
    next(e);
  }
});

router.get("/:workId/media/audio", requireScope("works:read"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = getProjectId(req);
    const workId = getWorkId(req);
    if (!(await projectExists(projectId, userId))) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    const filePath = await getResolvedWorkAudioPath(projectId, workId);
    if (!filePath) {
      res.status(404).json({ error: "Audio not found" });
      return;
    }
    const ext = path.extname(filePath).toLowerCase().slice(1);
    const mime = ext === "mp3" ? "audio/mpeg" : ext === "m4a" ? "audio/mp4" : ext === "wav" ? "audio/wav" : ext === "ogg" ? "audio/ogg" : "audio/webm";
    res.sendFile(path.resolve(filePath), { headers: { "Content-Type": mime } }, (err) => {
      if (err) next(err);
    });
  } catch (e) {
    next(e);
  }
});

export default router;
