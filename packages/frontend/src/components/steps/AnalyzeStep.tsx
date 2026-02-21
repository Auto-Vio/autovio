import { useEffect } from "react";
import { Loader2, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import { useStore } from "../../store/useStore";
import { analyzeVideo } from "../../api/client";

export default function AnalyzeStep() {
  const {
    videoFile, mode, analysis,
    projectAnalyzerPrompt, workAnalyzerPrompt,
    analysisLoading, analysisError,
    setAnalysis, setAnalysisLoading, setAnalysisError,
    setStep,
  } = useStore();

  useEffect(() => {
    if (!videoFile || analysis) return;

    let cancelled = false;
    setAnalysisLoading(true);
    setAnalysisError(null);

    analyzeVideo(videoFile, mode, {
      analyzerPrompt: (workAnalyzerPrompt.trim() || projectAnalyzerPrompt) || undefined,
    })
      .then((result) => {
        if (!cancelled) setAnalysis(result);
      })
      .catch((err) => {
        if (!cancelled) setAnalysisError(err.message);
      })
      .finally(() => {
        if (!cancelled) setAnalysisLoading(false);
      });

    return () => { cancelled = true; };
  }, [videoFile, mode]);

  if (analysisLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={48} className="animate-spin text-purple-500 mb-4" />
        <p className="text-gray-300 text-lg">Analyzing your video...</p>
        <p className="text-gray-500 text-sm mt-2">This may take a minute depending on video length</p>
      </div>
    );
  }

  if (analysisError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <AlertCircle size={20} className="text-red-400" />
          <p className="text-red-300">{analysisError}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setStep(0)}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <button
            onClick={() => {
              setAnalysis(null);
              setAnalysisError(null);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Video Analysis Complete</h2>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Scenes</p>
          <p className="text-2xl font-bold">{analysis.scene_count}</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Tone</p>
          <p className="text-lg font-medium capitalize">{analysis.overall_tone}</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Tempo</p>
          <p className="text-lg font-medium capitalize">{analysis.tempo}</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Text Overlay</p>
          <p className="text-lg font-medium">{analysis.has_text_overlay ? "Yes" : "No"}</p>
        </div>
      </div>

      {/* Color Palette */}
      <div>
        <p className="text-sm text-gray-400 mb-2">Color Palette</p>
        <div className="flex gap-2">
          {analysis.color_palette.map((color, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-lg border border-gray-700"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Scenes */}
      <div className="space-y-3">
        <p className="text-sm text-gray-400">Scenes</p>
        {analysis.scenes.map((scene) => (
          <div key={scene.index} className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-400">Scene {scene.index}</span>
              <span className="text-sm text-gray-500">{scene.duration_seconds}s — {scene.transition}</span>
            </div>
            <p className="text-gray-300 text-sm">{scene.description}</p>
            {scene.text_overlay && (
              <p className="text-xs text-gray-500 mt-1">Text: "{scene.text_overlay}"</p>
            )}
            {scene.camera_movement && (
              <p className="text-xs text-gray-500">Camera: {scene.camera_movement}</p>
            )}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={() => setStep(0)}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={() => setStep(2)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Build Scenario
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
