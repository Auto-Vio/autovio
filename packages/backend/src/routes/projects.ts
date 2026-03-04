import { Router } from "express";
import type { Project } from "@autovio/shared";
import {
  listProjects,
  getProject,
  saveProject,
  createProject,
  deleteProject,
  projectExists,
} from "../storage/projects.js";
import { authenticate, requireScope } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

// List projects
router.get("/", requireScope("projects:read"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projects = await listProjects(userId);
    res.json(projects);
  } catch (e) {
    next(e);
  }
});

// Get project (meta + systemPrompt + knowledge)
router.get("/:id", requireScope("projects:read"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id ?? "");
    const project = await getProject(id, userId);
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.json(project);
  } catch (e) {
    next(e);
  }
});

// Create project
router.post("/", requireScope("projects:write"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const name = (req.body?.name as string) || "Yeni Proje";
    const project = await createProject(name, userId);
    res.status(201).json(project);
  } catch (e) {
    next(e);
  }
});

// Update project (name, systemPrompt, knowledge)
router.put("/:id", requireScope("projects:write"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id ?? "");
    const project = req.body as Project;
    if (project.id !== id) {
      res.status(400).json({ error: "ID mismatch" });
      return;
    }
    if (!(await projectExists(id, userId))) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    project.userId = userId;
    await saveProject(project, userId);
    res.json(project);
  } catch (e) {
    next(e);
  }
});

// Delete project
router.delete("/:id", requireScope("projects:write"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id ?? "");
    const deleted = await deleteProject(id, userId);
    if (!deleted) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;
