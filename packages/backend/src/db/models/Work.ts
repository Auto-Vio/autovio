import mongoose, { Schema } from "mongoose";
import type { WorkSnapshot, AnalysisResult, ScenarioScene, GeneratedSceneSnapshot, PipelineStep, EditorStateSnapshot, AssetUsageMode } from "@autovio/shared";

export interface WorkDocument {
  _id: string;
  projectId: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  systemPrompt: string;
  analyzerPrompt?: string;
  imageSystemPrompt?: string;
  videoSystemPrompt?: string;
  currentStep: number;
  hasReferenceVideo: boolean;
  mode: "style_transfer" | "content_remix";
  productName: string;
  productDescription: string;
  targetAudience: string;
  language: string;
  videoDuration?: number;
  sceneCount?: number;
  analysis: AnalysisResult | null;
  scenes: ScenarioScene[];
  generatedScenes: GeneratedSceneSnapshot[];
  editorState?: EditorStateSnapshot;
  selectedAssetIds?: string[];
  assetUsageMode?: AssetUsageMode;
  resolution?: { width: number; height: number };
}

const SceneAnalysisSchema = new Schema(
  {
    index: { type: Number, required: true },
    duration_seconds: { type: Number, required: true },
    description: { type: String, required: true },
    transition: { type: String, default: "cut" },
    text_overlay: { type: String, default: null },
    camera_movement: { type: String, default: null },
  },
  { _id: false }
);

const AnalysisResultSchema = new Schema(
  {
    scene_count: { type: Number, required: true },
    overall_tone: { type: String, required: true },
    color_palette: [{ type: String }],
    tempo: { type: String, required: true },
    has_text_overlay: { type: Boolean, required: true },
    scenes: [SceneAnalysisSchema],
  },
  { _id: false }
);

const ScenarioSceneSchema = new Schema(
  {
    scene_index: { type: Number, required: true },
    duration_seconds: { type: Number, required: true },
    image_prompt: { type: String, required: true },
    negative_prompt: { type: String, default: "" },
    video_prompt: { type: String, required: true },
    text_overlay: { type: String, default: null },
    transition: { type: String, default: "cut" },
  },
  { _id: false }
);

const GeneratedSceneSnapshotSchema = new Schema(
  {
    sceneIndex: { type: Number, required: true },
    imageUrl: { type: String },
    videoUrl: { type: String },
    status: {
      type: String,
      enum: ["pending", "generating_image", "image_ready", "generating_video", "done", "error"],
      required: true,
    },
    error: { type: String },
  },
  { _id: false }
);

const TimelineActionSnapshotSchema = new Schema(
  {
    id: { type: String, required: true },
    start: { type: Number, required: true },
    end: { type: Number, required: true },
    sceneIndex: { type: Number },
    trimStart: { type: Number },
    trimEnd: { type: Number },
    transitionType: { type: String },
    transitionDuration: { type: Number },
  },
  { _id: false }
);

const ImageOverlaySnapshotSchema = new Schema(
  {
    assetId: { type: String, required: true },
    width: { type: Number, default: 128 },
    height: { type: Number, default: 128 },
    centerX: { type: Number, default: 0 },
    centerY: { type: Number, default: 0 },
    opacity: { type: Number, default: 1 },
    rotation: { type: Number, default: 0 },
    maintainAspectRatio: { type: Boolean, default: true },
  },
  { _id: false }
);

const TextOverlaySnapshotSchema = new Schema(
  {
    text: { type: String, default: "" },
    fontSize: { type: Number, default: 32 },
    fontColor: { type: String, default: "#ffffff" },
    centerX: { type: Number, default: 0 },
    centerY: { type: Number, default: 0 },
  },
  { _id: false }
);

const EditorStateSnapshotSchema = new Schema(
  {
    editorData: {
      videoTrack: [TimelineActionSnapshotSchema],
      textTrack: [TimelineActionSnapshotSchema],
      imageTrack: [TimelineActionSnapshotSchema],
      audioTrack: [TimelineActionSnapshotSchema],
    },
    textOverlays: { type: Schema.Types.Mixed, default: {} },
    imageOverlays: { type: Schema.Types.Mixed, default: {} },
    audioUrl: { type: String },
    audioVolume: { type: Number, default: 1 },
    exportSettings: {
      width: { type: Number, default: 1080 },
      height: { type: Number, default: 1920 },
      fps: { type: Number, default: 30 },
    },
  },
  { _id: false }
);

const WorkSchema = new Schema(
  {
    _id: { type: String, required: true },
    projectId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    createdAt: { type: Number, required: true },
    updatedAt: { type: Number, required: true },
    systemPrompt: { type: String, required: true },
    analyzerPrompt: { type: String, default: "" },
    imageSystemPrompt: { type: String, default: "" },
    videoSystemPrompt: { type: String, default: "" },
    currentStep: { type: Number, required: true },
    hasReferenceVideo: { type: Boolean, required: true },
    mode: { type: String, enum: ["style_transfer", "content_remix"], required: true },
    productName: { type: String, default: "" },
    productDescription: { type: String, default: "" },
    targetAudience: { type: String, default: "" },
    language: { type: String, default: "" },
    videoDuration: { type: Number },
    sceneCount: { type: Number },
    analysis: { type: AnalysisResultSchema, default: null },
    scenes: [ScenarioSceneSchema],
    generatedScenes: [GeneratedSceneSnapshotSchema],
    editorState: { type: EditorStateSnapshotSchema },
    selectedAssetIds: [{ type: String }],
    assetUsageMode: { type: String, enum: ["reference", "direct"] },
    resolution: {
      width: { type: Number },
      height: { type: Number },
    },
  },
  {
    _id: false,
    versionKey: false,
  }
);

WorkSchema.index({ projectId: 1, updatedAt: -1 });

export const WorkModel = mongoose.model<WorkDocument>("Work", WorkSchema);

export function toWorkSnapshot(doc: WorkDocument): WorkSnapshot {
  return {
    id: doc._id,
    projectId: doc.projectId,
    name: doc.name,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    systemPrompt: doc.systemPrompt,
    analyzerPrompt: doc.analyzerPrompt,
    imageSystemPrompt: doc.imageSystemPrompt,
    videoSystemPrompt: doc.videoSystemPrompt,
    currentStep: doc.currentStep as 0 | 1 | 2 | 3 | 4,
    hasReferenceVideo: doc.hasReferenceVideo,
    mode: doc.mode,
    productName: doc.productName,
    productDescription: doc.productDescription,
    targetAudience: doc.targetAudience,
    language: doc.language,
    videoDuration: doc.videoDuration,
    sceneCount: doc.sceneCount,
    analysis: doc.analysis as AnalysisResult | null,
    scenes: doc.scenes as ScenarioScene[],
    generatedScenes: doc.generatedScenes as GeneratedSceneSnapshot[],
    editorState: doc.editorState as EditorStateSnapshot | undefined,
    selectedAssetIds: doc.selectedAssetIds,
    assetUsageMode: doc.assetUsageMode,
    resolution: doc.resolution,
  };
}
