import { useState } from "react";
import { Download, Loader2, X } from "lucide-react";
import type { TimelineRow, ClipMetaMap, TextOverlayMap, AudioMeta, ExportSettings } from "./types";
import type { ExportRequest } from "@viragen/shared";

interface ExportDialogProps {
  editorData: TimelineRow[];
  clipMeta: ClipMetaMap;
  textOverlays: TextOverlayMap;
  audioFile: File | null;
  audioMeta: AudioMeta;
  projectId: string | null;
  workId: string | null;
  settings: ExportSettings;
  onSettingsChange: (settings: ExportSettings) => void;
  onClose: () => void;
}

const RESOLUTION_PRESETS = [
  { label: "1080×1920 Vertical (9:16)", width: 1080, height: 1920 },
  { label: "1920×1080 Horizontal (16:9)", width: 1920, height: 1080 },
  { label: "720×1280 Vertical HD", width: 720, height: 1280 },
] as const;

const FPS_OPTIONS = [30, 60] as const;

export default function ExportDialog({
  editorData,
  clipMeta,
  textOverlays,
  audioFile,
  audioMeta,
  projectId,
  workId,
  settings,
  onSettingsChange,
  onClose,
}: ExportDialogProps) {
  const [exporting, setExporting] = useState(false);

  const videoTrack = editorData.find((r) => r.id === "video-track");
  const orderedActions = videoTrack
    ? [...videoTrack.actions].sort((a, b) => a.start - b.start)
    : [];
  const hasClips = orderedActions.some((a) => clipMeta[a.id]?.videoUrl);

  const handleExport = async () => {
    if (!hasClips || !projectId || !workId) return;

    setExporting(true);
    try {
      const clips = orderedActions
        .filter((a) => clipMeta[a.id]?.videoUrl)
        .map((a) => ({
          sceneIndex: clipMeta[a.id]!.sceneIndex,
          position: a.start,
          end: a.end,
          cutFrom: 0,
        }));

      // Build text overlays from text-track actions + textOverlays metadata
      const textTrack = editorData.find((r) => r.id === "text-track");
      const texts = textTrack?.actions
        .map((a) => {
          const overlay = textOverlays[a.id];
          if (!overlay) return null;
          return {
            text: overlay.text,
            position: a.start,
            end: a.end,
            fontSize: overlay.fontSize,
            fontColor: overlay.fontColor,
            centerX: overlay.centerX,
            centerY: overlay.centerY,
          };
        })
        .filter((t): t is NonNullable<typeof t> => t !== null);

      const body: ExportRequest = {
        projectId,
        workId,
        clips,
        texts: texts && texts.length > 0 ? texts : undefined,
        audio: audioFile ? { volume: audioMeta.volume } : undefined,
        options: {
          width: settings.width,
          height: settings.height,
          fps: settings.fps,
        },
      };

      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Export failed" }));
        throw new Error(err.error || `Export failed (${res.status})`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "viragen-export.mp4";
      a.click();
      URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
      console.error("Export failed:", err);
      alert(`Export failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white">Export Settings</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Resolution */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Resolution</p>
          <div className="space-y-2">
            {RESOLUTION_PRESETS.map((preset) => {
              const isActive =
                settings.width === preset.width && settings.height === preset.height;
              return (
                <button
                  key={`${preset.width}x${preset.height}`}
                  onClick={() =>
                    onSettingsChange({
                      ...settings,
                      width: preset.width,
                      height: preset.height,
                    })
                  }
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-purple-600/30 border border-purple-500 text-white"
                      : "bg-gray-800 border border-gray-700 text-gray-300 hover:border-gray-600"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* FPS */}
        <div className="mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">FPS</p>
          <div className="flex gap-2">
            {FPS_OPTIONS.map((fps) => (
              <button
                key={fps}
                onClick={() => onSettingsChange({ ...settings, fps })}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  settings.fps === fps
                    ? "bg-purple-600/30 border border-purple-500 text-white"
                    : "bg-gray-800 border border-gray-700 text-gray-300 hover:border-gray-600"
                }`}
              >
                {fps}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={exporting}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || !hasClips || !projectId || !workId}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white transition-colors"
          >
            {exporting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download size={16} />
                Export MP4
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
