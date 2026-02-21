import fs from "fs/promises";
import path from "path";
import type { Project, ProjectMeta } from "@viragen/shared";
import { DEFAULT_SCENARIO_SYSTEM_PROMPT } from "@viragen/shared";
import { DATA_DIR, projectDir, projectJsonPath } from "./path.js";

const INDEX_PATH = path.join(DATA_DIR, "projects_index.json");

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function readIndex(): Promise<ProjectMeta[]> {
  await ensureDir(DATA_DIR);
  try {
    const raw = await fs.readFile(INDEX_PATH, "utf-8");
    const data = JSON.parse(raw) as { projects?: ProjectMeta[] };
    return Array.isArray(data?.projects) ? data.projects : [];
  } catch {
    return [];
  }
}

async function writeIndex(projects: ProjectMeta[]): Promise<void> {
  await ensureDir(DATA_DIR);
  await fs.writeFile(
    INDEX_PATH,
    JSON.stringify({ projects: projects.sort((a, b) => b.updatedAt - a.updatedAt) }, null, 2),
    "utf-8"
  );
}

export async function listProjects(): Promise<ProjectMeta[]> {
  return readIndex();
}

export async function getProject(id: string): Promise<Project | null> {
  const p = projectJsonPath(id);
  try {
    const raw = await fs.readFile(p, "utf-8");
    return JSON.parse(raw) as Project;
  } catch {
    return null;
  }
}

export async function saveProject(project: Project): Promise<void> {
  const dir = projectDir(project.id);
  await ensureDir(dir);
  await fs.writeFile(projectJsonPath(project.id), JSON.stringify(project, null, 2), "utf-8");

  const projects = await readIndex();
  const meta: ProjectMeta = { id: project.id, name: project.name, updatedAt: project.updatedAt };
  const idx = projects.findIndex((p) => p.id === project.id);
  if (idx >= 0) projects[idx] = meta;
  else projects.unshift(meta);
  await writeIndex(projects);
}

export async function createProject(name: string): Promise<Project> {
  const id = "proj_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
  const now = Date.now();
  const project: Project = {
    id,
    name: name || "Yeni Proje",
    createdAt: now,
    updatedAt: now,
    systemPrompt: DEFAULT_SCENARIO_SYSTEM_PROMPT,
    knowledge: "",
    analyzerPrompt: "",
    imageSystemPrompt: "",
    videoSystemPrompt: "",
  };
  await saveProject(project);
  return project;
}

export async function deleteProject(id: string): Promise<void> {
  const dir = projectDir(id);
  try {
    await fs.rm(dir, { recursive: true });
  } catch {
    // ignore if not exists
  }
  const projects = (await readIndex()).filter((p) => p.id !== id);
  await writeIndex(projects);
}

export async function projectExists(id: string): Promise<boolean> {
  try {
    await fs.access(projectJsonPath(id));
    return true;
  } catch {
    return false;
  }
}
