import fs from "fs/promises";
import path from "path";
import type { Project, WorkMeta, WorkSnapshot } from "@viragen/shared";
import {
  projectDir,
  workDir,
  workJsonPath,
  referenceVideoPath,
  sceneImagePath,
  sceneVideoPath,
  sceneImageBasePath,
  sceneVideoBasePath,
  sceneImageReadExtensions,
  sceneVideoReadExtensions,
} from "./path.js";
import { getProject } from "./projects.js";

const WORKS_INDEX = "works_index.json";

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function readWorksIndex(projectId: string): Promise<WorkMeta[]> {
  const indexPath = path.join(projectDir(projectId), WORKS_INDEX);
  try {
    const raw = await fs.readFile(indexPath, "utf-8");
    const data = JSON.parse(raw) as { works?: WorkMeta[] };
    return Array.isArray(data?.works) ? data.works : [];
  } catch {
    return [];
  }
}

async function writeWorksIndex(projectId: string, works: WorkMeta[]): Promise<void> {
  await ensureDir(projectDir(projectId));
  const indexPath = path.join(projectDir(projectId), WORKS_INDEX);
  await fs.writeFile(
    indexPath,
    JSON.stringify({ works: works.sort((a, b) => b.updatedAt - a.updatedAt) }, null, 2),
    "utf-8"
  );
}

export async function listWorks(projectId: string): Promise<WorkMeta[]> {
  return readWorksIndex(projectId);
}

export async function getWork(projectId: string, workId: string): Promise<WorkSnapshot | null> {
  const p = workJsonPath(projectId, workId);
  try {
    const raw = await fs.readFile(p, "utf-8");
    return JSON.parse(raw) as WorkSnapshot;
  } catch {
    return null;
  }
}

export async function saveWork(projectId: string, snapshot: WorkSnapshot): Promise<void> {
  if (snapshot.projectId !== projectId) throw new Error("projectId mismatch");
  const dir = workDir(projectId, snapshot.id);
  await ensureDir(dir);
  await fs.writeFile(workJsonPath(projectId, snapshot.id), JSON.stringify(snapshot, null, 2), "utf-8");

  const works = await readWorksIndex(projectId);
  const meta: WorkMeta = {
    id: snapshot.id,
    projectId,
    name: snapshot.name,
    updatedAt: snapshot.updatedAt,
  };
  const idx = works.findIndex((w) => w.id === snapshot.id);
  if (idx >= 0) works[idx] = meta;
  else works.unshift(meta);
  await writeWorksIndex(projectId, works);
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
    imageSystemPrompt: project.imageSystemPrompt ?? "",
    videoSystemPrompt: project.videoSystemPrompt ?? "",
    currentStep: 0,
    hasReferenceVideo: true,
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
  const works = (await readWorksIndex(projectId)).filter((w) => w.id !== workId);
  await writeWorksIndex(projectId, works);
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

export async function workExists(projectId: string, workId: string): Promise<boolean> {
  try {
    await fs.access(workJsonPath(projectId, workId));
    return true;
  } catch {
    return false;
  }
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
