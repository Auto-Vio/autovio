import fs from "fs/promises";
import type { Project, ProjectMeta } from "@autovio/shared";
import {
  DEFAULT_SCENARIO_SYSTEM_PROMPT,
  DEFAULT_IMAGE_INSTRUCTION,
  DEFAULT_VIDEO_INSTRUCTION,
} from "@autovio/shared";
import { ProjectModel, toProject, WorkModel, AssetModel } from "../db/index.js";
import { projectDir } from "./path.js";

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

export async function listProjects(userId: string): Promise<ProjectMeta[]> {
  const docs = await ProjectModel.find({ userId }).sort({ updatedAt: -1 }).lean();
  return docs.map((doc) => ({
    id: doc._id,
    userId: doc.userId,
    name: doc.name,
    updatedAt: doc.updatedAt,
  }));
}

export async function getProject(id: string, userId?: string): Promise<Project | null> {
  const query: { _id: string; userId?: string } = { _id: id };
  if (userId) query.userId = userId;
  const doc = await ProjectModel.findOne(query);
  if (!doc) return null;
  return toProject(doc);
}

export async function saveProject(project: Project, userId?: string): Promise<void> {
  const dir = projectDir(project.id);
  await ensureDir(dir);

  const updateData: Record<string, unknown> = {
    _id: project.id,
    userId: project.userId,
    name: project.name,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    systemPrompt: project.systemPrompt,
    knowledge: project.knowledge,
    analyzerPrompt: project.analyzerPrompt ?? "",
    imageSystemPrompt: project.imageSystemPrompt ?? "",
    videoSystemPrompt: project.videoSystemPrompt ?? "",
    styleGuide: project.styleGuide ?? null,
  };

  const filter: { _id: string; userId?: string } = { _id: project.id };
  if (userId) filter.userId = userId;

  await ProjectModel.findOneAndUpdate(filter, updateData, { upsert: true, new: true });
}

export async function createProject(name: string, userId: string): Promise<Project> {
  const id = "proj_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
  const now = Date.now();
  const project: Project = {
    id,
    userId,
    name: name || "Yeni Proje",
    createdAt: now,
    updatedAt: now,
    systemPrompt: DEFAULT_SCENARIO_SYSTEM_PROMPT,
    knowledge: "",
    analyzerPrompt: "",
    imageSystemPrompt: DEFAULT_IMAGE_INSTRUCTION,
    videoSystemPrompt: DEFAULT_VIDEO_INSTRUCTION,
  };
  await saveProject(project);
  return project;
}

export async function deleteProject(id: string, userId?: string): Promise<boolean> {
  const filter: { _id: string; userId?: string } = { _id: id };
  if (userId) filter.userId = userId;

  const result = await ProjectModel.findOneAndDelete(filter);
  if (!result) return false;

  const dir = projectDir(id);
  try {
    await fs.rm(dir, { recursive: true });
  } catch {
    // ignore if not exists
  }
  await WorkModel.deleteMany({ projectId: id });
  await AssetModel.deleteMany({ projectId: id });
  return true;
}

export async function projectExists(id: string, userId?: string): Promise<boolean> {
  const filter: { _id: string; userId?: string } = { _id: id };
  if (userId) filter.userId = userId;
  const count = await ProjectModel.countDocuments(filter);
  return count > 0;
}
