import type { AnalysisResult } from "./analysis.js";
import type { ScenarioScene } from "./scenario.js";

export type PipelineStep = 0 | 1 | 2 | 3 | 4;

export interface GeneratedSceneSnapshot {
  sceneIndex: number;
  imageUrl?: string;
  videoUrl?: string;
  status: "pending" | "generating_image" | "generating_video" | "done" | "error";
  error?: string;
}

/** Varsayılan senaryo sistem promptu (proje/çalışma oluşturulurken kullanılır). */
export const DEFAULT_SCENARIO_SYSTEM_PROMPT = `You are a creative director specializing in social media video production.
Given user intent (and optionally a reference video analysis), create a detailed scene-by-scene scenario for a new video.
Each scene must have prompts ready for AI image and video generation.

For image prompts: Be highly descriptive, include lighting, lens type, style, quality keywords.
For video prompts: Describe camera movement, motion, and cinematic style.
For negative prompts: List what should NOT appear in the image.

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

/** Proje: üst seviye; tüm agent sistem promptları ve knowledge burada. */
export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
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
}

/** Proje listesi için meta. */
export interface ProjectMeta {
  id: string;
  name: string;
  updatedAt: number;
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
