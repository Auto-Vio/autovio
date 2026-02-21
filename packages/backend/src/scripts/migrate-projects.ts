/**
 * Eski proje verilerini yeni yapıya taşır (Proje + Çalışma hiyerarşisi).
 * data/projects altındaki her proje klasöründe project.json okunur;
 * "scenes" varsa eski format kabul edilir, yeni project.json + works/<workId> oluşturulur
 * ve medya dosyaları çalışma klasörüne taşınır.
 */
import fs from "fs/promises";
import path from "path";
import {
  DATA_DIR,
  PROJECTS_DIR,
  projectDir,
  projectJsonPath,
  workDir,
  workJsonPath,
} from "../storage/path.js";
import { DEFAULT_SCENARIO_SYSTEM_PROMPT } from "@viragen/shared";
import type { Project, WorkSnapshot, WorkMeta } from "@viragen/shared";

interface OldProjectSnapshot {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  currentStep: number;
  hasReferenceVideo: boolean;
  mode: "style_transfer" | "content_remix";
  productName: string;
  productDescription: string;
  targetAudience: string;
  language: string;
  videoDuration?: number;
  sceneCount?: number;
  analysis: unknown;
  scenes: unknown[];
  generatedScenes: { sceneIndex: number; imageUrl?: string; videoUrl?: string; status: string; error?: string }[];
}

function isOldFormat(obj: unknown): obj is OldProjectSnapshot {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return Array.isArray(o.scenes) && !("systemPrompt" in o);
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function migrateProject(projectId: string): Promise<boolean> {
  const pPath = projectJsonPath(projectId);
  let raw: string;
  try {
    raw = await fs.readFile(pPath, "utf-8");
  } catch {
    return false;
  }

  const data = JSON.parse(raw) as unknown;
  if (!isOldFormat(data)) {
    console.log(`  [skip] ${projectId} – zaten yeni format`);
    return false;
  }

  const dir = projectDir(projectId);
  const workId = "work_migrated_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
  const workDirPath = workDir(projectId, workId);

  const project: Project = {
    id: data.id,
    name: data.name,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    systemPrompt: DEFAULT_SCENARIO_SYSTEM_PROMPT,
    knowledge: "",
  };

  const work: WorkSnapshot = {
    id: workId,
    projectId: data.id,
    name: data.name + " (çalışma 1)",
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    systemPrompt: DEFAULT_SCENARIO_SYSTEM_PROMPT,
    currentStep: data.currentStep as 0 | 1 | 2 | 3 | 4,
    hasReferenceVideo: data.hasReferenceVideo,
    mode: data.mode,
    productName: data.productName ?? "",
    productDescription: data.productDescription ?? "",
    targetAudience: data.targetAudience ?? "",
    language: data.language ?? "",
    videoDuration: data.videoDuration,
    sceneCount: data.sceneCount,
    analysis: data.analysis as WorkSnapshot["analysis"],
    scenes: data.scenes as WorkSnapshot["scenes"],
    generatedScenes: (data.generatedScenes ?? []).map((s) => ({
      sceneIndex: s.sceneIndex,
      imageUrl: s.imageUrl,
      videoUrl: s.videoUrl,
      status: (s.status || "pending") as WorkSnapshot["generatedScenes"][0]["status"],
      error: s.error,
    })),
  };

  await ensureDir(workDirPath);

  await fs.writeFile(pPath, JSON.stringify(project, null, 2), "utf-8");

  const worksIndex: { works: WorkMeta[] } = {
    works: [
      {
        id: workId,
        projectId: data.id,
        name: work.name,
        updatedAt: work.updatedAt,
      },
    ],
  };
  await fs.writeFile(
    path.join(dir, "works_index.json"),
    JSON.stringify(worksIndex, null, 2),
    "utf-8"
  );
  await fs.writeFile(workJsonPath(projectId, workId), JSON.stringify(work, null, 2), "utf-8");

  const entries = await fs.readdir(dir, { withFileTypes: true });
  let moved = 0;
  for (const e of entries) {
    if (!e.isFile()) continue;
    const name = e.name;
    const shouldMove =
      name === "reference.mp4" ||
      /^scene_\d+_image\./.test(name) ||
      /^scene_\d+_video\./.test(name);
    if (!shouldMove) continue;
    const src = path.join(dir, name);
    const dest = path.join(workDirPath, name);
    try {
      await fs.rename(src, dest);
      moved++;
    } catch (err) {
      console.warn(`  [warn] taşınamadı: ${name}`, err);
    }
  }

  console.log(`  [ok] ${projectId} → 1 çalışma (${workId}), ${moved} dosya taşındı`);
  return true;
}

async function main(): Promise<void> {
  console.log("Data dizini:", DATA_DIR);
  console.log("Projeler:", PROJECTS_DIR);

  await fs.mkdir(PROJECTS_DIR, { recursive: true });
  const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory() && !e.name.startsWith("."));

  if (dirs.length === 0) {
    console.log("Proje klasörü yok.");
    return;
  }

  console.log(`${dirs.length} proje klasörü bulundu.\n`);

  let migrated = 0;
  for (const d of dirs) {
    const projectId = d.name;
    console.log(projectId);
    const ok = await migrateProject(projectId);
    if (ok) migrated++;
  }

  console.log(`\nToplam ${migrated} proje yeni yapıya taşındı.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
