import { useMemo, forwardRef, useRef, useState, useEffect } from "react";
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
          if (Math.abs(video.currentTime - localTime) > 0.1) {
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
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    // Calculate scale using ResizeObserver to handle container resizing
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      const updateScale = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        if (!w || !h || !exportSettings.width || !exportSettings.height) return;
        const scaleX = w / exportSettings.width;
        const scaleY = h / exportSettings.height;
        setScale(Math.min(scaleX, scaleY, 1));
      };

      // Initial calculation
      updateScale();

      // Use ResizeObserver for dynamic updates
      const observer = new ResizeObserver(updateScale);
      observer.observe(el);

      return () => observer.disconnect();
    }, [exportSettings.width, exportSettings.height]);

    const selectedMeta: ClipMeta | undefined =
      selectedItem?.type === "clip" ? clipMeta[selectedItem.actionId] : undefined;

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

    const visibleTexts = useMemo(() => {
      const textTrack = editorData.find((r) => r.id === "text-track");
      if (!textTrack) return [];
      return textTrack.actions
        .filter((a) => currentTime >= a.start && currentTime <= a.end)
        .map((a) => textOverlays[a.id])
        .filter(Boolean);
    }, [editorData, currentTime, textOverlays]);

    // Ensure scale is valid (at least a small positive number)
    const safeScale = scale > 0 ? scale : 0.1;

    return (
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div
          ref={containerRef}
          className="w-full flex items-center justify-center bg-black relative overflow-hidden"
          style={{
            aspectRatio: `${exportSettings.width} / ${exportSettings.height}`,
            minHeight: 200,
          }}
        >
          <div
            style={{
              width: exportSettings.width,
              height: exportSettings.height,
              transform: `scale(${safeScale})`,
              transformOrigin: "center center",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <video
              ref={ref}
              className="absolute inset-0 w-full h-full object-contain"
              style={{ display: hasVideo ? "block" : "none" }}
              playsInline
              muted
            />
            {hasImage && (
              <img
                src={displayMeta!.imageUrl}
                alt={displayMeta!.label}
                className="absolute inset-0 w-full h-full object-contain"
              />
            )}
            {isEmpty && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">
                Select a clip to preview
              </div>
            )}

            {visibleTexts.map((overlay) => (
              <div
                key={overlay.id}
                className="absolute pointer-events-none"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `translate(calc(-50% + ${overlay.centerX}px), calc(-50% + ${overlay.centerY}px))`,
                  fontSize: `${overlay.fontSize}px`,
                  color: overlay.fontColor,
                  textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
                  fontFamily: "Arial, sans-serif",
                  fontWeight: "bold",
                  whiteSpace: "pre-wrap",
                  textAlign: "center",
                }}
              >
                {overlay.text}
              </div>
            ))}
          </div>
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
