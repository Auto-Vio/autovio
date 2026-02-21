import OpenAI from "openai";
import type { ModelOption } from "@viragen/shared";
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
  ): Promise<string> {
    const client = new OpenAI({ apiKey });

    const response = await client.images.generate({
      model: modelId,
      prompt,
      n: 1,
      size: modelId === "dall-e-3" ? "1024x1024" : "512x512",
      quality: modelId === "dall-e-3" ? "hd" : "standard",
    });

    const url = response.data?.[0]?.url;
    if (!url) throw new Error("DALL-E returned no image URL");
    return url;
  }
}
