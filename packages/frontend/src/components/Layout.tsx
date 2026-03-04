import { Settings, FolderOpen, ChevronRight, User, LogOut, Key, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useStore } from "../store/useStore";
import { useAuthStore } from "../store/useAuthStore";
import { getProject } from "../storage/projectStorage";

interface LayoutProps {
  children: React.ReactNode;
  onShowTokens?: () => void;
}

export default function Layout({ children, onShowTokens }: LayoutProps) {
  const { setShowSettings, currentProjectId, currentWorkId, currentWorkName, loadingProject, goToProjectsList } = useStore();
  const { user, logout } = useAuthStore();
  const [projectName, setProjectName] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentProjectId) {
      setProjectName(null);
      return;
    }
    getProject(currentProjectId).then((p) => setProjectName(p?.name ?? null));
  }, [currentProjectId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showBreadcrumb = currentProjectId && currentWorkId && currentWorkName && !loadingProject;

  const handleLogout = () => {
    logout();
    goToProjectsList();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent flex-shrink-0">
            AutoVio
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings size={20} className="text-gray-400" />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="text-sm text-gray-300 hidden sm:block max-w-[100px] truncate">
                {user?.name}
              </span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-xl border border-gray-700 shadow-xl py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-700">
                  <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
                {onShowTokens && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onShowTokens();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors"
                  >
                    <Key size={16} />
                    API Tokens
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-gray-700/50 transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
