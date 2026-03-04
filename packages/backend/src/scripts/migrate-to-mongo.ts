/**
 * Migration script to transfer existing JSON data to MongoDB.
 * 
 * Usage: bun run migrate:mongo
 * 
 * This script reads existing JSON files from the data directory and
 * imports them into MongoDB. It's safe to run multiple times as it
 * uses upsert operations.
 */

import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirnameMigrate = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirnameMigrate, "../../../../.env") });
import mongoose from "mongoose";
import { ProjectModel } from "../db/models/Project.js";
import { WorkModel } from "../db/models/Work.js";
import type { Project, WorkSnapshot, ProjectMeta, WorkMeta } from "@autovio/shared";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.VIRAGEN_DATA_DIR ?? path.join(__dirname, "..", "..", "data");
const PROJECTS_DIR = path.join(DATA_DIR, "projects");

function buildConnectionString(): string {
  const uri = process.env.MONGODB_URI?.trim() || "mongodb://localhost:27017";
  const username = process.env.MONGODB_USERNAME?.trim();
  const password = process.env.MONGODB_PASSWORD?.trim();
  const dbName = process.env.MONGODB_DB_NAME?.trim() || "autovio";
  const authSource = process.env.MONGODB_AUTH_SOURCE?.trim() || "admin";

  if (uri.includes("@")) {
    return uri.includes("/") && !uri.endsWith("/") ? uri : `${uri}/${dbName}`;
  }

  if (username && password) {
    const protocol = uri.startsWith("mongodb+srv://") ? "mongodb+srv://" : "mongodb://";
    const hostPart = uri.replace(/^mongodb(\+srv)?:\/\//, "");
    return `${protocol}${encodeURIComponent(username)}:${encodeURIComponent(password)}@${hostPart}/${dbName}?authSource=${authSource}`;
  }

  return `${uri}/${dbName}`;
}

interface ProjectsIndex {
  projects?: ProjectMeta[];
}

interface WorksIndex {
  works?: WorkMeta[];
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

async function migrateProjects(): Promise<void> {
  console.log("[migrate] Starting migration...");
  console.log(`[migrate] Data directory: ${DATA_DIR}`);

  const indexPath = path.join(DATA_DIR, "projects_index.json");
  const index = await readJsonFile<ProjectsIndex>(indexPath);

  if (!index?.projects?.length) {
    console.log("[migrate] No projects found in index. Checking directories...");
    
    try {
      const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
      const projectDirs = entries.filter((e) => e.isDirectory() && e.name.startsWith("proj_"));
      
      if (projectDirs.length === 0) {
        console.log("[migrate] No project directories found. Nothing to migrate.");
        return;
      }
      
      console.log(`[migrate] Found ${projectDirs.length} project directories`);
      
      for (const dir of projectDirs) {
        await migrateProjectFromDir(dir.name);
      }
    } catch (error) {
      console.log("[migrate] Projects directory does not exist. Nothing to migrate.");
      return;
    }
  } else {
    console.log(`[migrate] Found ${index.projects.length} projects in index`);
    
    for (const meta of index.projects) {
      await migrateProjectFromDir(meta.id);
    }
  }
}

async function migrateProjectFromDir(projectId: string): Promise<void> {
  const projectDir = path.join(PROJECTS_DIR, projectId);
  const projectJsonPath = path.join(projectDir, "project.json");
  
  const project = await readJsonFile<Project>(projectJsonPath);
  
  if (!project) {
    console.log(`[migrate] Skipping ${projectId}: project.json not found or invalid`);
    return;
  }
  
  console.log(`[migrate] Migrating project: ${project.name} (${project.id})`);
  
  await ProjectModel.findByIdAndUpdate(
    project.id,
    {
      _id: project.id,
      name: project.name,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      systemPrompt: project.systemPrompt,
      knowledge: project.knowledge || "",
      analyzerPrompt: project.analyzerPrompt || "",
      imageSystemPrompt: project.imageSystemPrompt || "",
      videoSystemPrompt: project.videoSystemPrompt || "",
    },
    { upsert: true }
  );
  
  console.log(`[migrate]   Project saved to MongoDB`);
  
  await migrateWorksForProject(projectId);
}

async function migrateWorksForProject(projectId: string): Promise<void> {
  const projectDir = path.join(PROJECTS_DIR, projectId);
  const worksIndexPath = path.join(projectDir, "works_index.json");
  
  const worksIndex = await readJsonFile<WorksIndex>(worksIndexPath);
  
  if (!worksIndex?.works?.length) {
    const worksDir = path.join(projectDir, "works");
    try {
      const entries = await fs.readdir(worksDir, { withFileTypes: true });
      const workDirs = entries.filter((e) => e.isDirectory() && e.name.startsWith("work_"));
      
      if (workDirs.length === 0) {
        console.log(`[migrate]   No works found for project ${projectId}`);
        return;
      }
      
      console.log(`[migrate]   Found ${workDirs.length} work directories`);
      
      for (const dir of workDirs) {
        await migrateWorkFromDir(projectId, dir.name);
      }
    } catch {
      console.log(`[migrate]   No works directory for project ${projectId}`);
      return;
    }
  } else {
    console.log(`[migrate]   Found ${worksIndex.works.length} works in index`);
    
    for (const meta of worksIndex.works) {
      await migrateWorkFromDir(projectId, meta.id);
    }
  }
}

async function migrateWorkFromDir(projectId: string, workId: string): Promise<void> {
  const workDir = path.join(PROJECTS_DIR, projectId, "works", workId);
  const workJsonPath = path.join(workDir, "work.json");
  
  const work = await readJsonFile<WorkSnapshot>(workJsonPath);
  
  if (!work) {
    console.log(`[migrate]     Skipping ${workId}: work.json not found or invalid`);
    return;
  }
  
  console.log(`[migrate]     Migrating work: ${work.name} (${work.id})`);
  
  await WorkModel.findByIdAndUpdate(
    work.id,
    {
      _id: work.id,
      projectId: work.projectId,
      name: work.name,
      createdAt: work.createdAt,
      updatedAt: work.updatedAt,
      systemPrompt: work.systemPrompt,
      analyzerPrompt: work.analyzerPrompt || "",
      imageSystemPrompt: work.imageSystemPrompt || "",
      videoSystemPrompt: work.videoSystemPrompt || "",
      currentStep: work.currentStep,
      hasReferenceVideo: work.hasReferenceVideo,
      mode: work.mode,
      productName: work.productName || "",
      productDescription: work.productDescription || "",
      targetAudience: work.targetAudience || "",
      language: work.language || "",
      videoDuration: work.videoDuration,
      sceneCount: work.sceneCount,
      analysis: work.analysis,
      scenes: work.scenes || [],
      generatedScenes: work.generatedScenes || [],
    },
    { upsert: true }
  );
  
  console.log(`[migrate]     Work saved to MongoDB`);
}

async function main(): Promise<void> {
  const connectionString = buildConnectionString();
  const sanitizedUri = connectionString.replace(/:([^:@]+)@/, ":***@");
  
  console.log("[migrate] Connecting to MongoDB...");
  console.log(`[migrate] URI: ${sanitizedUri}`);
  
  try {
    await mongoose.connect(connectionString);
    console.log("[migrate] Connected to MongoDB");
    
    await migrateProjects();
    
    const projectCount = await ProjectModel.countDocuments();
    const workCount = await WorkModel.countDocuments();
    
    console.log("\n[migrate] Migration complete!");
    console.log(`[migrate] Total projects in MongoDB: ${projectCount}`);
    console.log(`[migrate] Total works in MongoDB: ${workCount}`);
  } catch (error) {
    console.error("[migrate] Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("[migrate] Disconnected from MongoDB");
  }
}

main();
