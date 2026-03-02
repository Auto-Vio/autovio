import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { ArrowLeft, Type, Music, Download, Save, Loader2 } from "lucide-react";
import { useStore, type GeneratedScene } from "../../store/useStore";
import * as projectStorage from "../../storage/projectStorage";
import { getAuthToken } from "../../store/useAuthStore";
import { useToastStore } from "../../store/useToastStore";
import { isApiMediaPath } from "../../hooks/useAuthenticatedMediaUrl";
import type {
  TimelineRow,
  TimelineAction,
  ClipMetaMap,
  ClipMeta,
  TextOverlayMap,
  TextOverlay,
  AudioMeta,
  ExportSettings,
  SelectedItem,
} from "../editor/types";
import type { TimelineEffect } from "@xzdarcy/timeline-engine";
import type { ScenarioScene, EditorStateSnapshot } from "@viragen/shared";
import VideoPreview, { createVideoEffect } from "../editor/VideoPreview";
import PropertiesPanel from "../editor/PropertiesPanel";
import EditorTimeline from "../editor/EditorTimeline";
import ExportDialog from "../editor/ExportDialog";

function resolveUrl(url: string | undefined, map: Record<string, string>): string | undefined {
  if (!url) return undefined;
  return map[url] ?? url;
}

function buildDisplayClipMeta(clipMeta: ClipMetaMap, resolvedUrlMap: Record<string, string>): ClipMetaMap {
  const out: ClipMetaMap = {};
  for (const [id, meta] of Object.entries(clipMeta)) {
    out[id] = {
      ...meta,
      imageUrl: resolveUrl(meta.imageUrl, resolvedUrlMap),
      videoUrl: resolveUrl(meta.videoUrl, resolvedUrlMap),
    };
  }
  return out;
}

let textIdCounter = 0;

function scenesToTimelineData(
  generatedScenes: GeneratedScene[],
  scenes: ScenarioScene[],
): { editorData: TimelineRow[]; clipMeta: ClipMetaMap } {
  const clipMeta: ClipMetaMap = {};
  let cursor = 0;

  const videoActions: TimelineAction[] = generatedScenes
    .filter((s) => s.status === "done")
    .map((s) => {
      const duration =
        scenes.find((sc) => sc.scene_index === s.sceneIndex)?.duration_seconds || 5;
      const actionId = `clip-${s.sceneIndex}`;
      const start = cursor;
      const end = cursor + duration;
      cursor = end;

      clipMeta[actionId] = {
        sceneIndex: s.sceneIndex,  // Use actual scene index, not array index
        imageUrl: s.imageUrl,
        videoUrl: s.videoUrl,
        label: `Scene ${s.sceneIndex}`,
        originalDuration: duration,
        trimStart: 0,
        trimEnd: 0,
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

function reconstructFromSavedState(
  saved: EditorStateSnapshot,
  generatedScenes: GeneratedScene[],
): { editorData: TimelineRow[]; clipMeta: ClipMetaMap; textOverlays: TextOverlayMap; exportSettings: ExportSettings } {
  const clipMeta: ClipMetaMap = {};
  const videoTrack = saved.editorData?.videoTrack ?? [];
  const textTrack = saved.editorData?.textTrack ?? [];
  const audioTrack = saved.editorData?.audioTrack ?? [];

  videoTrack.forEach((a) => {
    const scene = generatedScenes.find((s) => s.sceneIndex === (a.sceneIndex ?? 0));
    clipMeta[a.id] = {
      sceneIndex: a.sceneIndex ?? 0,
      imageUrl: scene?.imageUrl,
      videoUrl: scene?.videoUrl,
      label: `Scene ${a.sceneIndex ?? 0}`,
      originalDuration: (a.end - a.start) + (a.trimStart ?? 0) + (a.trimEnd ?? 0),
      trimStart: a.trimStart ?? 0,
      trimEnd: a.trimEnd ?? 0,
    };
  });

  const textOverlays: TextOverlayMap = {};
  if (saved.textOverlays) {
    for (const [id, snap] of Object.entries(saved.textOverlays)) {
      textOverlays[id] = {
        id,
        text: snap.text,
        fontSize: snap.fontSize,
        fontColor: snap.fontColor,
        centerX: snap.centerX,
        centerY: snap.centerY,
      };
    }
  }

  const editorData: TimelineRow[] = [
    {
      id: "video-track",
      actions: videoTrack.map((a) => ({
        id: a.id,
        start: a.start,
        end: a.end,
        effectId: "videoEffect",
        flexible: true,
        movable: true,
      })),
      rowHeight: 40,
    },
    {
      id: "text-track",
      actions: textTrack.map((a) => ({
        id: a.id,
        start: a.start,
        end: a.end,
        effectId: "textEffect",
        flexible: true,
        movable: true,
      })),
      rowHeight: 40,
    },
    {
      id: "audio-track",
      actions: audioTrack.map((a) => ({
        ...a,
        effectId: "audioEffect",
        flexible: true,
        movable: true,
      })),
      rowHeight: 40,
    },
  ];

  return {
    editorData,
    clipMeta,
    textOverlays,
    exportSettings: saved.exportSettings ?? { width: 1080, height: 1920, fps: 30 },
  };
}

export default function EditorStep() {
  const {
    generatedScenes,
    scenes,
    setStep,
    currentProjectId,
    currentWorkId,
    editorState: savedEditorState,
    setEditorState,
    saveEditorState,
  } = useStore();
  const addToast = useToastStore((s) => s.addToast);

  const initialFromScenes = useMemo(
    () => scenesToTimelineData(generatedScenes, scenes),
    [generatedScenes, scenes],
  );

  const initial = useMemo(() => {
    if (savedEditorState?.editorData?.videoTrack?.length && generatedScenes.some((s) => s.status === "done")) {
      return reconstructFromSavedState(savedEditorState, generatedScenes);
    }
    return {
      ...initialFromScenes,
      textOverlays: {} as TextOverlayMap,
      exportSettings: { width: 1080, height: 1920, fps: 30 } as ExportSettings,
    };
  }, [savedEditorState, generatedScenes, initialFromScenes]);

  const [editorData, setEditorData] = useState<TimelineRow[]>(initial.editorData);
  const [clipMeta, setClipMeta] = useState<ClipMetaMap>(initial.clipMeta);
  const [resolvedUrlMap, setResolvedUrlMap] = useState<Record<string, string>>({});
  const [textOverlays, setTextOverlays] = useState<TextOverlayMap>(initial.textOverlays);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(savedEditorState?.audioUrl ?? null);
  const [audioMeta, setAudioMeta] = useState<AudioMeta>({
    volume: savedEditorState?.audioVolume ?? 1,
  });
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(
    initial.editorData[0]?.actions[0]
      ? { type: "clip", actionId: initial.editorData[0].actions[0].id }
      : null,
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportSettings, setExportSettings] = useState<ExportSettings>(initial.exportSettings);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  
  // Track if this is the first mount or a real data change
  const prevWorkIdRef = useRef<string | null>(null);
  const prevScenesLengthRef = useRef<number>(0);

  // Sync timeline and clipMeta when work changes or new scenes arrive
  useEffect(() => {
    const workChanged = prevWorkIdRef.current !== currentWorkId;
    const scenesChanged = prevScenesLengthRef.current !== generatedScenes.filter(s => s.status === "done").length;
    
    // Only update if work changed or new completed scenes arrived
    if (!workChanged && !scenesChanged && prevWorkIdRef.current !== null) {
      return;
    }
    
    prevWorkIdRef.current = currentWorkId;
    prevScenesLengthRef.current = generatedScenes.filter(s => s.status === "done").length;

    setEditorData(initial.editorData);
    setClipMeta(initial.clipMeta);
    setTextOverlays(initial.textOverlays);
    setExportSettings(initial.exportSettings);
    if (savedEditorState) {
      setAudioUrl(savedEditorState.audioUrl ?? null);
      setAudioMeta({ volume: savedEditorState.audioVolume });
    }
    setResolvedUrlMap((prev) => {
      const next: Record<string, string> = {};
      const urlsInInitial = new Set<string>();
      for (const m of Object.values(initial.clipMeta)) {
        if (m.imageUrl) urlsInInitial.add(m.imageUrl);
        if (m.videoUrl) urlsInInitial.add(m.videoUrl);
      }
      const toRevoke: string[] = [];
      for (const url of Object.keys(prev)) {
        if (urlsInInitial.has(url)) next[url] = prev[url];
        else if (prev[url].startsWith("blob:")) toRevoke.push(prev[url]);
      }
      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(() => {
          toRevoke.forEach((url) => URL.revokeObjectURL(url));
        });
      } else {
        toRevoke.forEach((url) => URL.revokeObjectURL(url));
      }
      return next;
    });
    const firstAction = initial.editorData.find((r) => r.id === "video-track")?.actions[0];
    setSelectedItem(firstAction ? { type: "clip", actionId: firstAction.id } : null);
  }, [currentWorkId, generatedScenes, savedEditorState, initial]);

  // Resolve API media URLs (auth) so preview/timeline can display without 401
  useEffect(() => {
    const urlsToResolve = new Set<string>();
    for (const meta of Object.values(clipMeta)) {
      if (meta.imageUrl && isApiMediaPath(meta.imageUrl)) urlsToResolve.add(meta.imageUrl);
      if (meta.videoUrl && isApiMediaPath(meta.videoUrl)) urlsToResolve.add(meta.videoUrl);
    }
    if (urlsToResolve.size === 0) return;

    const token = getAuthToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    let revoked = false;
    const created: string[] = [];

    urlsToResolve.forEach((url) => {
      fetch(url, { headers })
        .then((res) => {
          if (!res.ok || revoked) return null;
          return res.blob();
        })
        .then((blob) => {
          if (!blob || revoked) return;
          const blobUrl = URL.createObjectURL(blob);
          created.push(blobUrl);
          setResolvedUrlMap((prev) => ({ ...prev, [url]: blobUrl }));
        })
        .catch(() => {});
    });

    return () => {
      revoked = true;
      created.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [clipMeta]);

  const displayClipMeta = useMemo(
    () => buildDisplayClipMeta(clipMeta, resolvedUrlMap),
    [clipMeta, resolvedUrlMap],
  );

  const effects = useMemo<Record<string, TimelineEffect>>(
    () => createVideoEffect(videoRef, displayClipMeta),
    [displayClipMeta],
  );

  const selectedClipMeta =
    selectedItem?.type === "clip" ? displayClipMeta[selectedItem.actionId] : undefined;

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
    setIsDirty(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!isDirty || isSaving || !currentProjectId || !currentWorkId) return;
    try {
      setIsSaving(true);
      const snapshot: EditorStateSnapshot = {
        editorData: {
          videoTrack: editorData.find((r) => r.id === "video-track")?.actions.map((a) => {
            const meta = clipMeta[a.id];
            return {
              id: a.id,
              start: a.start,
              end: a.end,
              sceneIndex: meta?.sceneIndex,
              trimStart: meta?.trimStart,
              trimEnd: meta?.trimEnd,
            };
          }) ?? [],
          textTrack: editorData.find((r) => r.id === "text-track")?.actions.map((a) => ({
            id: a.id,
            start: a.start,
            end: a.end,
          })) ?? [],
          audioTrack: editorData.find((r) => r.id === "audio-track")?.actions.map((a) => ({
            id: a.id,
            start: a.start,
            end: a.end,
          })) ?? [],
        },
        textOverlays: Object.fromEntries(
          Object.entries(textOverlays).map(([id, o]) => [
            id,
            { text: o.text, fontSize: o.fontSize, fontColor: o.fontColor, centerX: o.centerX, centerY: o.centerY },
          ])
        ),
        audioUrl: audioUrl ?? undefined,
        audioVolume: audioMeta.volume,
        exportSettings,
      };
      setEditorState(snapshot);
      await saveEditorState();
      setIsDirty(false);
      addToast("Editor state saved successfully", "success");
    } catch (e) {
      addToast("Failed to save editor state", "error");
    } finally {
      setIsSaving(false);
    }
  }, [
    isDirty,
    isSaving,
    currentProjectId,
    currentWorkId,
    editorData,
    clipMeta,
    textOverlays,
    audioUrl,
    audioMeta,
    exportSettings,
    setEditorState,
    saveEditorState,
    addToast,
  ]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSave]);

  const onUpdateClipMeta = useCallback((actionId: string, partial: Partial<{ trimStart: number; trimEnd: number }>) => {
    const meta = clipMeta[actionId];
    const newTrimStart = partial.trimStart ?? meta?.trimStart ?? 0;
    const newTrimEnd = partial.trimEnd ?? meta?.trimEnd ?? 0;
    const orig = meta?.originalDuration ?? 5;
    const newDuration = Math.max(0.5, orig - newTrimStart - newTrimEnd);
    setClipMeta((prev) => ({ ...prev, [actionId]: { ...prev[actionId], ...partial } }));
    setEditorData((d) =>
      d.map((row) =>
        row.id === "video-track"
          ? {
              ...row,
              actions: row.actions.map((a) =>
                a.id === actionId ? { ...a, end: a.start + newDuration } : a
              ),
            }
          : row
      )
    );
    setIsDirty(true);
  }, [clipMeta]);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  // --- Text overlay operations ---
  const addText = useCallback(() => {
    setIsDirty(true);
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
      setIsDirty(true);
    },
    [],
  );

  const onDeleteTextOverlay = useCallback(
    (id: string) => {
      setIsDirty(true);
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
    async (file: File | null) => {
      if (file && currentProjectId && currentWorkId) {
        try {
          const url = await projectStorage.uploadWorkAudio(currentProjectId, currentWorkId, file);
          setAudioUrl(url);
        } catch (e) {
          addToast("Failed to upload audio", "error");
          return;
        }
      } else if (!file) {
        setAudioUrl(null);
      }
      setIsDirty(true);
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
    [currentProjectId, currentWorkId, addToast],
  );

  const onUpdateAudioMeta = useCallback((partial: Partial<AudioMeta>) => {
    setAudioMeta((prev) => ({ ...prev, ...partial }));
    setIsDirty(true);
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
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${
              isDirty
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save size={14} /> Save
                {isDirty && <span className="ml-0.5 text-[10px]">●</span>}
              </>
            )}
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
            clipMeta={displayClipMeta}
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
            clipMeta={displayClipMeta}
            textOverlays={textOverlays}
            audioFile={audioFile}
            audioUrl={audioUrl}
            audioMeta={audioMeta}
            editorData={editorData}
            onUpdateTextOverlay={onUpdateTextOverlay}
            onUpdateAudioMeta={onUpdateAudioMeta}
            onDeleteTextOverlay={onDeleteTextOverlay}
            onRemoveAudio={onRemoveAudio}
            onUpdateClipMeta={onUpdateClipMeta}
          />
        </div>
      </div>

      {/* Timeline */}
      <EditorTimeline
        editorData={editorData}
        effects={effects}
        clipMeta={displayClipMeta}
        textOverlays={textOverlays}
        audioFile={audioFile}
        onChange={handleEditorChange}
        selectedItem={selectedItem}
        onSelectItem={setSelectedItem}
        onTimeUpdate={handleTimeUpdate}
        onClipResize={(actionId, trimStart, trimEnd) => {
          setClipMeta((prev) => ({
            ...prev,
            [actionId]: { ...prev[actionId], trimStart, trimEnd },
          }));
          setIsDirty(true);
        }}
      />

      {/* Export Dialog */}
      {showExportDialog && (
        <ExportDialog
          editorData={editorData}
          clipMeta={displayClipMeta}
          textOverlays={textOverlays}
          audioFile={audioFile}
          audioUrl={audioUrl}
          audioMeta={audioMeta}
          scenes={scenes}
          projectId={currentProjectId}
          workId={currentWorkId}
          settings={exportSettings}
          onSettingsChange={(s) => {
            setExportSettings(s);
            setIsDirty(true);
          }}
          onClose={() => setShowExportDialog(false)}
        />
      )}
    </div>
  );
}
