import { X, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useStore } from "../../store/useStore";
import type { ProviderConfig, ProviderInfo, ProviderCategory } from "@autovio/shared";
import { DEFAULT_ANALYZER_PROMPT } from "@autovio/shared";
import { fetchProviders } from "../../api/client";

export default function ProviderSettings() {
  const {
    showSettings,
    setShowSettings,
    providerConfig,
    setProviderConfig,
    currentWorkId,
    workSystemPrompt,
    workAnalyzerPrompt,
    workImageSystemPrompt,
    workVideoSystemPrompt,
    setWorkSystemPrompt,
    setWorkAnalyzerPrompt,
    setWorkImageSystemPrompt,
    setWorkVideoSystemPrompt,
  } = useStore();
  const [showWorkPrompts, setShowWorkPrompts] = useState(true);
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  useEffect(() => {
    if (showSettings) {
      fetchProviders()
        .then((fetched) => {
          setProviders(fetched);
          // Validate current config — fix any invalid model IDs
          const config = { ...providerConfig };
          let changed = false;
          for (const cat of ["vision", "llm", "image", "video"] as const) {
            const sel = config[cat];
            const provider = fetched.find((p) => p.category === cat && p.id === sel.providerId);
            if (provider && !provider.models.some((m) => m.id === sel.modelId)) {
              config[cat] = { ...sel, modelId: provider.models[0]?.id || sel.modelId };
              changed = true;
            }
          }
          if (changed) setProviderConfig(config);
        })
        .catch(console.error);
      try {
        setApiKeys(JSON.parse(localStorage.getItem("autovio_api_keys") || "{}"));
      } catch {
        setApiKeys({});
      }
    }
  }, [showSettings]);

  const saveKeys = (keys: Record<string, string>) => {
    setApiKeys(keys);
    localStorage.setItem("autovio_api_keys", JSON.stringify(keys));
  };

  if (!showSettings) return null;

  const categories: { key: keyof ProviderConfig; label: string; icon: string }[] = [
    { key: "vision", label: "Video Analysis", icon: "🔍" },
    { key: "llm", label: "Scenario Builder (LLM)", icon: "🧠" },
    { key: "image", label: "Image Generation", icon: "🖼️" },
    { key: "video", label: "Video Generation", icon: "🎬" },
  ];

  const getProvidersForCategory = (cat: ProviderCategory) =>
    providers.filter((p) => p.category === cat);

  const getModelsForSelection = (cat: ProviderCategory) => {
    const selection = providerConfig[cat];
    const provider = providers.find((p) => p.category === cat && p.id === selection.providerId);
    return provider?.models || [];
  };

  const updateProvider = (cat: keyof ProviderConfig, providerId: string) => {
    const provider = providers.find((p) => p.category === cat && p.id === providerId);
    const firstModel = provider?.models[0]?.id || "";
    setProviderConfig({
      ...providerConfig,
      [cat]: { providerId, modelId: firstModel },
    });
  };

  const updateModel = (cat: keyof ProviderConfig, modelId: string) => {
    setProviderConfig({
      ...providerConfig,
      [cat]: { ...providerConfig[cat], modelId },
    });
  };

  // Unique provider IDs that need API keys
  const uniqueProviderIds = [...new Set(
    Object.values(providerConfig).map((s) => s.providerId),
  )];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div
        className={`bg-gray-900 rounded-xl w-full max-h-[90vh] overflow-y-auto ${
          currentWorkId ? "max-w-2xl" : "max-w-lg"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-lg font-bold">Settings</h2>
          <button
            onClick={() => setShowSettings(false)}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Provider + Model Selection */}
          <div className="space-y-5">
            <h3 className="text-sm font-medium text-gray-300">Providers & Models</h3>
            {categories.map(({ key, label, icon }) => {
              const categoryProviders = getProvidersForCategory(key);
              const models = getModelsForSelection(key);
              const selection = providerConfig[key];

              return (
                <div key={key} className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium text-gray-300">
                    {icon} {label}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Provider</label>
                      <select
                        value={selection.providerId}
                        onChange={(e) => updateProvider(key, e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:border-purple-500 focus:outline-none"
                      >
                        {categoryProviders.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Model</label>
                      <select
                        value={selection.modelId}
                        onChange={(e) => updateModel(key, e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:border-purple-500 focus:outline-none"
                      >
                        {models.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {models.find((m) => m.id === selection.modelId)?.description && (
                    <p className="text-xs text-gray-500">
                      {models.find((m) => m.id === selection.modelId)?.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Work-level system prompts — only when a work is open */}
          {currentWorkId && (
            <div className="space-y-3 border-t border-gray-800 pt-5">
              <button
                type="button"
                onClick={() => setShowWorkPrompts(!showWorkPrompts)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-sm font-medium text-gray-300">Work-level system prompts</h3>
                {showWorkPrompts ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              <p className="text-xs text-gray-500">
                Specific to this work. Leave empty to use project defaults.
              </p>
              {showWorkPrompts && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Scenario (LLM)</label>
                    <textarea
                      value={workSystemPrompt}
                      onChange={(e) => setWorkSystemPrompt(e.target.value)}
                      rows={4}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 font-mono focus:border-purple-500 focus:outline-none"
                      placeholder="Scene list generation..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Video analysis</label>
                    <textarea
                      value={workAnalyzerPrompt || DEFAULT_ANALYZER_PROMPT}
                      onChange={(e) => setWorkAnalyzerPrompt(e.target.value)}
                      rows={8}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 font-mono focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Image generation (extra instruction)</label>
                    <textarea
                      value={workImageSystemPrompt}
                      onChange={(e) => setWorkImageSystemPrompt(e.target.value)}
                      rows={2}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:border-purple-500 focus:outline-none"
                      placeholder="e.g. 16:9, cinematic..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Video generation (extra instruction)</label>
                    <textarea
                      value={workVideoSystemPrompt}
                      onChange={(e) => setWorkVideoSystemPrompt(e.target.value)}
                      rows={2}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:border-purple-500 focus:outline-none"
                      placeholder="e.g. smooth transitions..."
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* API Keys */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300">API Keys</h3>
            <p className="text-xs text-gray-500">
              Keys are stored in your browser only. Never sent to our server for storage.
            </p>
            {uniqueProviderIds.map((id) => {
              const provider = providers.find((p) => p.id === id);
              return (
                <div key={id}>
                  <label className="block text-xs text-gray-500 mb-1">
                    {provider?.name || id} API Key
                  </label>
                  <input
                    type="password"
                    value={apiKeys[id] || ""}
                    onChange={(e) => saveKeys({ ...apiKeys, [id]: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:border-purple-500 focus:outline-none"
                    placeholder="Enter API key..."
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
