import { Upload, ArrowRight, AlertTriangle, Settings, Video, PenTool, ChevronDown, ChevronUp, Globe } from "lucide-react";
import { useRef, useState } from "react";
import { useStore } from "../../store/useStore";
import { getProviderConfig } from "../../api/client";
import { saveReferenceVideoBlob } from "../../storage/projectStorage";
import { useToastStore } from "../../store/useToastStore";
import ExtractFromLandingModal from "../ui/ExtractFromLandingModal";

function hasApiKeyConfigured(): boolean {
  try {
    const keys = JSON.parse(localStorage.getItem("autovio_api_keys") || "{}");
    const config = getProviderConfig();
    // LLM key is always needed (scenario builder). Vision key only if reference video.
    return Boolean(keys[config.llm.providerId]);
  } catch {
    return false;
  }
}

export default function InitStep() {
  const {
    videoFile, setVideoFile,
    hasReferenceVideo, setHasReferenceVideo,
    mode, setMode,
    productName, setProductName,
    productDescription, setProductDescription,
    targetAudience, setTargetAudience,
    language, setLanguage,
    videoDuration, setVideoDuration,
    sceneCount, setSceneCount,
    setStep, setShowSettings,
    currentProjectId, currentWorkId,
  } = useStore();

  const fileRef = useRef<HTMLInputElement>(null);
  const [optionalOpen, setOptionalOpen] = useState(false);
  const [showExtractFromFeature, setShowExtractFromFeature] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  const apiKeyReady = hasApiKeyConfigured();

  const canProceed =
    apiKeyReady &&
    (hasReferenceVideo ? Boolean(videoFile) : true) &&
    productName.trim().length > 0;

  const handleContinue = () => {
    if (hasReferenceVideo) {
      setStep(1); // Go to Analyze
    } else {
      setStep(2); // Skip Analyze, go directly to Scenario
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Getting Started</h2>

      {/* API Key Warning */}
      {!apiKeyReady && (
        <div className="flex items-center justify-between bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-yellow-300 text-sm font-medium">API key not configured</p>
              <p className="text-yellow-300/70 text-xs mt-0.5">
                Configure your AI provider and API key to start the pipeline.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
          >
            <Settings size={14} />
            Open Settings
          </button>
        </div>
      )}

      {/* Source Selection — Reference Video or From Scratch */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300">Source</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setHasReferenceVideo(true)}
            className={`p-4 rounded-lg border text-left transition-colors ${
              hasReferenceVideo
                ? "border-purple-500 bg-purple-500/10"
                : "border-gray-700 hover:border-gray-600"
            }`}
          >
            <Video size={24} className="text-purple-400 mb-2" />
            <p className="font-medium">Reference Video</p>
            <p className="text-sm text-gray-400 mt-1">
              Upload a video to analyze and recreate
            </p>
          </button>
          <button
            onClick={() => {
              setHasReferenceVideo(false);
              setVideoFile(null);
            }}
            className={`p-4 rounded-lg border text-left transition-colors ${
              !hasReferenceVideo
                ? "border-purple-500 bg-purple-500/10"
                : "border-gray-700 hover:border-gray-600"
            }`}
          >
            <PenTool size={24} className="text-pink-400 mb-2" />
            <p className="font-medium">Start from Scratch</p>
            <p className="text-sm text-gray-400 mt-1">
              Describe your idea, AI generates the scenario
            </p>
          </button>
        </div>
      </div>

      {/* Video Upload — only if reference video selected */}
      {hasReferenceVideo && (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-700 rounded-xl p-12 text-center cursor-pointer hover:border-purple-500 transition-colors"
        >
          <Upload size={48} className="mx-auto text-gray-500 mb-4" />
          {videoFile ? (
            <div>
              <p className="text-white font-medium">{videoFile.name}</p>
              <p className="text-gray-400 text-sm mt-1">
                {(videoFile.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-300">Click to upload video</p>
              <p className="text-gray-500 text-sm mt-1">MP4, MOV, AVI — max 100MB</p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setVideoFile(file);
              if (file && currentProjectId && currentWorkId) {
                saveReferenceVideoBlob(currentProjectId, currentWorkId, file).catch(console.error);
              }
            }}
          />
        </div>
      )}

      {/* Video Preview */}
      {hasReferenceVideo && videoFile && (
        <div className="rounded-lg overflow-hidden border border-gray-800">
          <video
            src={URL.createObjectURL(videoFile)}
            controls
            className="w-full max-h-64 object-contain bg-black"
          />
        </div>
      )}

      {/* Mode Selection — only meaningful when using a reference video */}
      {hasReferenceVideo ? (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-300">How to use your reference video</label>
            <p className="text-xs text-gray-500 mt-1">
              Choose whether to copy the video’s look and feel for your product, or remix its content from a different angle.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode("style_transfer")}
              className={`p-4 rounded-lg border text-left transition-colors ${
                mode === "style_transfer"
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-gray-700 hover:border-gray-600"
              }`}
            >
              <p className="font-medium">Style Transfer</p>
              <p className="text-sm text-gray-400 mt-1">
                Recreate the same visual style (colors, camera, composition) for your own product.
              </p>
            </button>
            <button
              onClick={() => setMode("content_remix")}
              className={`p-4 rounded-lg border text-left transition-colors ${
                mode === "content_remix"
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-gray-700 hover:border-gray-600"
              }`}
            >
              <p className="font-medium">Content Remix</p>
              <p className="text-sm text-gray-400 mt-1">
                Keep the same topic but remix the story from a different perspective or tone.
              </p>
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 rounded-lg bg-gray-900/40 border border-gray-800 px-3 py-2">
          Mode (Style Transfer / Content Remix) only applies when you upload a reference video. With Start from Scratch, the scenario is generated from your product and description.
        </p>
      )}

      {/* Product / Description Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {hasReferenceVideo && mode === "content_remix" ? "Video Topic / Product Name *" : "Product Name *"}
          </label>
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none"
            placeholder="e.g., Nike Air Max"
          />
        </div>
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <label className="block text-sm font-medium text-gray-300">
              {!hasReferenceVideo ? "Describe your video idea *" : "Product Description"}
            </label>
            <button
              type="button"
              onClick={() => setShowExtractFromFeature(true)}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Globe size={14} />
              Extract from Feature
            </button>
          </div>
          <textarea
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none resize-none"
            rows={3}
            placeholder={
              !hasReferenceVideo
                ? "Describe the style, mood, scenes you want in your video..."
                : "Describe your product..."
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Target Audience</label>
          <input
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none"
            placeholder="e.g., Young athletes aged 18-25"
          />
        </div>
      </div>

      {/* Optional settings accordion */}
      <div className="rounded-lg border border-gray-700 bg-gray-900/30 overflow-hidden">
        <button
          type="button"
          onClick={() => setOptionalOpen(!optionalOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-800/30 transition-colors"
        >
          <span className="text-sm font-medium text-gray-400">Optional settings</span>
          {optionalOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {optionalOpen && (
          <div className="px-4 pb-4 pt-0 space-y-4 border-t border-gray-700/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Language</label>
                <input
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="e.g., English"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Total video length (seconds)</label>
                <input
                  type="number"
                  value={videoDuration ?? ""}
                  onChange={(e) => setVideoDuration(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="e.g., 30"
                />
                <p className="text-xs text-gray-500 mt-1">AI will plan scene count and duration to match.</p>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Number of scenes</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={sceneCount ?? ""}
                  onChange={(e) => setSceneCount(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full max-w-[120px] bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="e.g., 5"
                />
                <p className="text-xs text-gray-500 mt-1">AI will create exactly this many scenes when set.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Next Button */}
      <button
        disabled={!canProceed}
        onClick={handleContinue}
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        {hasReferenceVideo ? "Continue to Analysis" : "Build Scenario"}
        <ArrowRight size={18} />
      </button>
      {!apiKeyReady && (
        <p className="text-xs text-gray-500">Configure your API key in Settings to continue</p>
      )}

      <ExtractFromLandingModal
        open={showExtractFromFeature}
        onClose={() => setShowExtractFromFeature(false)}
        mode="feature"
        onExtracted={(result) => {
          if (result.productInfo) {
            if (result.productInfo.name) setProductName(result.productInfo.name);
            if (result.productInfo.description) setProductDescription(result.productInfo.description);
            if (result.productInfo.targetAudience) setTargetAudience(result.productInfo.targetAudience);
          }
          setShowExtractFromFeature(false);
          addToast("Video idea fields filled from feature page", "success");
        }}
      />
    </div>
  );
}
