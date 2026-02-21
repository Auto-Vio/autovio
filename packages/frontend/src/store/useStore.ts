import { create } from "zustand";
import type { AnalysisResult, ScenarioScene, ProviderConfig } from "@viragen/shared";
import { getProviderConfig } from "../api/client";
import type { WorkSnapshot } from "@viragen/shared";
import * as projectStorage from "../storage/projectStorage";

export type PipelineStep = 0 | 1 | 2 | 3 | 4;

export interface GeneratedScene {
  sceneIndex: number;
  imageUrl?: string;
  videoUrl?: string;
  status: "pending" | "generating_image" | "generating_video" | "done" | "error";
  error?: string;
}

interface AppState {
  // Project + Work
  currentProjectId: string | null;
  currentWorkId: string | null;
  currentWorkName: string | null;
  projectKnowledge: string;
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
  createNewProject: (name?: string) => Promise<void>;
  createNewWork: (projectId: string, name?: string) => Promise<void>;
  persistCurrentWork: () => Promise<void>;
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
  setVideoFile: (file: File | null) => void;
  setHasReferenceVideo: (has: boolean) => void;
  setMode: (mode: "style_transfer" | "content_remix") => void;
  setProductName: (name: string) => void;
  setProductDescription: (desc: string) => void;
  setTargetAudience: (audience: string) => void;
  setLanguage: (lang: string) => void;
  setVideoDuration: (dur: number | undefined) => void;
  setSceneCount: (n: number | undefined) => void;

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
  setScenes: (scenes: ScenarioScene[]) => void;
  updateScene: (index: number, scene: Partial<ScenarioScene>) => void;
  removeScene: (index: number) => void;
  setScenarioLoading: (loading: boolean) => void;
  setScenarioError: (error: string | null) => void;

  // Step 3 — Generation
  generatedScenes: GeneratedScene[];
  setGeneratedScenes: (scenes: GeneratedScene[]) => void;
  updateGeneratedScene: (index: number, update: Partial<GeneratedScene>) => void;

  // Settings
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  providerConfig: ProviderConfig;
  setProviderConfig: (config: ProviderConfig) => void;

  reset: () => void;
}

const initialState = {
  currentProjectId: null as string | null,
  currentWorkId: null as string | null,
  currentWorkName: null as string | null,
  projectKnowledge: "",
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
  hasReferenceVideo: true,
  mode: "style_transfer" as const,
  productName: "",
  productDescription: "",
  targetAudience: "",
  language: "",
  videoDuration: undefined as number | undefined,
  sceneCount: undefined as number | undefined,
  analysis: null as AnalysisResult | null,
  analysisLoading: false,
  analysisError: null as string | null,
  scenes: [] as ScenarioScene[],
  scenarioLoading: false,
  scenarioError: null as string | null,
  generatedScenes: [] as GeneratedScene[],
  showSettings: false,
  providerConfig: getProviderConfig(),
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
  | "analysis"
  | "scenes"
  | "generatedScenes"
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
    analysis: state.analysis,
    scenes: state.scenes,
    generatedScenes: state.generatedScenes.map(({ sceneIndex, status, error }) => ({
      sceneIndex,
      status,
      error,
    })),
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
    }),

  goToProjectWorks: (projectId) =>
    set({
      ...initialState,
      currentProjectId: projectId,
      currentWorkId: null,
      loadingProject: false,
      showSettings: get().showSettings,
      providerConfig: get().providerConfig,
    }),

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
      analysis: work.analysis,
      scenes: work.scenes,
      generatedScenes: work.generatedScenes.map((s) => ({ ...s })),
      videoFile: null,
      analysisLoading: false,
      analysisError: null,
      scenarioLoading: false,
      scenarioError: null,
    });
    try {
      const refBlob = await projectStorage.loadReferenceVideoBlob(projectId, workId);
      if (refBlob) {
        const file = new File([refBlob], "reference.mp4", { type: refBlob.type });
        set({ videoFile: file });
      }
      const state = get();
      for (let i = 0; i < state.generatedScenes.length; i++) {
        const gs = state.generatedScenes[i];
        if (gs.status !== "done") continue;
        const imgUrl = await projectStorage.loadImageUrl(projectId, workId, i);
        const vidUrl = await projectStorage.loadVideoUrl(projectId, workId, i);
        if (imgUrl || vidUrl) {
          set((s) => ({
            generatedScenes: s.generatedScenes.map((sc, j) =>
              j === i ? { ...sc, imageUrl: imgUrl ?? sc.imageUrl, videoUrl: vidUrl ?? sc.videoUrl } : sc
            ),
          }));
        }
      }
    } finally {
      set({ loadingProject: false });
    }
  },

  createNewProject: async (name) => {
    const project = await projectStorage.createProject(name ?? "New Project");
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
    const work = await projectStorage.createWork(projectId, name ?? "New Work");
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

  setAnalysis: (analysis) => {
    set({ analysis });
    get().persistCurrentWork();
  },
  setAnalysisLoading: (analysisLoading) => set({ analysisLoading }),
  setAnalysisError: (analysisError) => set({ analysisError }),

  setScenes: (scenes) => {
    set({ scenes });
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

  setShowSettings: (showSettings) => set({ showSettings }),
  setProviderConfig: (providerConfig) => {
    localStorage.setItem("viragen_providers", JSON.stringify(providerConfig));
    set({ providerConfig });
  },

  reset: () => set(initialState),
}));
