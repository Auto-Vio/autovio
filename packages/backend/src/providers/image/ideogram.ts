import type { ModelOption } from "@autovio/shared";
import type { IImageProvider } from "../interfaces.js";

export class IdeogramProvider implements IImageProvider {
  readonly id = "ideogram";
  readonly name = "Ideogram";
  readonly models: ModelOption[] = [
    { id: "ideogram-v2", name: "Ideogram V2", description: "Latest model" },
  ];

  async generate(_prompt: string, _negativePrompt: string, _apiKey: string, _modelId?: string): Promise<string> {
    throw new Error("Ideogram provider not yet implemented");
  }
}
