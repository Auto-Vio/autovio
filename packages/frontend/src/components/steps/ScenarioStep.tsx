import { useEffect, useRef } from "react";
import { Loader2, ArrowRight, ArrowLeft, AlertCircle, RefreshCw, Trash2 } from "lucide-react";
import { useStore } from "../../store/useStore";
import { buildScenario } from "../../api/client";

export default function ScenarioStep() {
  const {
    currentStep,
    analysis, hasReferenceVideo, mode, productName, productDescription, targetAudience,
    language, videoDuration, sceneCount,
    scenes, scenarioLoading, scenarioError,
    workSystemPrompt, projectKnowledge,
    setScenes, updateScene, removeScene, setScenarioLoading, setScenarioError,
    setStep,
  } = useStore();

  const initialFetchDone = useRef(false);

  const fetchScenario = () => {
    setScenarioLoading(true);
    setScenarioError(null);

    buildScenario(
      analysis,
      {
        mode,
        product_name: productName || undefined,
        product_description: productDescription || undefined,
        target_audience: targetAudience || undefined,
        language: language || undefined,
        video_duration: videoDuration,
        scene_count: sceneCount,
      },
      { systemPrompt: workSystemPrompt || undefined, knowledge: projectKnowledge || undefined }
    )
      .then(setScenes)
      .catch((err) => setScenarioError(err.message))
      .finally(() => setScenarioLoading(false));
  };

  useEffect(() => {
    if (currentStep !== 2) {
      initialFetchDone.current = false;
      return;
    }
    if (scenes.length === 0 && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchScenario();
    }
  }, [currentStep, scenes.length]);

  const goBack = () => {
    if (hasReferenceVideo) {
      setStep(1); // Back to Analyze
    } else {
      setStep(0); // Back to Init (no analyze step)
    }
  };

  if (scenarioLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={48} className="animate-spin text-purple-500 mb-4" />
        <p className="text-gray-300 text-lg">Building your scenario...</p>
        <p className="text-gray-500 text-sm mt-2">
          {hasReferenceVideo
            ? "Generating scenes based on your reference video analysis"
            : "Creating an original scenario from your description"}
        </p>
      </div>
    );
  }

  if (scenarioError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <AlertCircle size={20} className="text-red-400" />
          <p className="text-red-300">{scenarioError}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={goBack} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
          <button onClick={fetchScenario} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Scenario</h2>
        <button
          onClick={fetchScenario}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <RefreshCw size={14} /> Regenerate All
        </button>
      </div>

      {/* Scene Cards */}
      <div className="space-y-4">
        {scenes.map((scene, i) => (
          <div key={`${i}-${scene.scene_index}`} className="bg-gray-900 rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium text-purple-400">
                  Scene {scene.scene_index}
                </span>
                <label className="flex items-center gap-1.5 text-xs text-gray-400">
                  Duration (s):
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={scene.duration_seconds}
                    onChange={(e) => updateScene(i, { duration_seconds: Math.max(1, Math.min(30, Number(e.target.value) || 1)) })}
                    className="w-14 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-200 focus:border-purple-500 focus:outline-none"
                  />
                </label>
                <span className="text-xs text-gray-500">{scene.transition}</span>
              </div>
              <button
                type="button"
                onClick={() => removeScene(i)}
                disabled={scenes.length <= 1}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-1.5 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                title={scenes.length <= 1 ? "Keep at least one scene" : "Remove scene"}
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Image Prompt</label>
              <textarea
                value={scene.image_prompt}
                onChange={(e) => updateScene(i, { image_prompt: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 resize-none focus:border-purple-500 focus:outline-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Video Prompt</label>
              <textarea
                value={scene.video_prompt}
                onChange={(e) => updateScene(i, { video_prompt: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 resize-none focus:border-purple-500 focus:outline-none"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Negative Prompt</label>
                <input
                  value={scene.negative_prompt || ""}
                  onChange={(e) => updateScene(i, { negative_prompt: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Text Overlay</label>
                <input
                  value={scene.text_overlay || ""}
                  onChange={(e) => updateScene(i, { text_overlay: e.target.value || undefined })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={goBack}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={() => {
            const current = useStore.getState().generatedScenes;
            const next = scenes.map((s, i) => {
              const existing = current[i];
              if (existing?.status === "done" && existing.sceneIndex === s.scene_index) {
                return existing;
              }
              return { sceneIndex: s.scene_index, status: "pending" as const };
            });
            useStore.getState().setGeneratedScenes(next);
            setStep(3);
          }}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Generate Videos
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
