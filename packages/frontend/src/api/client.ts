import type { AnalysisResult, ScenarioScene, ProviderInfo, ProviderConfig } from "@viragen/shared";

const DEFAULT_CONFIG: ProviderConfig = {
  vision: { providerId: "gemini", modelId: "gemini-2.0-flash" },
  llm: { providerId: "gemini", modelId: "gemini-2.0-flash" },
  image: { providerId: "dalle", modelId: "dall-e-3" },
  video: { providerId: "runway", modelId: "gen3a_turbo" },
};

function getApiKeys(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem("viragen_api_keys") || "{}");
  } catch {
    return {};
  }
}

export function getProviderConfig(): ProviderConfig {
  try {
    const stored = localStorage.getItem("viragen_providers");
    if (stored) return JSON.parse(stored);
    return DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

function getHeaders(category: keyof ProviderConfig): Record<string, string> {
  const config = getProviderConfig();
  const keys = getApiKeys();
  const selection = config[category];

  return {
    [`x-${category}-provider`]: selection.providerId,
    "x-model-id": selection.modelId,
    "x-api-key": keys[selection.providerId] || "",
  };
}

export async function analyzeVideo(
  file: File,
  mode: "style_transfer" | "content_remix",
  options?: { analyzerPrompt?: string },
): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("video", file);
  formData.append("mode", mode);
  if (options?.analyzerPrompt?.trim()) {
    formData.append("analyzerPrompt", options.analyzerPrompt.trim());
  }

  const headers = getHeaders("vision");

  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "x-vision-provider": headers["x-vision-provider"],
      "x-model-id": headers["x-model-id"],
      "x-api-key": headers["x-api-key"],
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Analysis failed");
  }

  return res.json();
}

export async function buildScenario(
  analysis: AnalysisResult | null,
  intent: { mode: string; product_name?: string; product_description?: string; target_audience?: string; language?: string; video_duration?: number; scene_count?: number },
  options?: { systemPrompt?: string; knowledge?: string },
): Promise<ScenarioScene[]> {
  const headers = getHeaders("llm");

  const res = await fetch("/api/scenario", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-llm-provider": headers["x-llm-provider"],
      "x-model-id": headers["x-model-id"],
      "x-api-key": headers["x-api-key"],
    },
    body: JSON.stringify({
      analysis: analysis || undefined,
      intent,
      systemPrompt: options?.systemPrompt,
      knowledge: options?.knowledge,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Scenario generation failed");
  }

  const data = await res.json();
  return data.scenes;
}

async function parseErrorResponse(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const json = JSON.parse(text) as { error?: string };
    return json.error || text || `Request failed (${res.status})`;
  } catch {
    return text || `Request failed (${res.status} ${res.statusText})`;
  }
}

export async function generateImage(
  prompt: string,
  negativePrompt: string,
  options?: { imageInstruction?: string },
): Promise<string> {
  const headers = getHeaders("image");

  const res = await fetch("/api/generate/image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-image-provider": headers["x-image-provider"],
      "x-model-id": headers["x-model-id"],
      "x-api-key": headers["x-api-key"],
    },
    body: JSON.stringify({
      prompt,
      negative_prompt: negativePrompt,
      image_instruction: options?.imageInstruction?.trim() || undefined,
    }),
  });

  if (!res.ok) {
    const message = await parseErrorResponse(res);
    throw new Error(message);
  }

  const data = (await res.json()) as { imageUrl?: string };
  if (!data.imageUrl) throw new Error("Image generation failed: no URL returned");
  return data.imageUrl;
}

export async function generateVideo(
  imageUrl: string,
  prompt: string,
  duration: number,
  options?: { videoInstruction?: string },
): Promise<string> {
  const headers = getHeaders("video");

  const res = await fetch("/api/generate/video", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-video-provider": headers["x-video-provider"],
      "x-model-id": headers["x-model-id"],
      "x-api-key": headers["x-api-key"],
    },
    body: JSON.stringify({
      image_url: imageUrl,
      prompt,
      duration,
      video_instruction: options?.videoInstruction?.trim() || undefined,
    }),
  });

  if (!res.ok) {
    const message = await parseErrorResponse(res);
    throw new Error(message);
  }

  const data = (await res.json()) as { videoUrl?: string };
  if (!data.videoUrl) throw new Error("Video generation failed: no URL returned");
  return data.videoUrl;
}

export async function fetchProviders(): Promise<ProviderInfo[]> {
  const res = await fetch("/api/providers");
  return res.json();
}
