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
  resolveSceneImagePath,
  resolveSceneVideoPath,
} from "../storage/works.js";
import { projectExists } from "../storage/projects.js";
import { workDir } from "../storage/path.js";

const router = Router({ mergeParams: true });
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 },
});

function getProjectId(req: Request): string {
  return String((req.params as { projectId?: string }).projectId ?? "");
}

function getWorkId(req: Request): string {
  return String((req.params as { workId?: string }).workId ?? "");
}

// List works
router.get("/", async (req, res, next) => {
  try {
    const projectId = getProjectId(req);
    if (!(await projectExists(projectId))) {
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
router.post("/", async (req, res, next) => {
  try {
    const projectId = getProjectId(req);
    if (!(await projectExists(projectId))) {
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
router.get("/:workId", async (req, res, next) => {
  try {
    const projectId = getProjectId(req);
    const workId = getWorkId(req);
    if (!(await projectExists(projectId))) {
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
router.put("/:workId", async (req, res, next) => {
  try {
    const projectId = getProjectId(req);
    const workId = getWorkId(req);
    const snapshot = req.body as WorkSnapshot;
    if (snapshot.projectId !== projectId || snapshot.id !== workId) {
      res.status(400).json({ error: "ID mismatch" });
      return;
    }
    if (!(await projectExists(projectId))) {
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
router.delete("/:workId", async (req, res, next) => {
  try {
    const projectId = getProjectId(req);
    const workId = getWorkId(req);
    if (!(await projectExists(projectId))) {
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

router.post("/:workId/media/reference", upload.single("video"), async (req, res, next) => {
  try {
    const projectId = getProjectId(req);
    const workId = getWorkId(req);
    if (!(await projectExists(projectId))) {
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

router.get("/:workId/media/reference", async (req, res, next) => {
  try {
    const projectId = getProjectId(req);
    const workId = getWorkId(req);
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

router.post("/:workId/media/scene/:index/image", upload.single("file"), async (req, res, next) => {
  try {
    const projectId = getProjectId(req);
    const workId = getWorkId(req);
    const index = String(req.params.index ?? "0");
    const i = parseInt(index, 10);
    if (Number.isNaN(i) || i < 0) {
      res.status(400).json({ error: "Invalid scene index" });
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

router.post("/:workId/media/scene/:index/video", upload.single("file"), async (req, res, next) => {
  try {
    const projectId = getProjectId(req);
    const workId = getWorkId(req);
    const index = String(req.params.index ?? "0");
    const i = parseInt(index, 10);
    if (Number.isNaN(i) || i < 0) {
      res.status(400).json({ error: "Invalid scene index" });
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

router.get("/:workId/media/scene/:index/image", async (req, res, next) => {
  try {
    const projectId = getProjectId(req);
    const workId = getWorkId(req);
    const index = String(req.params.index ?? "0");
    const i = parseInt(index, 10);
    if (Number.isNaN(i) || i < 0) {
      res.status(400).json({ error: "Invalid scene index" });
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

router.get("/:workId/media/scene/:index/video", async (req, res, next) => {
  try {
    const projectId = getProjectId(req);
    const workId = getWorkId(req);
    const index = String(req.params.index ?? "0");
    const i = parseInt(index, 10);
    if (Number.isNaN(i) || i < 0) {
      res.status(400).json({ error: "Invalid scene index" });
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

export default router;
