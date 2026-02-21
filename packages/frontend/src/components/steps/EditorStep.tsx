import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { ArrowLeft, Type, Music, Download } from "lucide-react";
import { useStore, type GeneratedScene } from "../../store/useStore";
import type {
  TimelineRow,
  TimelineAction,
  ClipMetaMap,
  TextOverlayMap,
  TextOverlay,
  AudioMeta,
  ExportSettings,
  SelectedItem,
} from "../editor/types";
import type { TimelineEffect } from "@xzdarcy/timeline-engine";
import type { ScenarioScene } from "@viragen/shared";
import VideoPreview, { createVideoEffect } from "../editor/VideoPreview";
import PropertiesPanel from "../editor/PropertiesPanel";
import EditorTimeline from "../editor/EditorTimeline";
import ExportDialog from "../editor/ExportDialog";

let textIdCounter = 0;

function scenesToTimelineData(
  generatedScenes: GeneratedScene[],
  scenes: ScenarioScene[],
): { editorData: TimelineRow[]; clipMeta: ClipMetaMap } {
  const clipMeta: ClipMetaMap = {};
  let cursor = 0;

  const videoActions: TimelineAction[] = generatedScenes
    .map((s, arrayIndex) => ({ ...s, arrayIndex }))
    .filter((s) => s.status === "done")
    .map((s) => {
      const duration =
        scenes.find((sc) => sc.scene_index === s.sceneIndex)?.duration_seconds || 5;
      const actionId = `clip-${s.sceneIndex}`;
      const start = cursor;
      const end = cursor + duration;
      cursor = end;

      clipMeta[actionId] = {
        sceneIndex: s.arrayIndex,
        imageUrl: s.imageUrl,
        videoUrl: s.videoUrl,
        label: `Scene ${s.sceneIndex}`,
      };

      return {
        id: actionId,
        start,
        end,
        effectId: "videoEffect",
        flexible: true,
        movable: true,
      };
    });

  const editorData: TimelineRow[] = [
    { id: "video-track", actions: videoActions, rowHeight: 40 },
    { id: "text-track", actions: [], rowHeight: 40 },
    { id: "audio-track", actions: [], rowHeight: 40 },
  ];

  return { editorData, clipMeta };
}

export default function EditorStep() {
  const { generatedScenes, scenes, setStep, currentProjectId, currentWorkId } = useStore();

  const initial = useMemo(
    () => scenesToTimelineData(generatedScenes, scenes),
    [generatedScenes, scenes],
  );

  const [editorData, setEditorData] = useState<TimelineRow[]>(initial.editorData);
  const [clipMeta] = useState<ClipMetaMap>(initial.clipMeta);
  const [textOverlays, setTextOverlays] = useState<TextOverlayMap>({});
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioMeta, setAudioMeta] = useState<AudioMeta>({ volume: 1 });
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(
    initial.editorData[0]?.actions[0]
      ? { type: "clip", actionId: initial.editorData[0].actions[0].id }
      : null,
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    width: 1080,
    height: 1920,
    fps: 30,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const effects = useMemo<Record<string, TimelineEffect>>(
    () => createVideoEffect(videoRef, clipMeta),
    [clipMeta],
  );

  // Update video src when selected clip changes
  const selectedClipMeta =
    selectedItem?.type === "clip" ? clipMeta[selectedItem.actionId] : undefined;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (selectedClipMeta?.videoUrl) {
      if (video.src !== selectedClipMeta.videoUrl) {
        video.src = selectedClipMeta.videoUrl;
        video.load();
        video.currentTime = 0;
      }
    }
  }, [selectedClipMeta?.videoUrl]);

  const handleEditorChange = useCallback((data: TimelineRow[]) => {
    setEditorData(data);
  }, []);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  // --- Text overlay operations ---
  const addText = useCallback(() => {
    const id = `text-${++textIdCounter}`;
    const totalDuration = editorData
      .find((r) => r.id === "video-track")
      ?.actions.reduce((max, a) => Math.max(max, a.end), 0) || 10;

    const newOverlay: TextOverlay = {
      id,
      text: "Your Text Here",
      fontSize: 32,
      fontColor: "#ffffff",
      centerX: 0,
      centerY: 0,
    };

    setTextOverlays((prev) => ({ ...prev, [id]: newOverlay }));

    // Place text action: start at currentTime, 3s duration, capped at total
    const start = Math.min(currentTime, Math.max(0, totalDuration - 3));
    const end = Math.min(start + 3, totalDuration);

    setEditorData((prev) =>
      prev.map((row) =>
        row.id === "text-track"
          ? {
              ...row,
              actions: [
                ...row.actions,
                {
                  id,
                  start,
                  end,
                  effectId: "textEffect",
                  flexible: true,
                  movable: true,
                },
              ],
            }
          : row,
      ),
    );

    setSelectedItem({ type: "text", actionId: id });
  }, [editorData, currentTime]);

  const onUpdateTextOverlay = useCallback(
    (id: string, partial: Partial<TextOverlay>) => {
      setTextOverlays((prev) => ({
        ...prev,
        [id]: { ...prev[id], ...partial },
      }));
    },
    [],
  );

  const onDeleteTextOverlay = useCallback(
    (id: string) => {
      setTextOverlays((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setEditorData((prev) =>
        prev.map((row) =>
          row.id === "text-track"
            ? { ...row, actions: row.actions.filter((a) => a.id !== id) }
            : row,
        ),
      );
      if (selectedItem?.actionId === id) {
        setSelectedItem(null);
      }
    },
    [selectedItem],
  );

  // --- Audio operations ---
  const handleAudioChange = useCallback(
    (file: File | null) => {
      setAudioFile(file);
      setEditorData((prev) => {
        if (file) {
          const videoTrack = prev.find((r) => r.id === "video-track");
          const totalDuration = videoTrack
            ? videoTrack.actions.reduce((max, a) => Math.max(max, a.end), 0)
            : 30;

          return prev.map((row) =>
            row.id === "audio-track"
              ? {
                  ...row,
                  actions: [
                    {
                      id: "audio-action",
                      start: 0,
                      end: totalDuration,
                      effectId: "audioEffect",
                      flexible: true,
                      movable: true,
                    },
                  ],
                }
              : row,
          );
        } else {
          return prev.map((row) =>
            row.id === "audio-track" ? { ...row, actions: [] } : row,
          );
        }
      });

      if (file) {
        setSelectedItem({ type: "audio", actionId: "audio-action" });
      } else {
        setAudioMeta({ volume: 1 });
        setSelectedItem(null);
      }
    },
    [],
  );

  const onUpdateAudioMeta = useCallback((partial: Partial<AudioMeta>) => {
    setAudioMeta((prev) => ({ ...prev, ...partial }));
  }, []);

  const onRemoveAudio = useCallback(() => {
    handleAudioChange(null);
  }, [handleAudioChange]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(3)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <h2 className="text-xl font-bold">Editor & Export</h2>

        <div className="flex items-center gap-2">
          <button
            onClick={addText}
            className="flex items-center gap-1.5 text-xs bg-teal-600/20 hover:bg-teal-600/40 text-teal-300 border border-teal-600/40 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Type size={14} /> + Text
          </button>
          <button
            onClick={() => audioInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs bg-green-600/20 hover:bg-green-600/40 text-green-300 border border-green-600/40 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Music size={14} /> + Audio
          </button>
          <button
            onClick={() => setShowExportDialog(true)}
            className="flex items-center gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg font-medium transition-colors"
          >
            <Download size={14} /> Export
          </button>
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => handleAudioChange(e.target.files?.[0] || null)}
          />
        </div>
      </div>

      {/* Main area: Preview + Properties Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <VideoPreview
            ref={videoRef}
            clipMeta={clipMeta}
            selectedItem={selectedItem}
            textOverlays={textOverlays}
            editorData={editorData}
            currentTime={currentTime}
            exportSettings={exportSettings}
          />
        </div>

        <div className="lg:col-span-1">
          <PropertiesPanel
            selectedItem={selectedItem}
            clipMeta={clipMeta}
            textOverlays={textOverlays}
            audioFile={audioFile}
            audioMeta={audioMeta}
            editorData={editorData}
            onUpdateTextOverlay={onUpdateTextOverlay}
            onUpdateAudioMeta={onUpdateAudioMeta}
            onDeleteTextOverlay={onDeleteTextOverlay}
            onRemoveAudio={onRemoveAudio}
          />
        </div>
      </div>

      {/* Timeline */}
      <EditorTimeline
        editorData={editorData}
        effects={effects}
        clipMeta={clipMeta}
        textOverlays={textOverlays}
        audioFile={audioFile}
        onChange={handleEditorChange}
        selectedItem={selectedItem}
        onSelectItem={setSelectedItem}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Export Dialog */}
      {showExportDialog && (
        <ExportDialog
          editorData={editorData}
          clipMeta={clipMeta}
          textOverlays={textOverlays}
          audioFile={audioFile}
          audioMeta={audioMeta}
          projectId={currentProjectId}
          workId={currentWorkId}
          settings={exportSettings}
          onSettingsChange={setExportSettings}
          onClose={() => setShowExportDialog(false)}
        />
      )}
    </div>
  );
}
