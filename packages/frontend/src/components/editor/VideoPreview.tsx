import { useMemo, forwardRef } from "react";
import type { TimelineEffect, EffectSourceParam } from "@xzdarcy/timeline-engine";
import type {
  ClipMeta,
  ClipMetaMap,
  TextOverlayMap,
  SelectedItem,
  ExportSettings,
  TimelineRow,
} from "./types";

interface VideoPreviewProps {
  clipMeta: ClipMetaMap;
  selectedItem: SelectedItem;
  textOverlays: TextOverlayMap;
  editorData: TimelineRow[];
  currentTime: number;
  exportSettings: ExportSettings;
}

export function createVideoEffect(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  clipMeta: ClipMetaMap,
): Record<string, TimelineEffect> {
  return {
    videoEffect: {
      id: "videoEffect",
      name: "Video",
      source: {
        enter: ({ action, time }: EffectSourceParam) => {
          const video = videoRef.current;
          const meta = clipMeta[action.id];
          if (!video || !meta?.videoUrl) return;
          if (video.src !== meta.videoUrl) {
            video.src = meta.videoUrl;
            video.load();
          }
          video.currentTime = time - action.start;
          video.play().catch(() => {});
        },
        update: ({ action, time }: EffectSourceParam) => {
          const video = videoRef.current;
          if (!video || video.paused) return;
          const localTime = time - action.start;
          if (Math.abs(video.currentTime - localTime) > 0.3) {
            video.currentTime = localTime;
          }
        },
        leave: () => {
          videoRef.current?.pause();
        },
        stop: () => {
          videoRef.current?.pause();
        },
      },
    },
    textEffect: {
      id: "textEffect",
      name: "Text",
    },
    audioEffect: {
      id: "audioEffect",
      name: "Audio",
    },
  };
}

const VideoPreview = forwardRef<HTMLVideoElement, VideoPreviewProps>(
  function VideoPreview(
    { clipMeta, selectedItem, textOverlays, editorData, currentTime, exportSettings },
    ref,
  ) {
    const selectedMeta: ClipMeta | undefined =
      selectedItem?.type === "clip" ? clipMeta[selectedItem.actionId] : undefined;

    // Find first clip with video to show if nothing selected
    const fallbackMeta = useMemo(() => {
      if (selectedMeta) return undefined;
      const videoTrack = editorData.find((r) => r.id === "video-track");
      if (!videoTrack) return undefined;
      for (const a of videoTrack.actions) {
        if (clipMeta[a.id]?.videoUrl) return clipMeta[a.id];
      }
      return undefined;
    }, [selectedMeta, editorData, clipMeta]);

    const displayMeta = selectedMeta || fallbackMeta;
    const hasVideo = !!displayMeta?.videoUrl;
    const hasImage = !hasVideo && !!displayMeta?.imageUrl;
    const isEmpty = !hasVideo && !hasImage;

    // Find visible text overlays based on currentTime
    const visibleTexts = useMemo(() => {
      const textTrack = editorData.find((r) => r.id === "text-track");
      if (!textTrack) return [];
      return textTrack.actions
        .filter((a) => currentTime >= a.start && currentTime <= a.end)
        .map((a) => textOverlays[a.id])
        .filter(Boolean);
    }, [editorData, currentTime, textOverlays]);

    return (
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="relative aspect-video bg-black">
          <video
            ref={ref}
            className="w-full h-full object-contain"
            style={{ display: hasVideo ? "block" : "none" }}
            playsInline
            muted
          />
          {hasImage && (
            <img
              src={displayMeta!.imageUrl}
              alt={displayMeta!.label}
              className="w-full h-full object-contain"
            />
          )}
          {isEmpty && (
            <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
              Select a clip to preview
            </div>
          )}

          {/* CSS Text Overlays */}
          {visibleTexts.map((overlay) => (
            <div
              key={overlay.id}
              className="absolute pointer-events-none"
              style={{
                left: `calc(50% + ${overlay.centerX * (100 / exportSettings.width)}%)`,
                top: `calc(50% + ${overlay.centerY * (100 / exportSettings.height)}%)`,
                transform: "translate(-50%, -50%)",
                fontSize: `${overlay.fontSize * (100 / exportSettings.width) * 6}vw`,
                color: overlay.fontColor,
                textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
                fontFamily: "Arial, sans-serif",
                fontWeight: "bold",
                whiteSpace: "nowrap",
                maxWidth: "90%",
              }}
            >
              {overlay.text}
            </div>
          ))}
        </div>
        {displayMeta && (
          <div className="px-3 py-2 border-t border-gray-800">
            <p className="text-xs text-gray-400">{displayMeta.label}</p>
          </div>
        )}
      </div>
    );
  },
);

export default VideoPreview;
