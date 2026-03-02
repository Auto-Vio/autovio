import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Timeline as TimelineEditor,
  type TimelineState,
} from "@xzdarcy/react-timeline-editor";
import type { TimelineRow, TimelineAction, TimelineEffect } from "@xzdarcy/timeline-engine";
import "@xzdarcy/react-timeline-editor/dist/react-timeline-editor.css";
import { Play, Pause, Square, ZoomIn, ZoomOut, Music } from "lucide-react";
import type { ClipMetaMap, TextOverlayMap, SelectedItem } from "./types";

const MIN_CLIP_DURATION = 0.5;
const DEFAULT_SCALE_WIDTH = 160;
const SCALE_STEP = 40;
const MIN_SCALE_WIDTH = 60;
const MAX_SCALE_WIDTH = 400;

interface EditorTimelineProps {
  editorData: TimelineRow[];
  effects: Record<string, TimelineEffect>;
  clipMeta: ClipMetaMap;
  textOverlays: TextOverlayMap;
  audioFile: File | null;
  onChange: (data: TimelineRow[]) => void;
  selectedItem: SelectedItem;
  onSelectItem: (item: SelectedItem) => void;
  onTimeUpdate?: (time: number) => void;
  onClipResize?: (actionId: string, trimStart: number, trimEnd: number) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getTrackType(rowId: string): "clip" | "text" | "audio" | null {
  if (rowId === "video-track") return "clip";
  if (rowId === "text-track") return "text";
  if (rowId === "audio-track") return "audio";
  return null;
}

const ROW_LABELS: Record<string, string> = {
  "video-track": "Video",
  "text-track": "Text",
  "audio-track": "Audio",
};

export default function EditorTimeline({
  editorData,
  effects,
  clipMeta,
  textOverlays,
  audioFile,
  onChange,
  selectedItem,
  onSelectItem,
  onTimeUpdate,
  onClipResize,
}: EditorTimelineProps) {
  const timelineRef = useRef<TimelineState>(null);
  const [scaleWidth, setScaleWidth] = useState(DEFAULT_SCALE_WIDTH);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const ref = timelineRef.current;
    if (!ref) return;
    const listener = ref.listener;

    let lastDisplayUpdate = 0;
    const onTickTime = ({ time }: { time: number }) => {
      onTimeUpdate?.(time);
      const now = performance.now();
      if (now - lastDisplayUpdate > 250) {
        lastDisplayUpdate = now;
        setCurrentTime(time);
      }
    };

    const onManualTime = ({ time }: { time: number }) => {
      setCurrentTime(time);
      onTimeUpdate?.(time);
    };

    const onPlay = () => setIsPlaying(true);
    const onPaused = () => {
      setIsPlaying(false);
      setCurrentTime(ref.getTime());
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(ref.getTime());
    };

    listener.on("afterSetTime", onManualTime);
    listener.on("setTimeByTick", onTickTime);
    listener.on("play", onPlay);
    listener.on("paused", onPaused);
    listener.on("ended", onEnded);

    return () => {
      listener.off("afterSetTime", onManualTime);
      listener.off("setTimeByTick", onTickTime);
      listener.off("play", onPlay);
      listener.off("paused", onPaused);
      listener.off("ended", onEnded);
    };
  }, [onTimeUpdate]);

  const totalDuration = useMemo(
    () =>
      editorData.reduce((max, row) => {
        const rowMax = row.actions.reduce((m, a) => Math.max(m, a.end), 0);
        return Math.max(max, rowMax);
      }, 0),
    [editorData],
  );

  const handlePlay = useCallback(() => {
    const ref = timelineRef.current;
    if (!ref) return;
    if (ref.isPlaying) {
      ref.pause();
    } else {
      ref.play({ autoEnd: true });
    }
  }, []);

  const handleStop = useCallback(() => {
    const ref = timelineRef.current;
    if (!ref) return;
    if (ref.isPlaying) ref.pause();
    ref.setTime(0);
    setCurrentTime(0);
  }, []);

  const handleZoomIn = useCallback(() => {
    setScaleWidth((w) => Math.min(w + SCALE_STEP, MAX_SCALE_WIDTH));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScaleWidth((w) => Math.max(w - SCALE_STEP, MIN_SCALE_WIDTH));
  }, []);

  const handleActionMoving = useCallback(
    ({
      action,
      row,
      start,
      end,
    }: {
      action: TimelineAction;
      row: TimelineRow;
      start: number;
      end: number;
    }) => {
      if (start < 0) return false;
      for (const other of row.actions) {
        if (other.id === action.id) continue;
        if (start < other.end && end > other.start) return false;
      }
      return undefined;
    },
    [],
  );

  const handleActionResizing = useCallback(
    ({
      action,
      row,
      start,
      end,
      dir,
    }: {
      action: TimelineAction;
      row: TimelineRow;
      start: number;
      end: number;
      dir: "right" | "left";
    }) => {
      if (end - start < MIN_CLIP_DURATION) return false;
      if (start < 0) return false;
      for (const other of row.actions) {
        if (other.id === action.id) continue;
        if (start < other.end && end > other.start) return false;
      }
      if (row.id === "video-track" && onClipResize) {
        const meta = clipMeta[action.id];
        if (meta) {
          const curTrimStart = meta.trimStart ?? 0;
          const curTrimEnd = meta.trimEnd ?? 0;
          const newTrimStart = dir === "left" ? curTrimStart + (start - action.start) : curTrimStart;
          const newTrimEnd = dir === "right" ? curTrimEnd + (action.end - end) : curTrimEnd;
          onClipResize(action.id, Math.max(0, newTrimStart), Math.max(0, newTrimEnd));
        }
      }
      return undefined;
    },
    [clipMeta, onClipResize],
  );

  const handleClickAction = useCallback(
    (
      _e: React.MouseEvent,
      { action, row }: { action: TimelineAction; row: TimelineRow; time: number },
    ) => {
      const trackType = getTrackType(row.id);
      if (trackType) {
        onSelectItem({ type: trackType, actionId: action.id });
      }
    },
    [onSelectItem],
  );

  const getActionRender = useCallback(
    (action: TimelineAction, row: TimelineRow) => {
      const trackType = getTrackType(row.id);
      const isSelected =
        selectedItem?.actionId === action.id && selectedItem?.type === trackType;

      if (trackType === "clip") {
        const meta = clipMeta[action.id];
        if (!meta) return null;
        const duration = action.end - action.start;
        return (
          <div
            className="h-full flex items-center gap-1 px-1 overflow-hidden select-none"
            style={{
              background: isSelected
                ? "rgba(147, 51, 234, 0.5)"
                : "rgba(107, 33, 168, 0.35)",
              borderRadius: 4,
              border: isSelected ? "1px solid #a855f7" : "1px solid transparent",
            }}
          >
            {meta.imageUrl && (
              <img
                src={meta.imageUrl}
                alt=""
                className="h-6 w-10 object-cover rounded flex-shrink-0"
                draggable={false}
              />
            )}
            <span className="text-[10px] text-white truncate">{meta.label}</span>
            <span className="text-[9px] text-gray-300 ml-auto flex-shrink-0">
              {duration.toFixed(1)}s
            </span>
          </div>
        );
      }

      if (trackType === "text") {
        const overlay = textOverlays[action.id];
        return (
          <div
            className="h-full flex items-center gap-1 px-2 overflow-hidden select-none"
            style={{
              background: isSelected
                ? "rgba(20, 184, 166, 0.5)"
                : "rgba(13, 148, 136, 0.3)",
              borderRadius: 4,
              border: isSelected ? "1px solid #14b8a6" : "1px solid transparent",
            }}
          >
            <span className="text-[10px] text-white truncate">
              {overlay?.text || "Text"}
            </span>
          </div>
        );
      }

      if (trackType === "audio") {
        return (
          <div
            className="h-full flex items-center gap-1 px-2 overflow-hidden select-none"
            style={{
              background: isSelected
                ? "rgba(34, 197, 94, 0.5)"
                : "rgba(22, 163, 74, 0.3)",
              borderRadius: 4,
              border: isSelected ? "1px solid #22c55e" : "1px solid transparent",
            }}
          >
            <Music size={10} className="text-green-300 flex-shrink-0" />
            <span className="text-[10px] text-white truncate">
              {audioFile?.name || "Audio"}
            </span>
          </div>
        );
      }

      return null;
    },
    [clipMeta, textOverlays, audioFile, selectedItem],
  );

  const getScaleRender = useCallback((scale: number) => {
    return <span className="text-[10px] text-gray-500">{formatTime(scale)}</span>;
  }, []);

  const dataWithSelection = useMemo(
    () =>
      editorData.map((row) => ({
        ...row,
        actions: row.actions.map((a) => {
          const trackType = getTrackType(row.id);
          return {
            ...a,
            selected:
              selectedItem?.actionId === a.id && selectedItem?.type === trackType,
          };
        }),
      })),
    [editorData, selectedItem],
  );

  const minScaleCount = useMemo(
    () => Math.max(20, Math.ceil(totalDuration) + 5),
    [totalDuration],
  );

  const editorHeight = editorData.length * 40 + 42;

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Transport controls */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800">
        <button
          onClick={handlePlay}
          className="p-1.5 rounded hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button
          onClick={handleStop}
          className="p-1.5 rounded hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
          title="Stop"
        >
          <Square size={16} />
        </button>

        <div className="w-px h-5 bg-gray-700 mx-1" />

        <button
          onClick={handleZoomOut}
          className="p-1.5 rounded hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
          title="Zoom out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-1.5 rounded hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
          title="Zoom in"
        >
          <ZoomIn size={16} />
        </button>

        <div className="ml-auto text-xs text-gray-500 font-mono">
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </div>
      </div>

      {/* Row labels + Timeline */}
      <div className="flex">
        <div className="flex-shrink-0 w-16 border-r border-gray-800">
          {/* Spacer for ruler area */}
          <div className="h-[42px]" />
          {editorData.map((row) => (
            <div
              key={row.id}
              className="h-[40px] flex items-center justify-center text-[10px] text-gray-500 font-medium"
            >
              {ROW_LABELS[row.id] || row.id}
            </div>
          ))}
        </div>
        <div className="flex-1 timeline-dark overflow-hidden">
          <TimelineEditor
            ref={timelineRef}
            editorData={dataWithSelection}
            effects={effects}
            onChange={onChange}
            scaleWidth={scaleWidth}
            scale={1}
            scaleSplitCount={10}
            rowHeight={40}
            startLeft={20}
            minScaleCount={minScaleCount}
            gridSnap
            dragLine
            autoScroll
            autoReRender
            getActionRender={getActionRender}
            getScaleRender={getScaleRender}
            onActionMoving={handleActionMoving}
            onActionResizing={handleActionResizing}
            onClickAction={handleClickAction}
            style={{ height: editorHeight, background: "#111827" }}
          />
        </div>
      </div>
    </div>
  );
}
