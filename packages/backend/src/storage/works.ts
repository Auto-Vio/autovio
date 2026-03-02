import fs from "fs/promises";
import type { WorkMeta, WorkSnapshot } from "@viragen/shared";
import { DEFAULT_IMAGE_INSTRUCTION, DEFAULT_VIDEO_INSTRUCTION } from "@viragen/shared";
import {
  workDir,
  referenceVideoPath,
  sceneImagePath,
  sceneVideoPath,
  sceneImageBasePath,
  sceneVideoBasePath,
  sceneImageReadExtensions,
  sceneVideoReadExtensions,
  workAudioPath,
  resolveWorkAudioPath,
} from "./path.js";
import { getProject } from "./projects.js";
import { WorkModel, toWorkSnapshot } from "../db/index.js";

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

export async function listWorks(projectId: string): Promise<WorkMeta[]> {
  const docs = await WorkModel.find({ projectId }).sort({ updatedAt: -1 }).lean();
  return docs.map((doc) => ({
    id: doc._id,
    projectId: doc.projectId,
    name: doc.name,
    updatedAt: doc.updatedAt,
  }));
}

export async function getWork(projectId: string, workId: string): Promise<WorkSnapshot | null> {
  const doc = await WorkModel.findOne({ _id: workId, projectId });
  if (!doc) return null;
  return toWorkSnapshot(doc);
}

export async function saveWork(projectId: string, snapshot: WorkSnapshot): Promise<void> {
  if (snapshot.projectId !== projectId) throw new Error("projectId mismatch");
  const dir = workDir(projectId, snapshot.id);
  await ensureDir(dir);

  await WorkModel.findByIdAndUpdate(
    snapshot.id,
    {
      _id: snapshot.id,
      projectId: snapshot.projectId,
      name: snapshot.name,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      systemPrompt: snapshot.systemPrompt,
      analyzerPrompt: snapshot.analyzerPrompt ?? "",
      imageSystemPrompt: snapshot.imageSystemPrompt ?? "",
      videoSystemPrompt: snapshot.videoSystemPrompt ?? "",
      currentStep: snapshot.currentStep,
      hasReferenceVideo: snapshot.hasReferenceVideo,
      mode: snapshot.mode,
      productName: snapshot.productName,
      productDescription: snapshot.productDescription,
      targetAudience: snapshot.targetAudience,
      language: snapshot.language,
      videoDuration: snapshot.videoDuration,
      sceneCount: snapshot.sceneCount,
      analysis: snapshot.analysis,
      scenes: snapshot.scenes,
      generatedScenes: snapshot.generatedScenes,
      editorState: snapshot.editorState,
    },
    { upsert: true, new: true }
  );
}

export async function createWork(projectId: string, name?: string): Promise<WorkSnapshot> {
  const project = await getProject(projectId);
  if (!project) throw new Error("Project not found");

  const id = "work_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
  const now = Date.now();
  const snapshot: WorkSnapshot = {
    id,
    projectId,
    name: name || "Yeni Çalışma",
    createdAt: now,
    updatedAt: now,
    systemPrompt: project.systemPrompt,
    analyzerPrompt: project.analyzerPrompt ?? "",
    imageSystemPrompt: (project.imageSystemPrompt?.trim() || DEFAULT_IMAGE_INSTRUCTION),
    videoSystemPrompt: (project.videoSystemPrompt?.trim() || DEFAULT_VIDEO_INSTRUCTION),
    currentStep: 0,
    hasReferenceVideo: false,
    mode: "style_transfer",
    productName: "",
    productDescription: "",
    targetAudience: "",
    language: "",
    videoDuration: undefined,
    sceneCount: undefined,
    analysis: null,
    scenes: [],
    generatedScenes: [],
  };
  await saveWork(projectId, snapshot);
  return snapshot;
}

export async function deleteWork(projectId: string, workId: string): Promise<void> {
  const dir = workDir(projectId, workId);
  try {
    await fs.rm(dir, { recursive: true });
  } catch {
    // ignore
  }
  await WorkModel.findOneAndDelete({ _id: workId, projectId });
}

export function getReferenceVideoPath(projectId: string, workId: string): string {
  return referenceVideoPath(projectId, workId);
}

export function getSceneImagePath(projectId: string, workId: string, index: number, mime?: string): string {
  return sceneImagePath(projectId, workId, index, mime);
}

export function getSceneVideoPath(projectId: string, workId: string, index: number, mime?: string): string {
  return sceneVideoPath(projectId, workId, index, mime);
}

export function getWorkAudioPath(projectId: string, workId: string, ext?: string): string {
  return workAudioPath(projectId, workId, ext);
}

export async function getResolvedWorkAudioPath(projectId: string, workId: string): Promise<string | null> {
  return resolveWorkAudioPath(projectId, workId);
}

export async function workExists(projectId: string, workId: string): Promise<boolean> {
  const count = await WorkModel.countDocuments({ _id: workId, projectId });
  return count > 0;
}

export async function resolveSceneImagePath(projectId: string, workId: string, index: number): Promise<string | null> {
  const base = sceneImageBasePath(projectId, workId, index);
  for (const ext of sceneImageReadExtensions()) {
    const p = base + (ext === "bin" ? "" : "." + ext);
    try {
      await fs.access(p);
      return p;
    } catch {
      continue;
    }
  }
  return null;
}

export async function resolveSceneVideoPath(projectId: string, workId: string, index: number): Promise<string | null> {
  const base = sceneVideoBasePath(projectId, workId, index);
  for (const ext of sceneVideoReadExtensions()) {
    const p = base + (ext === "bin" ? "" : "." + ext);
    try {
      await fs.access(p);
      return p;
    } catch {
      continue;
    }
  }
  return null;
}

export async function deleteWorksByProject(projectId: string): Promise<void> {
  await WorkModel.deleteMany({ projectId });
}
