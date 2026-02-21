import type { ModelOption } from "@viragen/shared";
import type { IVideoProvider } from "../interfaces.js";

export class KlingProvider implements IVideoProvider {
  readonly id = "kling";
  readonly name = "Kling";
  readonly models: ModelOption[] = [
    { id: "kling-v1", name: "Kling V1", description: "Standard quality" },
  ];

  async convert(_imageUrl: string, _prompt: string, _duration: number, _apiKey: string, _modelId?: string): Promise<string> {
    throw new Error("Kling provider not yet implemented");
  }
}
