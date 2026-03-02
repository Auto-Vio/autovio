import type { Project, ProjectMeta, WorkSnapshot, WorkMeta } from "@viragen/shared";
import { getAuthToken } from "../store/useAuthStore";

const API = "/api/projects";

function getAuthHeader(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function workMediaUrl(
  projectId: string,
  workId: string,
  kind: "reference" | "scene",
  sceneIndex?: number,
  type?: "image" | "video"
): string {
  const base = `${API}/${projectId}/works/${workId}/media`;
  if (kind === "reference") return `${base}/reference`;
  return `${base}/scene/${sceneIndex}/${type}`;
}

// --- Projects ---

export async function listProjects(): Promise<ProjectMeta[]> {
  const res = await fetch(API, { headers: getAuthHeader() });
  if (!res.ok) throw new Error("Failed to list projects");
  return res.json();
}

export async function getProject(id: string): Promise<Project | null> {
  const res = await fetch(`${API}/${id}`, { headers: getAuthHeader() });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to get project");
  return res.json();
}

export async function saveProject(project: Project): Promise<void> {
  const res = await fetch(`${API}/${project.id}`, {
    method: "PUT",
    headers: { ...getAuthHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(project),
  });
  if (!res.ok) throw new Error("Failed to save project");
}

export async function createProject(name: string): Promise<Project> {
  const res = await fetch(API, {
    method: "POST",
    headers: { ...getAuthHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({ name: name || "New Project" }),
  });
  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`${API}/${id}`, { method: "DELETE", headers: getAuthHeader() });
  if (!res.ok && res.status !== 404) throw new Error("Failed to delete project");
}

// --- Works ---

export async function listWorks(projectId: string): Promise<WorkMeta[]> {
  const res = await fetch(`${API}/${projectId}/works`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error("Failed to list works");
  return res.json();
}

export async function getWork(projectId: string, workId: string): Promise<WorkSnapshot | null> {
  const res = await fetch(`${API}/${projectId}/works/${workId}`, { headers: getAuthHeader() });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to get work");
  return res.json();
}

export async function saveWork(projectId: string, snapshot: WorkSnapshot): Promise<void> {
  const res = await fetch(`${API}/${projectId}/works/${snapshot.id}`, {
    method: "PUT",
    headers: { ...getAuthHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(snapshot),
  });
  if (!res.ok) throw new Error("Failed to save work");
}

export async function createWork(projectId: string, name?: string): Promise<WorkSnapshot> {
  const res = await fetch(`${API}/${projectId}/works`, {
    method: "POST",
    headers: { ...getAuthHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({ name: name || "New Work" }),
  });
  if (!res.ok) throw new Error("Failed to create work");
  return res.json();
}

export async function deleteWork(projectId: string, workId: string): Promise<void> {
  const res = await fetch(`${API}/${projectId}/works/${workId}`, { method: "DELETE", headers: getAuthHeader() });
  if (!res.ok && res.status !== 404) throw new Error("Failed to delete work");
}

// --- Media (work-scoped) ---

export async function saveReferenceVideoBlob(projectId: string, workId: string, blob: Blob): Promise<void> {
  const form = new FormData();
  form.append("video", blob, "reference.mp4");
  const res = await fetch(workMediaUrl(projectId, workId, "reference"), {
    method: "POST",
    headers: getAuthHeader(),
    body: form,
  });
  if (!res.ok) throw new Error("Failed to save reference video");
}

export function getReferenceVideoUrl(projectId: string, workId: string): string {
  return workMediaUrl(projectId, workId, "reference");
}

export async function loadReferenceVideoBlob(projectId: string, workId: string): Promise<Blob | null> {
  const res = await fetch(getReferenceVideoUrl(projectId, workId), { headers: getAuthHeader() });
  if (res.status === 404 || !res.ok) return null;
  return res.blob();
}

export async function saveImageBlob(
  projectId: string,
  workId: string,
  sceneIndex: number,
  blob: Blob
): Promise<string> {
  const form = new FormData();
  form.append("file", blob, `scene_${sceneIndex}_image`);
  const res = await fetch(workMediaUrl(projectId, workId, "scene", sceneIndex, "image"), {
    method: "POST",
    headers: getAuthHeader(),
    body: form,
  });
  if (!res.ok) throw new Error("Failed to save image");
  return workMediaUrl(projectId, workId, "scene", sceneIndex, "image");
}

export async function saveVideoBlob(
  projectId: string,
  workId: string,
  sceneIndex: number,
  blob: Blob
): Promise<string> {
  const form = new FormData();
  form.append("file", blob, `scene_${sceneIndex}_video`);
  const res = await fetch(workMediaUrl(projectId, workId, "scene", sceneIndex, "video"), {
    method: "POST",
    headers: getAuthHeader(),
    body: form,
  });
  if (!res.ok) throw new Error("Failed to save video");
  return workMediaUrl(projectId, workId, "scene", sceneIndex, "video");
}

export function getSceneImageUrl(projectId: string, workId: string, sceneIndex: number): string {
  return workMediaUrl(projectId, workId, "scene", sceneIndex, "image");
}

export function getSceneVideoUrl(projectId: string, workId: string, sceneIndex: number): string {
  return workMediaUrl(projectId, workId, "scene", sceneIndex, "video");
}

export async function loadImageUrl(
  projectId: string,
  workId: string,
  sceneIndex: number
): Promise<string | null> {
  const res = await fetch(getSceneImageUrl(projectId, workId, sceneIndex), { headers: getAuthHeader() });
  if (res.status === 404 || !res.ok) return null;
  return getSceneImageUrl(projectId, workId, sceneIndex);
}

export async function loadVideoUrl(
  projectId: string,
  workId: string,
  sceneIndex: number
): Promise<string | null> {
  const res = await fetch(getSceneVideoUrl(projectId, workId, sceneIndex), { headers: getAuthHeader() });
  if (res.status === 404 || !res.ok) return null;
  return getSceneVideoUrl(projectId, workId, sceneIndex);
}

export async function uploadWorkAudio(projectId: string, workId: string, file: File): Promise<string> {
  const form = new FormData();
  form.append("audio", file);
  const res = await fetch(`${API}/${projectId}/works/${workId}/media/audio`, {
    method: "POST",
    headers: getAuthHeader(),
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(err.error || "Failed to upload audio");
  }
  const data = await res.json();
  return data.audioUrl ?? `${API}/${projectId}/works/${workId}/media/audio`;
}

export async function persistImageUrlAndGetObjectUrl(
  projectId: string,
  workId: string,
  sceneIndex: number,
  imageUrl: string
): Promise<string> {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error("Failed to fetch image");
  const blob = await res.blob();
  await saveImageBlob(projectId, workId, sceneIndex, blob);
  const savedPath = getSceneImageUrl(projectId, workId, sceneIndex);
  const authRes = await fetch(savedPath, { headers: getAuthHeader() });
  if (!authRes.ok) throw new Error("Failed to load saved image");
  const savedBlob = await authRes.blob();
  return URL.createObjectURL(savedBlob);
}

export async function persistVideoUrlAndGetObjectUrl(
  projectId: string,
  workId: string,
  sceneIndex: number,
  videoUrl: string
): Promise<string> {
  const res = await fetch(videoUrl);
  if (!res.ok) throw new Error("Failed to fetch video");
  const blob = await res.blob();
  await saveVideoBlob(projectId, workId, sceneIndex, blob);
  const savedPath = getSceneVideoUrl(projectId, workId, sceneIndex);
  const authRes = await fetch(savedPath, { headers: getAuthHeader() });
  if (!authRes.ok) throw new Error("Failed to load saved video");
  const savedBlob = await authRes.blob();
  return URL.createObjectURL(savedBlob);
}
