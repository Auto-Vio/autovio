import type { ModelOption } from "@autovio/shared";
import type { IImageProvider } from "../interfaces.js";

export class FluxProvider implements IImageProvider {
  readonly id = "flux";
  readonly name = "Flux";
  readonly models: ModelOption[] = [
    { id: "flux-1.1-pro", name: "Flux 1.1 Pro", description: "Highest quality" },
    { id: "flux-1-schnell", name: "Flux Schnell", description: "Fast generation" },
  ];

  async generate(_prompt: string, _negativePrompt: string, _apiKey: string, _modelId?: string): Promise<string> {
    throw new Error("Flux provider not yet implemented");
  }
}
