import { FolderPlus, FolderOpen, Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useStore } from "../store/useStore";
import { useToastStore } from "../store/useToastStore";
import { listProjects, deleteProject } from "../storage/projectStorage";
import type { ProjectMeta } from "@autovio/shared";
import ConfirmModal from "./ui/ConfirmModal";
import { SkeletonCardList } from "./ui/SkeletonCard";

export default function ProjectsList() {
  const { goToProjectWorks, createNewProject } = useStore();
  const addToast = useToastStore((s) => s.addToast);
  const [projects, setProjects] = useState<ProjectMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = () => listProjects().then((p) => { setProjects(p); setLoading(false); });

  useEffect(() => {
    listProjects().then((p) => { setProjects(p); setLoading(false); });
  }, []);

  useEffect(() => {
    if (showNewForm) {
      setNewProjectName("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [showNewForm]);

  const handleCreate = async () => {
    const name = newProjectName.trim() || "New Project";
    setCreating(true);
    try {
      await createNewProject(name);
      setShowNewForm(false);
      refresh();
      addToast("Project created", "success");
    } catch {
      addToast("Failed to create project", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteTargetId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await deleteProject(deleteTargetId);
      setDeleteTargetId(null);
      refresh();
      addToast("Project deleted", "success");
    } catch {
      addToast("Failed to delete project", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-100">My Projects</h2>
        {!showNewForm ? (
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
          >
            <FolderPlus size={20} />
            New Project
          </button>
        ) : null}
      </div>

      {showNewForm && (
        <div className="mb-6 p-4 rounded-lg border border-gray-700 bg-gray-900/50">
          <label className="block text-sm font-medium text-gray-300 mb-2">Project name</label>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="e.g. Product Launch"
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
      ) : projects.length === 0 && !showNewForm ? (
        <div className="border-2 border-dashed border-gray-700 rounded-xl p-12 text-center">
          <FolderOpen size={48} className="mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400 mb-2">No projects yet</p>
          <p className="text-gray-500 text-sm mb-6">
            Create a new project to start building your video scenario.
          </p>
          <button
            onClick={() => setShowNewForm(true)}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            <FolderPlus size={18} />
            Create First Project
          </button>
        </div>
      ) : (
        <ul className="space-y-2">
          {projects.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => goToProjectWorks(p.id)}
                className="w-full flex items-center justify-between gap-3 rounded-lg border border-gray-700 bg-gray-900/50 hover:bg-gray-800/50 hover:border-gray-600 px-4 py-3 text-left transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FolderOpen size={20} className="text-purple-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">
                      Last updated: {new Date(p.updatedAt).toLocaleDateString("en-US")}
                    </p>
                  </div>
                </div>
                <span
                  onClick={(e) => handleDeleteClick(e, p.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-red-400 hover:bg-red-500/20 transition-all flex-shrink-0"
                  title="Delete project"
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
        title="Delete project"
        message="Are you sure you want to delete this project? All works in this project will be deleted as well."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => !deleting && setDeleteTargetId(null)}
      />
    </div>
  );
}
