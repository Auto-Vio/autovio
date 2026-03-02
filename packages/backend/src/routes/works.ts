import { Router, type Request } from "express";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import type { WorkSnapshot } from "@viragen/shared";
import {
  listWorks,
  getWork,
  saveWork,
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
import { projectExists } from "../storage/projects.js";
import { workDir } from "../storage/path.js";
import { authenticate, requireScope } from "../middleware/auth.js";

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

// Create work (copies project's systemPrompt)
router.post("/", requireScope("works:write"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = getProjectId(req);
    if (!(await projectExists(projectId, userId))) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    const name = (req.body?.name as string) || "Yeni Çalışma";
    const work = await createWork(projectId, name);
    res.status(201).json(work);
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
