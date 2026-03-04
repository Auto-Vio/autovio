import type {
  EditorStateSnapshot,
  EditorTemplateContent,
  TemplateTextOverlay,
  TemplateImageOverlay,
} from "@autovio/shared";

const PLACEHOLDER_REGEX = /\{\{([^}]+)\}\}/g;

/** Extract placeholder keys from text (e.g. {{product_name}} -> product_name) */
export function findPlaceholders(text: string): string[] {
  const keys = new Set<string>();
  let m: RegExpExecArray | null;
  PLACEHOLDER_REGEX.lastIndex = 0;
  while ((m = PLACEHOLDER_REGEX.exec(text)) !== null) {
    keys.add(m[1].trim());
  }
  return Array.from(keys);
}

/** Replace placeholders in text with values */
export function replacePlaceholders(
  text: string,
  values: Record<string, string>
): string {
  if (!values || Object.keys(values).length === 0) return text;
  return text.replace(PLACEHOLDER_REGEX, (_, key: string) => {
    const k = key.trim();
    return values[k] ?? `{{${key}}}`;
  });
}

/** Build template content from current editor state (text + image overlays, optional export settings). */
export function extractTemplateFromEditorState(
  editorState: EditorStateSnapshot,
  options: {
    includeExportSettings?: boolean;
    timingMode?: "relative" | "absolute";
    videoDuration: number;
  }
): EditorTemplateContent {
  const { includeExportSettings = false, timingMode = "relative", videoDuration } = options;
  const textTrack = editorState.editorData?.textTrack ?? [];
  const imageTrack = editorState.editorData?.imageTrack ?? [];
  const textOverlays = editorState.textOverlays ?? {};
  const imageOverlays = editorState.imageOverlays ?? {};

  const textOverlayList: TemplateTextOverlay[] = textTrack
    .map((action) => {
      const snap = textOverlays[action.id];
      if (!snap) return null;
      const start = action.start;
      const end = action.end;
      const startPercent = timingMode === "relative" ? (start / videoDuration) * 100 : undefined;
      const endPercent = timingMode === "relative" ? (end / videoDuration) * 100 : undefined;
      const startSeconds = timingMode === "absolute" ? start : undefined;
      const endSeconds = timingMode === "absolute" ? end : undefined;
      return {
        id: action.id,
        text: snap.text,
        fontSize: snap.fontSize,
        fontColor: snap.fontColor,
        centerX: snap.centerX,
        centerY: snap.centerY,
        timingMode,
        startPercent,
        endPercent,
        startSeconds,
        endSeconds,
      } as TemplateTextOverlay;
    })
    .filter((t): t is TemplateTextOverlay => t != null);

  const imageOverlayList: TemplateImageOverlay[] = imageTrack
    .map((action) => {
      const snap = imageOverlays[action.id];
      if (!snap) return null;
      const start = action.start;
      const end = action.end;
      const startPercent = timingMode === "relative" ? (start / videoDuration) * 100 : undefined;
      const endPercent = timingMode === "relative" ? (end / videoDuration) * 100 : undefined;
      const startSeconds = timingMode === "absolute" ? start : undefined;
      const endSeconds = timingMode === "absolute" ? end : undefined;
      return {
        id: action.id,
        assetId: snap.assetId,
        width: snap.width,
        height: snap.height,
        centerX: snap.centerX,
        centerY: snap.centerY,
        opacity: snap.opacity,
        rotation: snap.rotation,
        maintainAspectRatio: snap.maintainAspectRatio ?? true,
        timingMode,
        startPercent,
        endPercent,
        startSeconds,
        endSeconds,
      } as TemplateImageOverlay;
    })
    .filter((t): t is TemplateImageOverlay => t != null);

  return {
    textOverlays: textOverlayList,
    imageOverlays: imageOverlayList,
    ...(includeExportSettings && editorState.exportSettings && {
      exportSettings: editorState.exportSettings,
    }),
  };
}

/** Check if current editor has any overlay content to save as template */
export function hasOverlayContentToSave(editorState: EditorStateSnapshot): boolean {
  const textCount = editorState.editorData?.textTrack?.length ?? 0;
  const imageCount = editorState.editorData?.imageTrack?.length ?? 0;
  return textCount > 0 || imageCount > 0;
}
