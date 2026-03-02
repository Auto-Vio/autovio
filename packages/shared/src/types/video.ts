export interface VideoClip {
  sceneIndex: number;
  videoUrl: string;
  imageUrl: string;
  duration: number;
}

export interface Asset {
  type: "logo" | "text" | "audio";
  url?: string;
  content?: string;
  position?: { x: number; y: number };
}

export interface ExportOptions {
  format: "mp4";
  resolution: "720p" | "1080p";
  fps: 30 | 60;
}

export interface ExportRequestClip {
  sceneIndex: number;
  position: number;
  end: number;
  cutFrom?: number;
  transition?: string;
  transitionDuration?: number;
}

export interface ExportRequestText {
  text: string;
  position: number;
  end: number;
  fontSize?: number;
  fontColor?: string;
  centerX?: number;
  centerY?: number;
  x?: number;
  y?: number;
}

export interface ExportRequest {
  projectId: string;
  workId: string;
  clips: ExportRequestClip[];
  audio?: { volume?: number; audioUrl?: string };
  texts?: ExportRequestText[];
  options: {
    width: number;
    height: number;
    fps: number;
  };
}
