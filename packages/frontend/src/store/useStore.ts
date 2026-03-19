import { create } from "zustand";
import type { AnalysisResult, ScenarioScene, ProviderConfig, StyleGuide, ProjectType, AssetUsageMode } from "@autovio/shared";
import { getProviderConfig, getProviderHeaders, generateImage as apiGenerateImage, generateVideo as apiGenerateVideo } from "../api/client";
import type { WorkSnapshot, EditorStateSnapshot, EditorTemplateMeta } from "@autovio/shared";
import * as projectStorage from "../storage/projectStorage";
import { getAuthToken } from "./useAuthStore";

/**
 * Normalize editor state and generated scenes to 0-based indexing.
 * Fixes legacy works where LLM returned 1-based scene_index.
 * 
 * Strategy: If all indexes are >= 1, shift everything down by 1.
 */
function normalizeEditorStateIndexes(state: EditorStateSnapshot, generatedScenes: GeneratedScene[]): EditorStateSnapshot {
  const videoTrack = state.editorData.videoTrack || [];
  if (videoTrack.length === 0 && generatedScenes.length === 0) return state;
  
  // Check if this looks like 1-based indexing
  const allIndexes = [
    ...videoTrack.map(a => a.sceneIndex ?? 0),
    ...generatedScenes.map(s => s.sceneIndex),
  ];
  
  const minIndex = Math.min(...allIndexes);
  const is1Based = minIndex >= 1 && allIndexes.length > 0;
  
  if (!is1Based) return state; // Already 0-based
  
  console.log(`🔄 [LOAD WORK] Converting 1-based indexes to 0-based (minIndex=${minIndex})`);
  
  return {
    ...state,
    editorData: {
      ...state.editorData,
      videoTrack: videoTrack.map(action => ({
        ...action,
        sceneIndex: (action.sceneIndex ?? 1) - 1,
      })),
      textTrack: state.editorData.textTrack,
      imageTrack: state.editorData.imageTrack,
      audioTrack: state.editorData.audioTrack,
    },
    audioVolume: state.audioVolume,
    exportSettings: state.exportSettings,
  };
}

export type PipelineStep = 0 | 1 | 2 | 3 | 4;

export interface GeneratedScene {
  sceneIndex: number;
  imageUrl?: string;
  videoUrl?: string;
  /** Remote image URL for video generation (not persisted; used when approving image) */
  remoteImageUrl?: string;
  status: "pending" | "generating_image" | "image_ready" | "generating_video" | "done" | "error";
  error?: string;
}

interface AppState {
  // Project + Work
  currentProjectId: string | null;
  currentWorkId: string | null;
  currentWorkName: string | null;
  projectKnowledge: string;
  projectStyleGuide: StyleGuide | undefined;
  workSystemPrompt: string;
  projectAnalyzerPrompt: string;
  projectImageSystemPrompt: string;
  projectVideoSystemPrompt: string;
  workAnalyzerPrompt: string;
  workImageSystemPrompt: string;
  workVideoSystemPrompt: string;
  loadingProject: boolean;
  setCurrentProjectId: (id: string | null) => void;
  setCurrentWorkId: (id: string | null) => void;
  goToProjectsList: () => void;
  goToProjectWorks: (projectId: string) => void;
  loadWork: (projectId: string, workId: string) => Promise<void>;
  createNewProject: (name?: string, projectType?: ProjectType) => Promise<void>;
  createNewWork: (projectId: string, name?: string) => Promise<void>;
  persistCurrentWork: () => Promise<void>;
  editorState: EditorStateSnapshot | undefined;
  setEditorState: (state: EditorStateSnapshot | undefined) => void;
  saveEditorState: () => Promise<void>;
  setProjectKnowledge: (knowledge: string) => void;
  setWorkSystemPrompt: (prompt: string) => void;
  setWorkAnalyzerPrompt: (prompt: string) => void;
  setWorkImageSystemPrompt: (prompt: string) => void;
  setWorkVideoSystemPrompt: (prompt: string) => void;

  // Pipeline
  currentStep: PipelineStep;
  setStep: (step: PipelineStep) => void;

  // Step 0 — Init
  videoFile: File | null;
  hasReferenceVideo: boolean;
  mode: "style_transfer" | "content_remix";
  productName: string;
  productDescription: string;
  targetAudience: string;
  language: string;
  videoDuration: number | undefined;
  sceneCount: number | undefined;
  selectedAssetIds: string[];
  assetUsageMode: AssetUsageMode | undefined;
  resolution: { width: number; height: number };
  setVideoFile: (file: File | null) => void;
  setHasReferenceVideo: (has: boolean) => void;
  setMode: (mode: "style_transfer" | "content_remix") => void;
  setProductName: (name: string) => void;
  setProductDescription: (desc: string) => void;
  setTargetAudience: (audience: string) => void;
  setLanguage: (lang: string) => void;
  setVideoDuration: (dur: number | undefined) => void;
  setSceneCount: (n: number | undefined) => void;
  setSelectedAssetIds: (ids: string[]) => void;
  setAssetUsageMode: (mode: AssetUsageMode | undefined) => void;
  setResolution: (resolution: { width: number; height: number }) => void;

  // Step 1 — Analysis
  analysis: AnalysisResult | null;
  analysisLoading: boolean;
  analysisError: string | null;
  setAnalysis: (result: AnalysisResult | null) => void;
  setAnalysisLoading: (loading: boolean) => void;
  setAnalysisError: (error: string | null) => void;

  // Step 2 — Scenario
  scenes: ScenarioScene[];
  scenarioLoading: boolean;
  scenarioError: string | null;
  setScenes: (scenes: ScenarioScene[]) => Promise<void>;
  updateScene: (index: number, scene: Partial<ScenarioScene>) => void;
  removeScene: (index: number) => void;
  setScenarioLoading: (loading: boolean) => void;
  setScenarioError: (error: string | null) => void;

  // Step 3 — Generation
  generatedScenes: GeneratedScene[];
  setGeneratedScenes: (scenes: GeneratedScene[]) => void;
  updateGeneratedScene: (index: number, update: Partial<GeneratedScene>) => void;
  generateSceneImage: (sceneIndex: number) => Promise<void>;
  approveImageAndGenerateVideo: (sceneIndex: number) => Promise<void>;
  updateAndRegenerateImage: (
    sceneIndex: number,
    imagePrompt: string,
    negativePrompt: string,
  ) => Promise<void>;
  updateAndRegenerateVideo: (
    sceneIndex: number,
    videoPrompt: string,
    duration: number,
  ) => Promise<void>;
  backToImageStage: (sceneIndex: number) => void;
  generateAllImages: () => Promise<void>;
  updateScenePrompts: (
    sceneIndex: number,
    updates: {
      image_prompt?: string;
      negative_prompt?: string;
      video_prompt?: string;
      duration_seconds?: number;
    },
  ) => void;

  // Settings
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  providerConfig: ProviderConfig;
  setProviderConfig: (config: ProviderConfig) => void;

  // Editor templates (project-level)
  templates: EditorTemplateMeta[];
  templatesLoading: boolean;
  loadTemplates: (projectId: string) => Promise<void>;

  reset: () => void;
}

const initialState = {
  currentProjectId: null as string | null,
  currentWorkId: null as string | null,
  currentWorkName: null as string | null,
  projectKnowledge: "",
  projectStyleGuide: undefined as StyleGuide | undefined,
  workSystemPrompt: "",
  projectAnalyzerPrompt: "",
  projectImageSystemPrompt: "",
  projectVideoSystemPrompt: "",
  workAnalyzerPrompt: "",
  workImageSystemPrompt: "",
  workVideoSystemPrompt: "",
  loadingProject: false,
  currentStep: 0 as PipelineStep,
  videoFile: null as File | null,
  hasReferenceVideo: false,
  mode: "style_transfer" as const,
  productName: "",
  productDescription: "",
  targetAudience: "",
  language: "",
  videoDuration: undefined as number | undefined,
  sceneCount: undefined as number | undefined,
  selectedAssetIds: [] as string[],
  assetUsageMode: undefined as AssetUsageMode | undefined,
  resolution: { width: 1080, height: 1920 } as { width: number; height: number },
  analysis: null as AnalysisResult | null,
  analysisLoading: false,
  analysisError: null as string | null,
  scenes: [] as ScenarioScene[],
  scenarioLoading: false,
  scenarioError: null as string | null,
  generatedScenes: [] as GeneratedScene[],
  editorState: undefined as EditorStateSnapshot | undefined,
  showSettings: false,
  providerConfig: getProviderConfig(),
  templates: [] as EditorTemplateMeta[],
  templatesLoading: false,
};

type PersistableState = Pick<
  AppState,
  | "currentStep"
  | "currentProjectId"
  | "currentWorkId"
  | "workSystemPrompt"
  | "workAnalyzerPrompt"
  | "workImageSystemPrompt"
  | "workVideoSystemPrompt"
  | "hasReferenceVideo"
  | "mode"
  | "productName"
  | "productDescription"
  | "targetAudience"
  | "language"
  | "videoDuration"
  | "sceneCount"
  | "selectedAssetIds"
  | "assetUsageMode"
  | "resolution"
  | "analysis"
  | "scenes"
  | "generatedScenes"
  | "editorState"
>;

function buildWorkSnapshot(
  state: PersistableState,
  projectId: string,
  workId: string,
  name: string,
  createdAt?: number
): WorkSnapshot {
  const now = Date.now();
  return {
    id: workId,
    projectId,
    name,
    createdAt: createdAt ?? now,
    updatedAt: now,
    systemPrompt: state.workSystemPrompt,
    analyzerPrompt: state.workAnalyzerPrompt,
    imageSystemPrompt: state.workImageSystemPrompt,
    videoSystemPrompt: state.workVideoSystemPrompt,
    currentStep: state.currentStep,
    hasReferenceVideo: state.hasReferenceVideo,
    mode: state.mode,
    productName: state.productName,
    productDescription: state.productDescription,
    targetAudience: state.targetAudience,
    language: state.language,
    videoDuration: state.videoDuration,
    sceneCount: state.sceneCount,
    selectedAssetIds: state.selectedAssetIds,
    assetUsageMode: state.assetUsageMode,
    resolution: state.resolution,
    analysis: state.analysis,
    scenes: state.scenes,
    generatedScenes: state.generatedScenes.map(({ sceneIndex, status, error }) => ({
      sceneIndex,
      status,
      error,
    })),
    editorState: state.editorState,
  };
}

export const useStore = create<AppState>((set, get) => ({
  ...initialState,

  setCurrentProjectId: (currentProjectId) => set({ currentProjectId }),
  setCurrentWorkId: (currentWorkId) => set({ currentWorkId }),
  setProjectKnowledge: (projectKnowledge) => set({ projectKnowledge }),
  setWorkSystemPrompt: (workSystemPrompt) => {
    set({ workSystemPrompt });
    setTimeout(() => get().persistCurrentWork(), 0);
  },
  setWorkAnalyzerPrompt: (workAnalyzerPrompt) => {
    set({ workAnalyzerPrompt });
    setTimeout(() => get().persistCurrentWork(), 0);
  },
  setWorkImageSystemPrompt: (workImageSystemPrompt) => {
    set({ workImageSystemPrompt });
    setTimeout(() => get().persistCurrentWork(), 0);
  },
  setWorkVideoSystemPrompt: (workVideoSystemPrompt) => {
    set({ workVideoSystemPrompt });
    setTimeout(() => get().persistCurrentWork(), 0);
  },

  goToProjectsList: () =>
    set({
      ...initialState,
      currentProjectId: null,
      currentWorkId: null,
      loadingProject: false,
      showSettings: get().showSettings,
      providerConfig: get().providerConfig,
      templates: [],
      templatesLoading: false,
    }),

  goToProjectWorks: (projectId) =>
    set({
      ...initialState,
      currentProjectId: projectId,
      currentWorkId: null,
      loadingProject: false,
      showSettings: get().showSettings,
      providerConfig: get().providerConfig,
      templates: [],
      templatesLoading: false,
    }),

  setEditorState: (editorState) => set({ editorState }),
  saveEditorState: async () => {
    const state = get();
    if (!state.currentProjectId || !state.currentWorkId || state.loadingProject) return;
    try {
      const work = await projectStorage.getWork(state.currentProjectId, state.currentWorkId);
      if (!work) return;
      const snap = buildWorkSnapshot(
        state,
        state.currentProjectId,
        state.currentWorkId,
        work.name,
        work.createdAt
      );
      await projectStorage.saveWork(state.currentProjectId, snap);
    } catch (e) {
      console.error("Failed to save editor state", e);
      throw e;
    }
  },

  loadWork: async (projectId, workId) => {
    const work = await projectStorage.getWork(projectId, workId);
    if (!work) return;
    const project = await projectStorage.getProject(projectId);
    set({ loadingProject: true });
    set({
      currentProjectId: projectId,
      currentWorkId: workId,
      currentWorkName: work.name,
      projectKnowledge: project?.knowledge ?? "",
      projectStyleGuide: project?.styleGuide,
      workSystemPrompt: work.systemPrompt,
      projectAnalyzerPrompt: project?.analyzerPrompt ?? "",
      projectImageSystemPrompt: project?.imageSystemPrompt ?? "",
      projectVideoSystemPrompt: project?.videoSystemPrompt ?? "",
      workAnalyzerPrompt: work.analyzerPrompt ?? "",
      workImageSystemPrompt: work.imageSystemPrompt ?? "",
      workVideoSystemPrompt: work.videoSystemPrompt ?? "",
      currentStep: work.currentStep,
      hasReferenceVideo: work.hasReferenceVideo,
      mode: work.mode,
      productName: work.productName,
      productDescription: work.productDescription,
      targetAudience: work.targetAudience,
      language: work.language,
      videoDuration: work.videoDuration,
      sceneCount: work.sceneCount,
      selectedAssetIds: work.selectedAssetIds ?? [],
      assetUsageMode: work.assetUsageMode,
      resolution: work.resolution ?? { width: 1080, height: 1920 },
      analysis: work.analysis,
      scenes: work.scenes.map((s, i) => ({ ...s, scene_index: i })), // Force 0-based
      generatedScenes: work.generatedScenes.map((s, i) => ({ ...s, sceneIndex: i })), // Force 0-based
      editorState: work.editorState ? normalizeEditorStateIndexes(work.editorState, work.generatedScenes) : undefined,
      videoFile: null,
      analysisLoading: false,
      analysisError: null,
      scenarioLoading: false,
      scenarioError: null,
    });
    try {
      if (work.hasReferenceVideo) {
        const refBlob = await projectStorage.loadReferenceVideoBlob(projectId, workId);
        if (refBlob) {
          const file = new File([refBlob], "reference.mp4", { type: refBlob.type });
          set({ videoFile: file });
        }
      }
      const state = get();
      for (let i = 0; i < state.generatedScenes.length; i++) {
        const gs = state.generatedScenes[i];
        const needImage =
          gs.status === "image_ready" || gs.status === "generating_video" || gs.status === "done";
        const needVideo = gs.status === "done";
        if (!needImage && !needVideo) continue;
        const imgUrl =
          needImage ? await projectStorage.loadImageUrl(projectId, workId, i) : null;
        const vidUrl =
          needVideo ? await projectStorage.loadVideoUrl(projectId, workId, i) : null;
        if (imgUrl || vidUrl) {
          set((s) => ({
            generatedScenes: s.generatedScenes.map((sc, j) =>
              j === i
                ? {
                    ...sc,
                    ...(imgUrl != null && { imageUrl: imgUrl }),
                    ...(vidUrl != null && { videoUrl: vidUrl }),
                  }
                : sc
            ),
          }));
        }
      }
    } finally {
      set({ loadingProject: false });
    }
  },

  createNewProject: async (name, projectType) => {
    const project = await projectStorage.createProject(name ?? "New Project", projectType);
    set({
      ...initialState,
      currentProjectId: project.id,
      currentWorkId: null,
      currentWorkName: null,
      loadingProject: false,
      showSettings: get().showSettings,
      providerConfig: get().providerConfig,
    });
  },

  createNewWork: async (projectId, name) => {
    const { resolution } = get();
    const work = await projectStorage.createWork(projectId, name ?? "New Work", { resolution });
    await get().loadWork(projectId, work.id);
  },

  persistCurrentWork: async () => {
    const state = get();
    if (!state.currentProjectId || !state.currentWorkId || state.loadingProject) return;
    try {
      const work = await projectStorage.getWork(state.currentProjectId, state.currentWorkId);
      if (!work) return;
      const snap = buildWorkSnapshot(
        state,
        state.currentProjectId,
        state.currentWorkId,
        work.name,
        work.createdAt
      );
      console.log('[Store] Persisting work with assets:', {
        selectedAssetIds: snap.selectedAssetIds,
        assetUsageMode: snap.assetUsageMode
      });
      await projectStorage.saveWork(state.currentProjectId, snap);
    } catch (e) {
      console.error("Failed to persist work", e);
    }
  },

  setStep: (step) => {
    set({ currentStep: step });
    get().persistCurrentWork();
  },

  setVideoFile: (file) => set({ videoFile: file }),
  setHasReferenceVideo: (hasReferenceVideo) => {
    set({ hasReferenceVideo });
    get().persistCurrentWork();
  },
  setMode: (mode) => {
    set({ mode });
    get().persistCurrentWork();
  },
  setProductName: (productName) => {
    set({ productName });
    get().persistCurrentWork();
  },
  setProductDescription: (productDescription) => {
    set({ productDescription });
    get().persistCurrentWork();
  },
  setTargetAudience: (targetAudience) => {
    set({ targetAudience });
    get().persistCurrentWork();
  },
  setLanguage: (language) => {
    set({ language });
    get().persistCurrentWork();
  },
  setVideoDuration: (videoDuration) => {
    set({ videoDuration });
    get().persistCurrentWork();
  },
  setSceneCount: (sceneCount) => {
    set({ sceneCount });
    get().persistCurrentWork();
  },
  setSelectedAssetIds: (selectedAssetIds) => {
    console.log('[Store] setSelectedAssetIds:', selectedAssetIds);
    set({ selectedAssetIds });
    get().persistCurrentWork();
  },
  setAssetUsageMode: (assetUsageMode) => {
    console.log('[Store] setAssetUsageMode:', assetUsageMode);
    set({ assetUsageMode });
    get().persistCurrentWork();
  },
  setResolution: (resolution) => {
    set({ resolution });
    get().persistCurrentWork();
  },

  setAnalysis: (analysis) => {
    set({ analysis });
    get().persistCurrentWork();
  },
  setAnalysisLoading: (analysisLoading) => set({ analysisLoading }),
  setAnalysisError: (analysisError) => set({ analysisError }),

  setScenes: async (scenes) => {
    const state = get();
    set({ scenes });
    
    // Initialize generatedScenes
    const generatedScenes: GeneratedScene[] = scenes.map((_, i) => ({
      sceneIndex: i,
      status: "pending" as const,
    }));
    
    // DIRECT MODE: Auto-load asset images
    if (state.assetUsageMode === "direct" && state.selectedAssetIds.length > 0 && state.currentProjectId) {
      console.log(`🎯 [STORE] Direct mode: Auto-loading ${scenes.length} asset images`);
      
      const token = getAuthToken();
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      
      for (let i = 0; i < scenes.length; i++) {
        const assetIndex = i % state.selectedAssetIds.length;
        const assetId = state.selectedAssetIds[assetIndex];
        
        try {
          const assetUrl = projectStorage.getProjectAssetUrl(state.currentProjectId, assetId);
          const res = await fetch(assetUrl, { headers });
          
          if (res.ok) {
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            generatedScenes[i] = {
              sceneIndex: i,
              imageUrl: blobUrl,
              remoteImageUrl: assetUrl,
              status: "image_ready",
            };
            console.log(`✅ [STORE] Scene ${i} loaded asset ${assetIndex + 1}/${state.selectedAssetIds.length}`);
          }
        } catch (err) {
          console.error(`❌ [STORE] Failed to load asset for scene ${i}:`, err);
        }
      }
    }
    
    set({ generatedScenes });
    get().persistCurrentWork();
  },
  updateScene: (index, update) =>
    set((state) => {
      const next = {
        scenes: state.scenes.map((s, i) => (i === index ? { ...s, ...update } : s)),
      };
      setTimeout(() => get().persistCurrentWork(), 0);
      return next;
    }),
  removeScene: (index) =>
    set((state) => {
      const next = {
        scenes: state.scenes
          .filter((_, i) => i !== index)
          .map((s, i) => ({ ...s, scene_index: i + 1 })),
      };
      setTimeout(() => get().persistCurrentWork(), 0);
      return next;
    }),
  setScenarioLoading: (scenarioLoading) => set({ scenarioLoading }),
  setScenarioError: (scenarioError) => set({ scenarioError }),

  setGeneratedScenes: (generatedScenes) => {
    set({ generatedScenes });
    get().persistCurrentWork();
  },
  updateGeneratedScene: (index, update) =>
    set((state) => {
      const next = {
        generatedScenes: state.generatedScenes.map((s, i) =>
          i === index ? { ...s, ...update } : s,
        ),
      };
      setTimeout(() => get().persistCurrentWork(), 0);
      return next;
    }),

  updateScenePrompts: (sceneIndex, updates) => {
    get().updateScene(sceneIndex, updates);
  },

  generateSceneImage: async (sceneIndex) => {
    const state = get();
    const scene = state.scenes[sceneIndex];
    if (!scene) return;
    const { currentProjectId, currentWorkId, workImageSystemPrompt, projectImageSystemPrompt, assetUsageMode, selectedAssetIds, resolution } =
      state;
    
    try {
      state.updateGeneratedScene(sceneIndex, {
        status: "generating_image",
        error: undefined,
      });

      // DIRECT MODE: Load asset image directly
      if (assetUsageMode === "direct" && selectedAssetIds.length > 0 && currentProjectId) {
        console.log(`🎯 [FRONTEND] Direct mode - loading asset for scene ${sceneIndex}`);
        
        const assetIndex = sceneIndex % selectedAssetIds.length;
        const assetId = selectedAssetIds[assetIndex];
        
        // Fetch asset with authentication
        const token = getAuthToken();
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        const assetUrl = projectStorage.getProjectAssetUrl(currentProjectId, assetId);
        const res = await fetch(assetUrl, { headers });
        
        if (!res.ok) {
          throw new Error(`Failed to load asset: ${res.status} ${res.statusText}`);
        }
        
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        state.updateGeneratedScene(sceneIndex, {
          imageUrl: blobUrl,
          remoteImageUrl: assetUrl, // Keep original URL for video generation
          status: "image_ready",
        });
        
        console.log(`✅ [FRONTEND] Scene ${sceneIndex} loaded asset ${assetIndex + 1}/${selectedAssetIds.length}`);
        return;
      }

      // NORMAL/REFERENCE MODE: Generate image with AI
      const imageInstruction =
        workImageSystemPrompt.trim() || projectImageSystemPrompt?.trim() || "";
      const remoteImageUrl = await apiGenerateImage(
        scene.image_prompt,
        scene.negative_prompt ?? "",
        {
          ...(imageInstruction ? { imageInstruction } : {}),
          ...(state.projectStyleGuide ? { styleGuide: state.projectStyleGuide } : {}),
          resolution,
        },
      );
      const imageUrlForUi =
        currentProjectId && currentWorkId
          ? await projectStorage.persistImageUrlAndGetObjectUrl(
              currentProjectId,
              currentWorkId,
              sceneIndex,
              remoteImageUrl,
            )
          : remoteImageUrl;
      state.updateGeneratedScene(sceneIndex, {
        imageUrl: imageUrlForUi,
        remoteImageUrl,
        status: "image_ready",
      });
    } catch (err) {
      state.updateGeneratedScene(sceneIndex, {
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },

  approveImageAndGenerateVideo: async (sceneIndex) => {
    const state = get();
    const scene = state.scenes[sceneIndex];
    const gs = state.generatedScenes[sceneIndex];
    if (!scene || !gs || gs.status !== "image_ready") return;
    const { currentProjectId, currentWorkId, workVideoSystemPrompt, projectVideoSystemPrompt, assetUsageMode, resolution } =
      state;

    try {
      state.updateGeneratedScene(sceneIndex, { status: "generating_video" });

      // DIRECT MODE: Use work-based endpoint (backend handles asset → video)
      if (assetUsageMode === "direct" && currentProjectId && currentWorkId) {
        console.log(`🎯 [FRONTEND] Direct mode - generating video from asset for scene ${sceneIndex}`);
        
        const videoHeaders = getProviderHeaders("video");
        const imageHeaders = getProviderHeaders("image");
        const combinedHeaders = {
          ...videoHeaders,
          "x-image-provider": imageHeaders["x-image-provider"],
          "x-image-model-id": imageHeaders["x-model-id"],
        };
        
        const { videoUrl } = await projectStorage.generateWorkScene(
          currentProjectId,
          currentWorkId,
          sceneIndex,
          combinedHeaders
        );
        
        state.updateGeneratedScene(sceneIndex, {
          videoUrl,
          status: "done",
        });
        
        console.log(`✅ [FRONTEND] Direct mode video generated for scene ${sceneIndex}`);
        return;
      }

      // NORMAL/REFERENCE MODE: Generate video from AI image
      const imageUrlForVideo =
        gs.remoteImageUrl ??
        (gs.imageUrl?.startsWith("http")
          ? gs.imageUrl
          : typeof window !== "undefined" && gs.imageUrl
            ? `${window.location.origin}${gs.imageUrl.startsWith("/") ? "" : "/"}${gs.imageUrl}`
            : "");
      if (!imageUrlForVideo) {
        state.updateGeneratedScene(sceneIndex, {
          status: "error",
          error: "Image URL missing; regenerate image to generate video.",
        });
        return;
      }

      const videoInstruction =
        workVideoSystemPrompt.trim() || projectVideoSystemPrompt?.trim() || "";
      const remoteVideoUrl = await apiGenerateVideo(
        imageUrlForVideo,
        scene.video_prompt,
        scene.duration_seconds ?? 5,
        {
          ...(videoInstruction ? { videoInstruction } : {}),
          ...(state.projectStyleGuide ? { styleGuide: state.projectStyleGuide } : {}),
          resolution,
        },
      );
      let videoUrlForUi = remoteVideoUrl;
      if (currentProjectId && currentWorkId) {
        try {
          videoUrlForUi = await projectStorage.persistVideoUrlAndGetObjectUrl(
            currentProjectId,
            currentWorkId,
            sceneIndex,
            remoteVideoUrl,
          );
        } catch {
          // Persist failed (e.g. large payload); still show video via data URL or external URL
        }
      }
      state.updateGeneratedScene(sceneIndex, {
        videoUrl: videoUrlForUi,
        status: "done",
      });
    } catch (err) {
      state.updateGeneratedScene(sceneIndex, {
        status: "image_ready",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },

  updateAndRegenerateImage: async (sceneIndex, imagePrompt, negativePrompt) => {
    get().updateScenePrompts(sceneIndex, {
      image_prompt: imagePrompt,
      negative_prompt: negativePrompt,
    });
    await get().generateSceneImage(sceneIndex);
  },

  updateAndRegenerateVideo: async (sceneIndex, videoPrompt, duration) => {
    get().updateScenePrompts(sceneIndex, {
      video_prompt: videoPrompt,
      duration_seconds: duration,
    });
    const state = get();
    const scene = state.scenes[sceneIndex];
    const gs = state.generatedScenes[sceneIndex];
    if (!scene || !gs) return;
    const { currentProjectId, currentWorkId, workVideoSystemPrompt, projectVideoSystemPrompt, resolution } =
      state;
    const imageUrlForVideo =
      gs.remoteImageUrl ??
      (gs.imageUrl?.startsWith("http")
        ? gs.imageUrl
        : typeof window !== "undefined" && gs.imageUrl
          ? `${window.location.origin}${gs.imageUrl.startsWith("/") ? "" : "/"}${gs.imageUrl}`
          : "");
    if (!imageUrlForVideo) {
      state.updateGeneratedScene(sceneIndex, {
        status: "error",
        error: "Image URL missing; regenerate image to generate video.",
      });
      return;
    }
    try {
      state.updateGeneratedScene(sceneIndex, { status: "generating_video" });
      const videoInstruction =
        workVideoSystemPrompt.trim() || projectVideoSystemPrompt?.trim() || "";
      const remoteVideoUrl = await apiGenerateVideo(
        imageUrlForVideo,
        videoPrompt,
        duration,
        {
          ...(videoInstruction ? { videoInstruction } : {}),
          ...(state.projectStyleGuide ? { styleGuide: state.projectStyleGuide } : {}),
          resolution,
        },
      );
      let videoUrlForUi = remoteVideoUrl;
      if (currentProjectId && currentWorkId) {
        try {
          videoUrlForUi = await projectStorage.persistVideoUrlAndGetObjectUrl(
            currentProjectId,
            currentWorkId,
            sceneIndex,
            remoteVideoUrl,
          );
        } catch {
          // Persist failed; still show video via data URL or external URL
        }
      }
      state.updateGeneratedScene(sceneIndex, {
        videoUrl: videoUrlForUi,
        status: "done",
      });
    } catch (err) {
      state.updateGeneratedScene(sceneIndex, {
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },

  backToImageStage: (sceneIndex) => {
    get().updateGeneratedScene(sceneIndex, {
      status: "image_ready",
      videoUrl: undefined,
    });
  },

  generateAllImages: async () => {
    const state = get();
    for (let i = 0; i < state.scenes.length; i++) {
      const gs = state.generatedScenes[i];
      if (gs?.status === "pending") {
        await get().generateSceneImage(i);
      }
    }
  },

  setShowSettings: (showSettings) => set({ showSettings }),
  setProviderConfig: (providerConfig) => {
    localStorage.setItem("autovio_providers", JSON.stringify(providerConfig));
    set({ providerConfig });
  },

  loadTemplates: async (projectId) => {
    set({ templatesLoading: true });
    try {
      const list = await projectStorage.listTemplates(projectId);
      set({ templates: list.templates });
    } catch {
      set({ templates: [] });
    } finally {
      set({ templatesLoading: false });
    }
  },

  reset: () => set(initialState),
}));
