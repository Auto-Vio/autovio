import { Router } from "express";
import type { Project } from "@viragen/shared";
import {
  listProjects,
  getProject,
  saveProject,
  createProject,
  deleteProject,
  projectExists,
} from "../storage/projects.js";

const router = Router();

// List projects
router.get("/", async (_req, res, next) => {
  try {
    const projects = await listProjects();
    res.json(projects);
  } catch (e) {
    next(e);
  }
});

// Get project (meta + systemPrompt + knowledge)
router.get("/:id", async (req, res, next) => {
  try {
    const id = String(req.params.id ?? "");
    const project = await getProject(id);
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
router.post("/", async (req, res, next) => {
  try {
    const name = (req.body?.name as string) || "Yeni Proje";
    const project = await createProject(name);
    res.status(201).json(project);
  } catch (e) {
    next(e);
  }
});

// Update project (name, systemPrompt, knowledge)
router.put("/:id", async (req, res, next) => {
  try {
    const id = String(req.params.id ?? "");
    const project = req.body as Project;
    if (project.id !== id) {
      res.status(400).json({ error: "ID mismatch" });
      return;
    }
    if (!(await projectExists(id))) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    await saveProject(project);
    res.json(project);
  } catch (e) {
    next(e);
  }
});

// Delete project
router.delete("/:id", async (req, res, next) => {
  try {
    const id = String(req.params.id ?? "");
    if (!(await projectExists(id))) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    await deleteProject(id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;
