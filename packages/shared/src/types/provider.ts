export type ProviderCategory = "vision" | "llm" | "image" | "video";

export interface ModelOption {
  id: string;
  name: string;
  description?: string;
}

export interface ProviderInfo {
  id: string;
  name: string;
  category: ProviderCategory;
  description: string;
  models: ModelOption[];
}

export interface ProviderSelection {
  providerId: string;
  modelId: string;
}

export interface ProviderConfig {
  vision: ProviderSelection;
  llm: ProviderSelection;
  image: ProviderSelection;
  video: ProviderSelection;
}
