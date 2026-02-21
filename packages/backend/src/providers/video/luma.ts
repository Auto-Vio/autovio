import type { ModelOption } from "@viragen/shared";
import type { IVideoProvider } from "../interfaces.js";

export class LumaProvider implements IVideoProvider {
  readonly id = "luma";
  readonly name = "Luma Dream Machine";
  readonly models: ModelOption[] = [
    { id: "luma-v1", name: "Dream Machine V1", description: "Standard quality" },
  ];

  async convert(_imageUrl: string, _prompt: string, _duration: number, _apiKey: string, _modelId?: string): Promise<string> {
    throw new Error("Luma provider not yet implemented");
  }
}
