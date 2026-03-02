import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Backend host'un local storage'ı: projeler ve medya bu dizinde tutulur. */
export const DATA_DIR = process.env.VIRAGEN_DATA_DIR ?? path.join(__dirname, "..", "..", "data");
export const PROJECTS_DIR = path.join(DATA_DIR, "projects");

export function projectDir(projectId: string): string {
  return path.join(PROJECTS_DIR, projectId);
}

export function projectJsonPath(projectId: string): string {
  return path.join(projectDir(projectId), "project.json");
}

/** Çalışma dizini: proje altında works/<workId> */
export function workDir(projectId: string, workId: string): string {
  return path.join(projectDir(projectId), "works", workId);
}

export function workJsonPath(projectId: string, workId: string): string {
  return path.join(workDir(projectId, workId), "work.json");
}

export function referenceVideoPath(projectId: string, workId: string): string {
  return path.join(workDir(projectId, workId), "reference.mp4");
}

const AUDIO_EXTS = ["mp3", "m4a", "wav", "ogg", "webm"];

export function workAudioPath(projectId: string, workId: string, ext = "mp3"): string {
  return path.join(workDir(projectId, workId), `audio.${ext}`);
}

export async function resolveWorkAudioPath(projectId: string, workId: string): Promise<string | null> {
  const dir = workDir(projectId, workId);
  for (const ext of AUDIO_EXTS) {
    const p = path.join(dir, `audio.${ext}`);
    try {
      await fs.access(p);
      return p;
    } catch {
      continue;
    }
  }
  return null;
}

const MIME_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export function sceneImagePath(projectId: string, workId: string, index: number, mime?: string): string {
  const ext = mime ? MIME_EXT[mime] ?? "bin" : "bin";
  return path.join(workDir(projectId, workId), `scene_${index}_image.${ext}`);
}

export function sceneVideoPath(projectId: string, workId: string, index: number, mime?: string): string {
  const ext = mime ? MIME_EXT[mime] ?? "bin" : "bin";
  return path.join(workDir(projectId, workId), `scene_${index}_video.${ext}`);
}

const SCENE_IMAGE_EXTS = ["png", "jpg", "jpeg", "webp", "bin"];
const SCENE_VIDEO_EXTS = ["mp4", "webm", "bin"];

export function sceneImageBasePath(projectId: string, workId: string, index: number): string {
  return path.join(workDir(projectId, workId), `scene_${index}_image`);
}
export function sceneVideoBasePath(projectId: string, workId: string, index: number): string {
  return path.join(workDir(projectId, workId), `scene_${index}_video`);
}
export function sceneImageReadExtensions(): string[] {
  return SCENE_IMAGE_EXTS;
}
export function sceneVideoReadExtensions(): string[] {
  return SCENE_VIDEO_EXTS;
}
