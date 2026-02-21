import { Settings, FolderOpen, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { getProject } from "../storage/projectStorage";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { setShowSettings, currentProjectId, currentWorkId, currentWorkName, loadingProject, goToProjectsList } = useStore();
  const [projectName, setProjectName] = useState<string | null>(null);

  useEffect(() => {
    if (!currentProjectId) {
      setProjectName(null);
      return;
    }
    getProject(currentProjectId).then((p) => setProjectName(p?.name ?? null));
  }, [currentProjectId]);

  const showBreadcrumb = currentProjectId && currentWorkId && currentWorkName && !loadingProject;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent flex-shrink-0">
            ViraGen
          </h1>
          <span className="text-xs text-gray-500 border border-gray-700 rounded px-2 py-0.5 flex-shrink-0">
            v0.1.0
          </span>
          {currentProjectId && (
            <div className="flex items-center gap-2 min-w-0">
              {showBreadcrumb ? (
                <nav className="flex items-center gap-1.5 text-sm min-w-0" aria-label="Breadcrumb">
                  <span className="text-gray-500 truncate max-w-[140px] sm:max-w-[180px]" title={projectName ?? undefined}>
                    {projectName ?? "…"}
                  </span>
                  <ChevronRight size={14} className="text-gray-600 flex-shrink-0" aria-hidden />
                  <span className="text-gray-300 font-medium truncate max-w-[120px] sm:max-w-[160px]" title={currentWorkName}>
                    {currentWorkName}
                  </span>
                </nav>
              ) : projectName ? (
                <span className="text-sm text-gray-500 truncate max-w-[180px]" title={projectName}>
                  {projectName}
                </span>
              ) : null}
              <button
                onClick={goToProjectsList}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors flex-shrink-0"
                title="Back to projects"
              >
                <FolderOpen size={18} />
                Projects
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          title="Settings"
        >
          <Settings size={20} className="text-gray-400" />
        </button>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
