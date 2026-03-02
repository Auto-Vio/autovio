import { useMemo, forwardRef, useRef, useState, useEffect, useCallback } from "react";
import type { TimelineEffect, EffectSourceParam } from "@xzdarcy/timeline-engine";
import type {
  ClipMeta,
  ClipMetaMap,
  TextOverlayMap,
  ImageOverlayMap,
  SelectedItem,
  ExportSettings,
  TimelineRow,
  TimelineAction,
  TransitionType,
} from "./types";

interface VideoPreviewProps {
  clipMeta: ClipMetaMap;
  selectedItem: SelectedItem;
  textOverlays: TextOverlayMap;
  imageOverlays?: ImageOverlayMap;
  imageAssetUrls?: Record<string, string>;
  editorData: TimelineRow[];
  currentTime: number;
  exportSettings: ExportSettings;
}

interface TransitionState {
  isTransitioning: boolean;
  progress: number; // 0 to 1
  transitionType: TransitionType;
  fromClipId: string | null;
  toClipId: string | null;
}

// Get CSS styles for transition effects
function getTransitionStyles(
  transitionType: TransitionType,
  progress: number,
  isOutgoing: boolean,
): React.CSSProperties {
  const baseStyles: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
  };

  switch (transitionType) {
    case "fade":
    case "dissolve":
      return {
        ...baseStyles,
        opacity: isOutgoing ? 1 - progress : progress,
        zIndex: isOutgoing ? 1 : 2,
      };
    case "wipeleft":
      return {
        ...baseStyles,
        clipPath: isOutgoing
          ? `inset(0 0 0 ${progress * 100}%)`
          : `inset(0 ${(1 - progress) * 100}% 0 0)`,
        zIndex: isOutgoing ? 1 : 2,
      };
    case "wiperight":
      return {
        ...baseStyles,
        clipPath: isOutgoing
          ? `inset(0 ${progress * 100}% 0 0)`
          : `inset(0 0 0 ${(1 - progress) * 100}%)`,
        zIndex: isOutgoing ? 1 : 2,
      };
    case "slideup":
      return {
        ...baseStyles,
        transform: isOutgoing
          ? `translateY(-${progress * 100}%)`
          : `translateY(${(1 - progress) * 100}%)`,
        zIndex: isOutgoing ? 1 : 2,
      };
    case "slidedown":
      return {
        ...baseStyles,
        transform: isOutgoing
          ? `translateY(${progress * 100}%)`
          : `translateY(-${(1 - progress) * 100}%)`,
        zIndex: isOutgoing ? 1 : 2,
      };
    case "cut":
    default:
      return {
        ...baseStyles,
        opacity: isOutgoing ? 0 : 1,
        zIndex: isOutgoing ? 1 : 2,
      };
  }
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
    imageEffect: {
      id: "imageEffect",
      name: "Image",
    },
    audioEffect: {
      id: "audioEffect",
      name: "Audio",
    },
  };
}

// Helper to find current and next clip based on time
function findActiveClips(
  editorData: TimelineRow[],
  clipMeta: ClipMetaMap,
  currentTime: number,
): {
  currentClip: { action: TimelineAction; meta: ClipMeta } | null;
  nextClip: { action: TimelineAction; meta: ClipMeta } | null;
  transitionState: TransitionState;
} {
  const videoTrack = editorData.find((r) => r.id === "video-track");
  if (!videoTrack) {
    return {
      currentClip: null,
      nextClip: null,
      transitionState: {
        isTransitioning: false,
        progress: 0,
        transitionType: "cut",
        fromClipId: null,
        toClipId: null,
      },
    };
  }

  // Sort actions by start time
  const sortedActions = [...videoTrack.actions].sort((a, b) => a.start - b.start);

  let currentClip: { action: TimelineAction; meta: ClipMeta } | null = null;
  let nextClip: { action: TimelineAction; meta: ClipMeta } | null = null;

  // Find current clip
  for (let i = 0; i < sortedActions.length; i++) {
    const action = sortedActions[i];
    const meta = clipMeta[action.id];
    if (!meta) continue;

    if (currentTime >= action.start && currentTime < action.end) {
      currentClip = { action, meta };
      // Check if there's a next clip
      if (i + 1 < sortedActions.length) {
        const nextAction = sortedActions[i + 1];
        const nextMeta = clipMeta[nextAction.id];
        if (nextMeta) {
          nextClip = { action: nextAction, meta: nextMeta };
        }
      }
      break;
    }
  }

  // Check if we're in a transition zone
  let transitionState: TransitionState = {
    isTransitioning: false,
    progress: 0,
    transitionType: "cut",
    fromClipId: null,
    toClipId: null,
  };

  if (currentClip && nextClip && currentClip.meta.transitionType && currentClip.meta.transitionType !== "cut") {
    const transitionDuration = currentClip.meta.transitionDuration || 0.5;
    const transitionStart = currentClip.action.end - transitionDuration;

    if (currentTime >= transitionStart && currentTime < currentClip.action.end) {
      const progress = (currentTime - transitionStart) / transitionDuration;
      transitionState = {
        isTransitioning: true,
        progress: Math.min(Math.max(progress, 0), 1),
        transitionType: currentClip.meta.transitionType,
        fromClipId: currentClip.action.id,
        toClipId: nextClip.action.id,
      };
    }
  }

  return { currentClip, nextClip, transitionState };
}

const VideoPreview = forwardRef<HTMLVideoElement, VideoPreviewProps>(
  function VideoPreview(
    { clipMeta, selectedItem, textOverlays, imageOverlays = {}, imageAssetUrls = {}, editorData, currentTime, exportSettings },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const secondaryVideoRef = useRef<HTMLVideoElement>(null);
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

    // Find active clips and transition state
    const { currentClip, nextClip, transitionState } = useMemo(
      () => findActiveClips(editorData, clipMeta, currentTime),
      [editorData, clipMeta, currentTime],
    );

    // Sync secondary video for transitions
    useEffect(() => {
      const secondaryVideo = secondaryVideoRef.current;
      if (!secondaryVideo || !transitionState.isTransitioning || !nextClip) return;

      const nextMeta = nextClip.meta;
      if (!nextMeta?.videoUrl) return;

      // Load the next video if not already loaded
      if (secondaryVideo.src !== nextMeta.videoUrl) {
        secondaryVideo.src = nextMeta.videoUrl;
        secondaryVideo.load();
      }

      // Calculate the local time within the next clip
      // During transition, the next clip starts playing from the beginning
      const transitionDuration = currentClip?.meta.transitionDuration || 0.5;
      const transitionStart = currentClip ? currentClip.action.end - transitionDuration : 0;
      const timeIntoTransition = currentTime - transitionStart;
      const localTime = Math.max(0, timeIntoTransition);

      // Sync the currentTime
      if (Math.abs(secondaryVideo.currentTime - localTime) > 0.1) {
        secondaryVideo.currentTime = localTime;
      }

      // Play if the primary video is playing
      if (!secondaryVideo.paused) return;
      secondaryVideo.play().catch(() => {});
    }, [transitionState.isTransitioning, nextClip, currentClip, currentTime]);

    const selectedMeta: ClipMeta | undefined =
      selectedItem?.type === "clip" ? clipMeta[selectedItem.actionId] : undefined;

    const fallbackMeta = useMemo(() => {
      if (selectedMeta) return undefined;
      if (currentClip) return currentClip.meta;
      const videoTrack = editorData.find((r) => r.id === "video-track");
      if (!videoTrack) return undefined;
      for (const a of videoTrack.actions) {
        if (clipMeta[a.id]?.videoUrl) return clipMeta[a.id];
      }
      return undefined;
    }, [selectedMeta, currentClip, editorData, clipMeta]);

    const displayMeta = selectedMeta || fallbackMeta;
    const hasVideo = !!displayMeta?.videoUrl;
    const hasImage = !hasVideo && !!displayMeta?.imageUrl;
    const isEmpty = !hasVideo && !hasImage;

    // Get the next clip's meta for transition preview
    const nextClipMeta = transitionState.isTransitioning && nextClip ? nextClip.meta : null;

    const visibleTexts = useMemo(() => {
      const textTrack = editorData.find((r) => r.id === "text-track");
      if (!textTrack) return [];
      return textTrack.actions
        .filter((a) => currentTime >= a.start && currentTime <= a.end)
        .map((a) => textOverlays[a.id])
        .filter(Boolean);
    }, [editorData, currentTime, textOverlays]);

    const visibleImages = useMemo(() => {
      const imageTrack = editorData.find((r) => r.id === "image-track");
      if (!imageTrack) return [];
      return imageTrack.actions
        .filter((a) => currentTime >= a.start && currentTime <= a.end)
        .map((a) => imageOverlays[a.id])
        .filter(Boolean);
    }, [editorData, currentTime, imageOverlays]);

    // Ensure scale is valid (at least a small positive number)
    const safeScale = scale > 0 ? scale : 0.1;

    // Calculate transition styles
    const primaryVideoStyles = transitionState.isTransitioning
      ? getTransitionStyles(transitionState.transitionType, transitionState.progress, true)
      : { position: "absolute" as const, inset: 0, width: "100%", height: "100%", objectFit: "contain" as const };

    const secondaryVideoStyles = transitionState.isTransitioning
      ? getTransitionStyles(transitionState.transitionType, transitionState.progress, false)
      : { position: "absolute" as const, inset: 0, width: "100%", height: "100%", objectFit: "contain" as const, opacity: 0 };

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
              overflow: "hidden",
            }}
          >
            {/* Primary video */}
            <video
              ref={ref}
              style={{
                ...primaryVideoStyles,
                display: hasVideo ? "block" : "none",
              }}
              playsInline
              muted
            />
            {/* Secondary video for transitions */}
            <video
              ref={secondaryVideoRef}
              style={{
                ...secondaryVideoStyles,
                display: transitionState.isTransitioning && nextClipMeta?.videoUrl ? "block" : "none",
              }}
              src={nextClipMeta?.videoUrl || ""}
              playsInline
              muted
            />
            {hasImage && !transitionState.isTransitioning && (
              <img
                src={displayMeta!.imageUrl}
                alt={displayMeta!.label}
                className="absolute inset-0 w-full h-full object-contain"
              />
            )}
            {isEmpty && !transitionState.isTransitioning && (
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
                  zIndex: 10,
                }}
              >
                {overlay.text}
              </div>
            ))}

            {visibleImages.map((overlay) => {
              const src = imageAssetUrls[overlay.assetId] || overlay.assetUrl;
              if (!src) return null;
              return (
                <div
                  key={overlay.id}
                  className="absolute pointer-events-none"
                  style={{
                    left: "50%",
                    top: "50%",
                    width: overlay.width,
                    height: overlay.height,
                    transform: `translate(calc(-50% + ${overlay.centerX}px), calc(-50% + ${overlay.centerY}px)) rotate(${overlay.rotation}deg)`,
                    opacity: overlay.opacity,
                    zIndex: 10,
                  }}
                >
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </div>
              );
            })}
          </div>
        </div>
        {displayMeta && (
          <div className="px-3 py-2 border-t border-gray-800">
            <p className="text-xs text-gray-400">
              {displayMeta.label}
              {transitionState.isTransitioning && (
                <span className="ml-2 text-purple-400">
                  ({transitionState.transitionType} {Math.round(transitionState.progress * 100)}%)
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    );
  },
);

export default VideoPreview;
