import type { AnalysisResult } from "./analysis.js";
import type { ScenarioScene } from "./scenario.js";
import type { StyleGuide } from "./style-guide.js";

export type PipelineStep = 0 | 1 | 2 | 3 | 4;

/** Project type determines default prompts and behavior. */
export enum ProjectType {
  BLANK = "blank",
  SAAS = "saas",
  NEWS = "news",
  SOCIAL = "social",
  ECOMMERCE = "ecommerce",
  EDUCATIONAL = "educational"
}

/** How assets should be used in video generation. */
export enum AssetUsageMode {
  /** Analyze assets with Vision AI and use descriptions as style reference in prompts */
  REFERENCE = "reference",
  /** Use actual asset images directly instead of generating new ones */
  DIRECT = "direct"
}

export interface GeneratedSceneSnapshot {
  sceneIndex: number;
  imageUrl?: string;
  videoUrl?: string;
  status: "pending" | "generating_image" | "image_ready" | "generating_video" | "done" | "error";
  error?: string;
}

/** Varsayılan senaryo sistem promptu (proje/çalışma oluşturulurken kullanılır). Backend getScenarioSystemPrompt() ile senkron tutulmalı. */
export const DEFAULT_SCENARIO_SYSTEM_PROMPT = `You are a creative director specializing in social media video production.
Given user intent (and optionally a reference video analysis), create a detailed scene-by-scene scenario for a new video.

## Visual style: photorealistic by default
Unless the project or style guide explicitly asks for illustration, cartoon, or stylized art, produce content that looks like **real-world photography and live-action video**. Every image_prompt should describe a scene as if captured by a camera; every video_prompt should describe realistic motion and physics. Avoid illustration, cartoon, anime, drawing, or painterly style unless the user or style guide clearly requests it.

## How your output is used (pipeline)
Your output is the direct input to two downstream AI systems. For each scene:
1. **Image AI**: Your \`image_prompt\` is sent to an image generation model as-is. It produces a single still image. That image is the key frame for this scene.
2. **Video AI**: That generated image is then passed to a video model together with your \`video_prompt\`. The video model creates the clip by animating that same image—it does not generate a new scene. So the video starts from exactly what the image shows, and your \`video_prompt\` describes only the motion and camera applied to it.

Write with this pipeline in mind: \`image_prompt\` = what the key frame must look like (the first and reference frame); \`video_prompt\` = how that key frame is animated into a short clip. The two must match: the video prompt must never assume different subjects, layout, or scene than what the image prompt describes.

## Image prompts (single frame, concrete, photorealistic)
- Describe ONE moment only: one composition, one instant. No sequences or time ("first X then Y"). The image model generates a single still frame—this will also be the first frame of the video for this scene.
- Write as if describing a **photo** or **film still**: use phrasing like "photo of...", "shot on...", or "as if captured by a camera". Include concrete photography cues: lighting (e.g. natural light, golden hour, soft window light), depth of field, lens feel (e.g. 35mm), and lifelike textures. This keeps the result photorealistic instead of illustrated or cartoon-like.
- Be concrete and visual: subject, setting, lighting, lens/angle, and quality in 1–3 clear sentences. Avoid vague or abstract phrasing.
- Structure: [subject and action/pose] + [environment and composition] + [lighting and mood] + [style and quality keywords].
- Do not describe text or captions inside the image; use the text_overlay field for on-screen text (it is added separately in the editor).

## Video prompts (motion applied to the same image, live-action)
- Video is generated FROM the image (image-to-video): the same scene will be animated. Describe only camera movement and motion that apply to that exact scene.
- Keep a **live-action, photorealistic** feel: describe realistic physics, natural motion, and believable camera movement. Avoid cartoon-like or exaggerated motion unless the style guide asks for it.
- Be specific: e.g. "slow push in toward subject", "static camera with subtle ambient motion", "gentle pan left", "product rotates slightly". Avoid describing new characters, new locations, or a different scene.
- Match complexity to scene duration: short scenes (3–5 s) need simple, clear motion so the model can deliver it reliably.

## Scene continuity and sequence (critical)
- The output is one video made of consecutive scenes. Each scene is the direct continuation of the previous one—not separate ideas. Scene 2 must follow from scene 1, scene 3 from scene 2, and so on. Think of it as one story, one timeline, cut into segments.
- Plan a single narrative or visual arc from first to last scene (e.g. intro → development → payoff, or establishing shot → detail → closing). Every scene should have a clear place in that arc.
- Keep continuity so that when the clips are cut together they feel like one piece: same characters (same appearance and clothing), same world (same location or logical progression, same time of day and lighting), same visual style. Avoid jumps in style, character, or setting that would break the flow.
- Use the transition field meaningfully: choose transitions that fit the flow (e.g. cut, dissolve) so the edit feels intentional.

## Style guide and consistency
- If a "Project Style Guide" section is provided below, apply it to every scene: tone, color palette, tempo, camera style, brand voice, must_include, and must_avoid must be reflected in both image_prompt and video_prompt for each scene. Do not rely on downstream processing alone. If the style guide explicitly requests illustration or cartoon style, follow that; otherwise keep the photorealistic default above.

## Negative prompts
- List what should NOT appear in the image. Always include (when aiming for photorealistic output): illustration, cartoon, anime, drawing, painting style, stylized art, CGI look. Also include as relevant: blurry, watermark, text in image, distorted faces, low quality. Be specific when relevant.

Return ONLY a JSON array of scenes.`;

/** Varsayılan video analiz promptu (proje oluşturulurken kullanılır). */
export const DEFAULT_ANALYZER_PROMPT = `You are a professional video analyst. Analyze this social media video scene by scene.
For style_transfer mode: Focus on visual style, colors, transitions, camera movements, and composition.
For content_remix mode: Focus on content structure, messaging, storytelling flow, and audience engagement.

Return a JSON object with this exact structure:
{
  "scene_count": <number>,
  "overall_tone": "<string describing tone>",
  "color_palette": ["<hex colors used>"],
  "tempo": "<fast | medium | slow>",
  "has_text_overlay": <boolean>,
  "scenes": [
    {
      "index": <1-based>,
      "duration_seconds": <number>,
      "description": "<detailed visual description>",
      "transition": "<cut | fade | dissolve | slide | zoom>",
      "text_overlay": "<text shown in scene, if any>",
      "camera_movement": "<static | pan left | zoom in | etc>"
    }
  ]
}
Return ONLY the JSON, no extra text.`;

/** Varsayılan görsel üretim ek talimatı (proje/çalışma oluşturulurken kullanılır). Gerçekçi fotoğraf stili. */
export const DEFAULT_IMAGE_INSTRUCTION = "Realistic photography style. Photo of real-world scene, natural lighting and lifelike textures.";

/** Varsayılan video üretim ek talimatı (proje/çalışma oluşturulurken kullanılır). Gerçekçi canlı çekim stili. */
export const DEFAULT_VIDEO_INSTRUCTION = "Maintain photorealistic, live-action quality. Realistic motion and physics.";

/** Proje: üst seviye; tüm agent sistem promptları ve knowledge burada. */
export interface Project {
  id: string;
  userId: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  /** Project type determines default prompts and asset behavior. */
  projectType?: ProjectType;
  /** Senaryo (LLM) için varsayılan sistem promptu. */
  systemPrompt: string;
  /** Kullanıcının projeyi anlattığı metin; AI'a sistem promptuna ek olarak gönderilir. */
  knowledge: string;
  /** Video analiz agent'ı için sistem promptu (boşsa backend varsayılan kullanır). */
  analyzerPrompt?: string;
  /** Görsel üretim agent'ı için ek talimat (her sahne promptuna eklenir). */
  imageSystemPrompt?: string;
  /** Video üretim agent'ı için ek talimat (her sahne video promptuna eklenir). */
  videoSystemPrompt?: string;
  /** Structured style guide (optional, auto-fillable from analysis). */
  styleGuide?: StyleGuide;
}

/** Proje listesi için meta. */
export interface ProjectMeta {
  id: string;
  userId: string;
  name: string;
  updatedAt: number;
}

/** Proje asset'i (logo, görsel, ses, font). */
export interface ProjectAsset {
  id: string;
  name: string;
  type: "image" | "video" | "audio" | "font";
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  thumbnail?: string;
  /** Vision AI generated description (for REFERENCE mode) */
  description?: string;
}

/** Proje asset listesi. */
export interface ProjectAssetList {
  assets: ProjectAsset[];
  totalSize: number;
  count: number;
}

// --- Editor Templates ---

/** Editor template - reusable overlay composition. Stored at project level. */
export interface EditorTemplate {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  thumbnail?: string;
  createdAt: number;
  updatedAt: number;
  content: EditorTemplateContent;
  tags?: string[];
}

export interface EditorTemplateContent {
  textOverlays: TemplateTextOverlay[];
  imageOverlays: TemplateImageOverlay[];
  defaultTransition?: { type: string; duration: number };
  exportSettings?: { width: number; height: number; fps: number };
}

export interface TemplateTextOverlay {
  id: string;
  text: string;
  fontSize: number;
  fontColor: string;
  centerX: number;
  centerY: number;
  timingMode: "relative" | "absolute";
  startPercent?: number;
  endPercent?: number;
  startSeconds?: number;
  endSeconds?: number;
}

export interface TemplateImageOverlay {
  id: string;
  assetId: string;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  opacity: number;
  rotation: number;
  maintainAspectRatio: boolean;
  timingMode: "relative" | "absolute";
  startPercent?: number;
  endPercent?: number;
  startSeconds?: number;
  endSeconds?: number;
}

/** Request to apply a template to a work. */
export interface TemplateApplicationRequest {
  templateId: string;
  videoDuration: number;
  placeholderValues?: Record<string, string>;
}

/** Result of applying a template (text/image overlays + track actions). */
export interface TemplateApplicationResult {
  textOverlays: Record<string, TextOverlaySnapshot>;
  textTrackActions: TimelineActionSnapshot[];
  imageOverlays: Record<string, ImageOverlaySnapshot>;
  imageTrackActions: TimelineActionSnapshot[];
  pendingPlaceholders?: string[];
  exportSettings?: { width: number; height: number; fps: number };
}

/** Template list item (meta only). */
export interface EditorTemplateList {
  templates: EditorTemplateMeta[];
  count: number;
}

export interface EditorTemplateMeta {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  textOverlayCount: number;
  imageOverlayCount: number;
  hasExportSettings: boolean;
}

/** Editor'da kaydedilen timeline/overlay/audio state (sayfa yenilense bile geri yüklenir). */
export interface TimelineActionSnapshot {
  id: string;
  start: number;
  end: number;
  sceneIndex?: number;
  trimStart?: number;
  trimEnd?: number;
  transitionType?: string;
  transitionDuration?: number;
}

export interface TextOverlaySnapshot {
  text: string;
  fontSize: number;
  fontColor: string;
  centerX: number;
  centerY: number;
}

/** Image overlay snapshot (persisted in work). */
export interface ImageOverlaySnapshot {
  assetId: string;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  opacity: number;
  rotation: number;
  maintainAspectRatio?: boolean;
}

export interface EditorStateSnapshot {
  editorData: {
    videoTrack: TimelineActionSnapshot[];
    textTrack: TimelineActionSnapshot[];
    imageTrack?: TimelineActionSnapshot[];
    audioTrack: TimelineActionSnapshot[];
  };
  textOverlays: Record<string, TextOverlaySnapshot>;
  imageOverlays?: Record<string, ImageOverlaySnapshot>;
  audioUrl?: string;
  audioVolume: number;
  exportSettings: {
    width: number;
    height: number;
    fps: number;
  };
}

/** Çalışma: bir proje altında tek bir pipeline; tüm agent promptları projeden kopyalanır, çalışmada güncellenebilir. */
export interface WorkSnapshot {
  id: string;
  projectId: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  /** Senaryo (LLM) – projeden kopyalanır, çalışmada özelleştirilebilir. */
  systemPrompt: string;
  /** Video analiz – projeden kopyalanır; boşsa proje/değer kullanılır. */
  analyzerPrompt?: string;
  /** Görsel üretim ek talimat – projeden kopyalanır. */
  imageSystemPrompt?: string;
  /** Video üretim ek talimat – projeden kopyalanır. */
  videoSystemPrompt?: string;

  currentStep: PipelineStep;
  hasReferenceVideo: boolean;
  mode: "style_transfer" | "content_remix";
  productName: string;
  productDescription: string;
  targetAudience: string;
  language: string;
  videoDuration: number | undefined;
  sceneCount: number | undefined;

  analysis: AnalysisResult | null;
  scenes: ScenarioScene[];
  generatedScenes: GeneratedSceneSnapshot[];

  /** Editor state: timeline, text overlays, audio, export settings. */
  editorState?: EditorStateSnapshot;
  
  /** Selected asset IDs for this work */
  selectedAssetIds?: string[];
  /** How to use selected assets in generation */
  assetUsageMode?: AssetUsageMode;
  /** Output resolution for image/video generation and export */
  resolution?: { width: number; height: number };
}

/** Çalışma listesi için meta. */
export interface WorkMeta {
  id: string;
  projectId: string;
  name: string;
  updatedAt: number;
}

/** Geriye dönük uyumluluk: eski tek-seviye proje snapshot'ı (artık WorkSnapshot ile proje altında). */
export interface ProjectSnapshot {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  currentStep: PipelineStep;
  hasReferenceVideo: boolean;
  mode: "style_transfer" | "content_remix";
  productName: string;
  productDescription: string;
  targetAudience: string;
  language: string;
  videoDuration: number | undefined;
  sceneCount: number | undefined;
  analysis: AnalysisResult | null;
  scenes: ScenarioScene[];
  generatedScenes: GeneratedSceneSnapshot[];
}
