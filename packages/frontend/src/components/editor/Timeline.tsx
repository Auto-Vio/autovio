import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Timeline as TimelineEditor,
  type TimelineState,
} from "@xzdarcy/react-timeline-editor";
import type { TimelineRow, TimelineAction, TimelineEffect } from "@xzdarcy/timeline-engine";
import "@xzdarcy/react-timeline-editor/dist/react-timeline-editor.css";
import {
  Play,
  Pause,
  Square,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { ClipMetaMap } from "./types";

const MIN_CLIP_DURATION = 0.5;
const DEFAULT_SCALE_WIDTH = 160;
const SCALE_STEP = 40;
const MIN_SCALE_WIDTH = 60;
const MAX_SCALE_WIDTH = 400;

interface TimelineProps {
  editorData: TimelineRow[];
  effects: Record<string, TimelineEffect>;
  clipMeta: ClipMetaMap;
  onChange: (data: TimelineRow[]) => void;
  selectedActionId: string | null;
  onSelectAction: (actionId: string | null) => void;
  onTimeUpdate?: (time: number) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function Timeline({
  editorData,
  effects,
  clipMeta,
  onChange,
  selectedActionId,
  onSelectAction,
  onTimeUpdate,
}: TimelineProps) {
  const timelineRef = useRef<TimelineState>(null);
  const [scaleWidth, setScaleWidth] = useState(DEFAULT_SCALE_WIDTH);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Listen to engine events for play state & time updates
  useEffect(() => {
    const ref = timelineRef.current;
    if (!ref) return;
    const listener = ref.listener;

    // Throttle tick updates to ~4fps for the time display
    let lastDisplayUpdate = 0;
    const onTickTime = ({ time }: { time: number }) => {
      onTimeUpdate?.(time);
      const now = performance.now();
      if (now - lastDisplayUpdate > 250) {
        lastDisplayUpdate = now;
        setCurrentTime(time);
      }
    };

    // Manual seeks update immediately
    const onManualTime = ({ time }: { time: number }) => {
      setCurrentTime(time);
      onTimeUpdate?.(time);
    };

    const onPlay = () => setIsPlaying(true);
    const onPaused = () => {
      setIsPlaying(false);
      // Sync final time on pause
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

  // Compute total duration
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

  // Prevent overlap within same row
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

  // Min duration enforcement on resize
  const handleActionResizing = useCallback(
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
      dir: "right" | "left";
    }) => {
      if (end - start < MIN_CLIP_DURATION) return false;
      if (start < 0) return false;
      for (const other of row.actions) {
        if (other.id === action.id) continue;
        if (start < other.end && end > other.start) return false;
      }
      return undefined;
    },
    [],
  );

  const handleClickAction = useCallback(
    (
      _e: React.MouseEvent,
      { action }: { action: TimelineAction; row: TimelineRow; time: number },
    ) => {
      onSelectAction(action.id);
    },
    [onSelectAction],
  );

  const getActionRender = useCallback(
    (action: TimelineAction, _row: TimelineRow) => {
      const meta = clipMeta[action.id];
      if (!meta) return null;
      const duration = action.end - action.start;
      return (
        <div
          className="h-full flex items-center gap-1 px-1 overflow-hidden select-none"
          style={{
            background: action.selected
              ? "rgba(147, 51, 234, 0.5)"
              : "rgba(107, 33, 168, 0.35)",
            borderRadius: 4,
            border: action.selected ? "1px solid #a855f7" : "1px solid transparent",
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
    },
    [clipMeta],
  );

  const getScaleRender = useCallback((scale: number) => {
    return <span className="text-[10px] text-gray-500">{formatTime(scale)}</span>;
  }, []);

  // Memoize data with selection marks so the reference stays stable
  // unless editorData or selectedActionId actually change
  const dataWithSelection = useMemo(
    () =>
      editorData.map((row) => ({
        ...row,
        actions: row.actions.map((a) => ({
          ...a,
          selected: a.id === selectedActionId,
        })),
      })),
    [editorData, selectedActionId],
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

      {/* Timeline editor */}
      <div className="timeline-dark">
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
  );
}
