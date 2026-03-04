import type {
  IVisionProvider,
  ILLMProvider,
  IImageProvider,
  IVideoProvider,
} from "./interfaces.js";
import type { ProviderInfo } from "@autovio/shared";

// Vision providers
import { GeminiVisionProvider } from "./vision/gemini.js";
import { ClaudeVisionProvider } from "./vision/claude.js";
import { OpenAIVisionProvider } from "./vision/openai.js";

// LLM providers
import { GeminiLLMProvider } from "./llm/gemini.js";
import { ClaudeLLMProvider } from "./llm/claude.js";
import { OpenAILLMProvider } from "./llm/openai.js";

// Image providers
import { DallEProvider } from "./image/dalle.js";
import { GeminiImageProvider } from "./image/gemini.js";

// Video providers
import { RunwayProvider } from "./video/runway.js";
import { GeminiVideoProvider } from "./video/gemini.js";

const visionProviders: Record<string, IVisionProvider> = {
  gemini: new GeminiVisionProvider(),
  claude: new ClaudeVisionProvider(),
  openai: new OpenAIVisionProvider(),
};

const llmProviders: Record<string, ILLMProvider> = {
  gemini: new GeminiLLMProvider(),
  claude: new ClaudeLLMProvider(),
  openai: new OpenAILLMProvider(),
};

const imageProviders: Record<string, IImageProvider> = {
  gemini: new GeminiImageProvider(),
  dalle: new DallEProvider(),
};

const videoProviders: Record<string, IVideoProvider> = {
  gemini: new GeminiVideoProvider(),
  runway: new RunwayProvider(),
};

export function getVisionProvider(id: string): IVisionProvider {
  const provider = visionProviders[id];
  if (!provider) throw new Error(`Unknown vision provider: ${id}`);
  return provider;
}

export function getLLMProvider(id: string): ILLMProvider {
  const provider = llmProviders[id];
  if (!provider) throw new Error(`Unknown LLM provider: ${id}`);
  return provider;
}

export function getImageProvider(id: string): IImageProvider {
  const provider = imageProviders[id];
  if (!provider) throw new Error(`Unknown image provider: ${id}`);
  return provider;
}

export function getVideoProvider(id: string): IVideoProvider {
  const provider = videoProviders[id];
  if (!provider) throw new Error(`Unknown video provider: ${id}`);
  return provider;
}

export function listProviders(): ProviderInfo[] {
  const all: ProviderInfo[] = [];

  for (const p of Object.values(visionProviders)) {
    all.push({ id: p.id, name: p.name, category: "vision", description: `Vision analysis via ${p.name}`, models: p.models });
  }
  for (const p of Object.values(llmProviders)) {
    all.push({ id: p.id, name: p.name, category: "llm", description: `Text generation via ${p.name}`, models: p.models });
  }
  for (const p of Object.values(imageProviders)) {
    all.push({ id: p.id, name: p.name, category: "image", description: `Image generation via ${p.name}`, models: p.models });
  }
  for (const p of Object.values(videoProviders)) {
    all.push({ id: p.id, name: p.name, category: "video", description: `Video generation via ${p.name}`, models: p.models });
  }

  return all;
}
