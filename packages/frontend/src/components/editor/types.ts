import type { TimelineRow, TimelineAction } from "@xzdarcy/timeline-engine";
import type { TimelineEffect } from "@xzdarcy/timeline-engine";

export interface ClipMeta {
  sceneIndex: number;
  imageUrl?: string;
  videoUrl?: string;
  label: string;
}

export type ClipMetaMap = Record<string, ClipMeta>;

export interface TextOverlay {
  id: string;
  text: string;
  fontSize: number;
  fontColor: string;
  centerX: number;
  centerY: number;
}

export type TextOverlayMap = Record<string, TextOverlay>;

export interface AudioMeta {
  volume: number;
}

export interface ExportSettings {
  width: number;
  height: number;
  fps: number;
}

export type SelectedItem =
  | { type: "clip"; actionId: string }
  | { type: "text"; actionId: string }
  | { type: "audio"; actionId: string }
  | null;

export type { TimelineRow, TimelineAction, TimelineEffect };
