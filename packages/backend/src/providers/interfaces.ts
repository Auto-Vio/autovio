import type { AnalysisResult, ModelOption } from "@autovio/shared";

export interface IVisionProvider {
  readonly id: string;
  readonly name: string;
  readonly models: ModelOption[];
  analyze(
    videoBuffer: Buffer,
    mimeType: string,
    mode: "style_transfer" | "content_remix",
    apiKey: string,
    modelId?: string,
    customPrompt?: string,
  ): Promise<AnalysisResult>;
}

export interface ILLMProvider {
  readonly id: string;
  readonly name: string;
  readonly models: ModelOption[];
  generate(
    systemPrompt: string,
    userPrompt: string,
    apiKey: string,
    modelId?: string,
  ): Promise<string>;
}

export interface IImageProvider {
  readonly id: string;
  readonly name: string;
  readonly models: ModelOption[];
  generate(
    prompt: string,
    negativePrompt: string,
    apiKey: string,
    modelId?: string,
  ): Promise<string>;
}

export interface IVideoProvider {
  readonly id: string;
  readonly name: string;
  readonly models: ModelOption[];
  convert(
    imageUrl: string,
    prompt: string,
    duration: number,
    apiKey: string,
    modelId?: string,
  ): Promise<string>;
}
