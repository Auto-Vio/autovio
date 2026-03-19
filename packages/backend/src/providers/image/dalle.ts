import OpenAI from "openai";
import type { ModelOption } from "@autovio/shared";
import type { IImageProvider } from "../interfaces.js";

export class DallEProvider implements IImageProvider {
  readonly id = "dalle";
  readonly name = "DALL-E";
  readonly models: ModelOption[] = [
    { id: "dall-e-3", name: "DALL-E 3", description: "Highest quality, prompt rewriting" },
    { id: "dall-e-2", name: "DALL-E 2", description: "Faster, more affordable" },
  ];

  async generate(
    prompt: string,
    _negativePrompt: string,
    apiKey: string,
    modelId = "dall-e-3",
    resolution?: { width: number; height: number },
  ): Promise<string> {
    const client = new OpenAI({ apiKey });

    let size: "1024x1024" | "1792x1024" | "1024x1792" | "512x512" = modelId === "dall-e-3" ? "1024x1024" : "512x512";
    if (modelId === "dall-e-3" && resolution) {
      const { width, height } = resolution;
      if (height > width) size = "1024x1792";
      else if (width > height) size = "1792x1024";
      else size = "1024x1024";
    }

    const response = await client.images.generate({
      model: modelId,
      prompt,
      n: 1,
      size,
      quality: modelId === "dall-e-3" ? "hd" : "standard",
    });

    const url = response.data?.[0]?.url;
    if (!url) throw new Error("DALL-E returned no image URL");
    return url;
  }
}
