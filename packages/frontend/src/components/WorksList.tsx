import { FilePlus, FolderOpen, Trash2, ArrowLeft, Settings2, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useStore } from "../store/useStore";
import { useToastStore } from "../store/useToastStore";
import { listWorks, deleteWork, getProject, saveProject } from "../storage/projectStorage";
import { extractStyleGuide } from "../api/client";
import type { WorkMeta, Project, StyleGuide } from "@autovio/shared";
import { DEFAULT_ANALYZER_PROMPT } from "@autovio/shared";
import ConfirmModal from "./ui/ConfirmModal";
import { SkeletonCardList } from "./ui/SkeletonCard";
import { StyleGuideForm } from "./ui/StyleGuideForm";
import ExtractFromLandingModal from "./ui/ExtractFromLandingModal";
import ProjectAssetsPanel from "./project/ProjectAssetsPanel";

interface WorksListProps {
  projectId: string;
}

export default function WorksList({ projectId }: WorksListProps) {
  const { loadWork, createNewWork, goToProjectsList } = useStore();
  const addToast = useToastStore((s) => s.addToast);
  const [project, setProject] = useState<Project | null>(null);
  const [works, setWorks] = useState<WorkMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newWorkName, setNewWorkName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showProjectSettings, setShowProjectSettings] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSystemPrompt, setEditSystemPrompt] = useState("");
  const [editKnowledge, setEditKnowledge] = useState("");
  const [editAnalyzerPrompt, setEditAnalyzerPrompt] = useState("");
  const [editImageSystemPrompt, setEditImageSystemPrompt] = useState("");
  const [editVideoSystemPrompt, setEditVideoSystemPrompt] = useState("");
  const [editStyleGuide, setEditStyleGuide] = useState<StyleGuide | undefined>(undefined);
  const [isExtractingStyleGuide, setIsExtractingStyleGuide] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [openScenarioAnalysis, setOpenScenarioAnalysis] = useState(false);
  const [openImageVideo, setOpenImageVideo] = useState(false);
  const [openProjectAssets, setOpenProjectAssets] = useState(false);
  const [showExtractFromLanding, setShowExtractFromLanding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = () => listWorks(projectId).then((w) => { setWorks(w); setLoading(false); });

  useEffect(() => {
    getProject(projectId).then((p) => {
      setProject(p ?? null);
      if (p) {
        setEditName(p.name);
        setEditSystemPrompt(p.systemPrompt);
        setEditKnowledge(p.knowledge ?? "");
        setEditStyleGuide(p.styleGuide);
        setEditAnalyzerPrompt(p.analyzerPrompt?.trim() ? p.analyzerPrompt : DEFAULT_ANALYZER_PROMPT);
        setEditImageSystemPrompt(p.imageSystemPrompt ?? "");
        setEditVideoSystemPrompt(p.videoSystemPrompt ?? "");
      }
    });
  }, [projectId]);

  useEffect(() => {
    listWorks(projectId).then((w) => { setWorks(w); setLoading(false); });
  }, [projectId]);

  useEffect(() => {
    if (showNewForm) {
      setNewWorkName("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [showNewForm]);

  const handleCreate = async () => {
    const name = newWorkName.trim() || "New Work";
    setCreating(true);
    try {
      await createNewWork(projectId, name);
      setShowNewForm(false);
      refresh();
      addToast("Work created", "success");
    } catch {
      addToast("Failed to create work", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, workId: string) => {
    e.stopPropagation();
    setDeleteTargetId(workId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await deleteWork(projectId, deleteTargetId);
      setDeleteTargetId(null);
      refresh();
      addToast("Work deleted", "success");
    } catch {
      addToast("Failed to delete work", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleExtractStyleGuide = async () => {
    if (!editKnowledge?.trim()) {
      addToast("Please enter some context first", "error");
      return;
    }
    setIsExtractingStyleGuide(true);
    try {
      const result = await extractStyleGuide(editKnowledge);
      setEditStyleGuide(result.styleGuide);
      addToast("Style guide extracted successfully", "success");
    } catch (err) {
      console.error("Failed to extract style guide:", err);
      addToast("Failed to extract style guide", "error");
    } finally {
      setIsExtractingStyleGuide(false);
    }
  };

  const handleExtractFromLanding = (result: { styleGuide: StyleGuide }) => {
    setEditStyleGuide(result.styleGuide);
    setShowExtractFromLanding(false);
    addToast("Style guide extracted from landing page", "success");
  };

  const handleSaveProject = async () => {
    if (!project) return;
    setSavingProject(true);
    try {
      const updated: Project = {
        ...project,
        name: editName,
        systemPrompt: editSystemPrompt,
        knowledge: editKnowledge,
        styleGuide: editStyleGuide,
        analyzerPrompt: editAnalyzerPrompt.trim() === DEFAULT_ANALYZER_PROMPT ? "" : editAnalyzerPrompt.trim(),
        imageSystemPrompt: editImageSystemPrompt,
        videoSystemPrompt: editVideoSystemPrompt,
        updatedAt: Date.now(),
      };
      await saveProject(updated);
      setProject(updated);
      addToast("Settings saved", "success");
    } catch {
      addToast("Failed to save settings", "error");
    } finally {
      setSavingProject(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={goToProjectsList}
          className="p-2 rounded-lg border border-gray-700 hover:bg-gray-800/50 text-gray-400 hover:text-white transition-colors"
          title="Back to projects"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold text-gray-100 truncate" title={project?.name ?? ""}>
            {project?.name ?? "…"}
          </h2>
          <p className="text-sm text-gray-500">Works</p>
        </div>
        {!showNewForm ? (
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
          >
            <FilePlus size={20} />
            New Work
          </button>
        ) : null}
      </div>

      {/* Project settings: Basic + Scenario & Analysis + Image & Video */}
      <div className="mb-6 rounded-lg border border-gray-700 bg-gray-900/50 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowProjectSettings(!showProjectSettings)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-800/30 transition-colors"
        >
          <span className="flex items-center gap-2 text-gray-300 font-medium">
            <Settings2 size={18} />
            Project settings & agent prompts
          </span>
          {showProjectSettings ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {showProjectSettings && project && (
          <div className="px-4 pb-4 pt-0 space-y-4 border-t border-gray-700/50">
            {/* Basic */}
            <div className="space-y-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider pt-2">Basic</p>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Project name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Project context</label>
                <textarea
                  value={editKnowledge}
                  onChange={(e) => setEditKnowledge(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                  placeholder="Product, audience, language, style — sent with every AI request"
                />
              </div>
              <div className="mt-4">
                <StyleGuideForm
                  value={editStyleGuide}
                  onChange={setEditStyleGuide}
                  onExtract={handleExtractStyleGuide}
                  isExtracting={isExtractingStyleGuide}
                  onExtractFromLanding={() => setShowExtractFromLanding(true)}
                />
              </div>
            </div>

            {/* Scenario & Analysis accordion */}
            <div className="rounded-lg border border-gray-700/70 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenScenarioAnalysis(!openScenarioAnalysis)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-gray-800/40 transition-colors"
              >
                <span className="text-sm font-medium text-gray-400">Scenario & Analysis</span>
                {openScenarioAnalysis ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openScenarioAnalysis && (
                <div className="px-3 pb-3 pt-0 space-y-3 border-t border-gray-700/50">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Scenario agent (LLM)</label>
                    <textarea
                      value={editSystemPrompt}
                      onChange={(e) => setEditSystemPrompt(e.target.value)}
                      rows={5}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm font-mono"
                      placeholder="System instruction: scene count, image_prompt, video_prompt format..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Video analysis agent</label>
                    <textarea
                      value={editAnalyzerPrompt}
                      onChange={(e) => setEditAnalyzerPrompt(e.target.value)}
                      rows={10}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm font-mono"
                      placeholder="Default prompt loaded..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Image & Video accordion */}
            <div className="rounded-lg border border-gray-700/70 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenImageVideo(!openImageVideo)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-gray-800/40 transition-colors"
              >
                <span className="text-sm font-medium text-gray-400">Image & Video generation</span>
                {openImageVideo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openImageVideo && (
                <div className="px-3 pb-3 pt-0 space-y-3 border-t border-gray-700/50">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Image (extra instruction per scene)</label>
                    <textarea
                      value={editImageSystemPrompt}
                      onChange={(e) => setEditImageSystemPrompt(e.target.value)}
                      rows={2}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                      placeholder="e.g. 16:9, cinematic, 8k..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Video (extra instruction per scene)</label>
                    <textarea
                      value={editVideoSystemPrompt}
                      onChange={(e) => setEditVideoSystemPrompt(e.target.value)}
                      rows={2}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                      placeholder="e.g. smooth transitions, cinematic motion..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Project Assets */}
            <div className="rounded-lg border border-gray-700/70 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenProjectAssets(!openProjectAssets)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-gray-800/40 transition-colors"
              >
                <span className="text-sm font-medium text-gray-400">Project assets</span>
                {openProjectAssets ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openProjectAssets && (
                <div className="px-3 pb-3 pt-0 border-t border-gray-700/50">
                  <ProjectAssetsPanel projectId={projectId} />
                </div>
              )}
            </div>

            <button
              onClick={handleSaveProject}
              disabled={savingProject}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
            >
              {savingProject ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>

      {showNewForm && (
        <div className="mb-6 p-4 rounded-lg border border-gray-700 bg-gray-900/50">
          <label className="block text-sm font-medium text-gray-300 mb-2">Work name</label>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newWorkName}
              onChange={(e) => setNewWorkName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="e.g. Product Intro v1"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {creating ? "Creating..." : "Create"}
            </button>
            <button
              onClick={() => setShowNewForm(false)}
              disabled={creating}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <SkeletonCardList count={4} />
      ) : works.length === 0 && !showNewForm ? (
        <div className="border-2 border-dashed border-gray-700 rounded-xl p-12 text-center">
          <FolderOpen size={48} className="mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400 mb-2">No works in this project yet</p>
          <p className="text-gray-500 text-sm mb-6">
            Create a new work to start building your video scenario.
          </p>
          <button
            onClick={() => setShowNewForm(true)}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            <FilePlus size={18} />
            Create First Work
          </button>
        </div>
      ) : (
        <ul className="space-y-2">
          {works.map((w) => (
            <li key={w.id}>
              <button
                type="button"
                onClick={() => loadWork(projectId, w.id)}
                className="w-full flex items-center justify-between gap-3 rounded-lg border border-gray-700 bg-gray-900/50 hover:bg-gray-800/50 hover:border-gray-600 px-4 py-3 text-left transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FilePlus size={20} className="text-purple-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{w.name}</p>
                    <p className="text-xs text-gray-500">
                      Last updated: {new Date(w.updatedAt).toLocaleDateString("en-US")}
                    </p>
                  </div>
                </div>
                <span
                  onClick={(e) => handleDeleteClick(e, w.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-red-400 hover:bg-red-500/20 transition-all flex-shrink-0"
                  title="Delete work"
                >
                  <Trash2 size={18} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmModal
        open={deleteTargetId !== null}
        title="Delete work"
        message="Are you sure you want to delete this work? This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => !deleting && setDeleteTargetId(null)}
      />

      <ExtractFromLandingModal
        open={showExtractFromLanding}
        onClose={() => setShowExtractFromLanding(false)}
        onExtracted={handleExtractFromLanding}
        mode="landing"
      />
    </div>
  );
}
