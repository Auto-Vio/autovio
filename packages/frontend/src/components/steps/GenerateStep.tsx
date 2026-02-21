import { ArrowLeft, ArrowRight, Loader2, RefreshCw, CheckCircle, AlertCircle, Image, Video } from "lucide-react";
import { useStore } from "../../store/useStore";
import { generateImage, generateVideo } from "../../api/client";
import { persistImageUrlAndGetObjectUrl, persistVideoUrlAndGetObjectUrl } from "../../storage/projectStorage";

export default function GenerateStep() {
  const {
    scenes,
    generatedScenes,
    updateGeneratedScene,
    setStep,
    currentProjectId,
    currentWorkId,
    projectImageSystemPrompt,
    projectVideoSystemPrompt,
    workImageSystemPrompt,
    workVideoSystemPrompt,
  } = useStore();

  const generateScene = async (index: number) => {
    const scene = scenes[index];
    if (!scene) return;

    try {
      // Step 1: Generate image
      updateGeneratedScene(index, { status: "generating_image", error: undefined });
      const imageInstruction = workImageSystemPrompt.trim() || projectImageSystemPrompt?.trim();
      const imageOpts = imageInstruction ? { imageInstruction } : undefined;
      const remoteImageUrl = await generateImage(scene.image_prompt, scene.negative_prompt || "", imageOpts);
      const imageUrlForUi =
        currentProjectId && currentWorkId
          ? await persistImageUrlAndGetObjectUrl(currentProjectId, currentWorkId, index, remoteImageUrl)
          : remoteImageUrl;
      updateGeneratedScene(index, { imageUrl: imageUrlForUi });

      // Step 2: Generate video from image (backend needs the remote URL, not blob)
      updateGeneratedScene(index, { status: "generating_video" });
      const videoInstruction = workVideoSystemPrompt.trim() || projectVideoSystemPrompt?.trim();
      const videoOpts = videoInstruction ? { videoInstruction } : undefined;
      const remoteVideoUrl = await generateVideo(
        remoteImageUrl,
        scene.video_prompt,
        scene.duration_seconds,
        videoOpts,
      );
      const videoUrlForUi =
        currentProjectId && currentWorkId
          ? await persistVideoUrlAndGetObjectUrl(currentProjectId, currentWorkId, index, remoteVideoUrl)
          : remoteVideoUrl;
      updateGeneratedScene(index, { videoUrl: videoUrlForUi, status: "done" });
    } catch (err) {
      updateGeneratedScene(index, {
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const generateAll = async () => {
    for (let i = 0; i < scenes.length; i++) {
      const gs = useStore.getState().generatedScenes[i];
      if (gs.status !== "done") {
        await generateScene(i);
      }
    }
  };

  const allDone = generatedScenes.every((s) => s.status === "done");
  const anyGenerating = generatedScenes.some((s) =>
    s.status === "generating_image" || s.status === "generating_video",
  );

  if (generatedScenes.length === 0 || scenes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-4 text-amber-200">
          <p>No scenes to generate. Go back to Scenario and click &quot;Generate Videos&quot; to continue.</p>
        </div>
        <button
          onClick={() => setStep(2)}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
        >
          <ArrowLeft size={16} /> Back to Scenario
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Generate Videos</h2>
        <button
          onClick={generateAll}
          disabled={anyGenerating}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          {anyGenerating ? <Loader2 size={14} className="animate-spin" /> : null}
          Generate All
        </button>
      </div>

      {/* Scene Generation Cards */}
      <div className="space-y-4">
        {generatedScenes.map((gs, i) => {
          const scene = scenes[i];
          return (
            <div key={gs.sceneIndex} className="bg-gray-900 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-purple-400">
                  Scene {gs.sceneIndex}
                </span>
                <div className="flex items-center gap-2">
                  {gs.status === "pending" && (
                    <span className="text-xs text-gray-500">Pending</span>
                  )}
                  {gs.status === "generating_image" && (
                    <span className="flex items-center gap-1 text-xs text-yellow-400">
                      <Loader2 size={12} className="animate-spin" />
                      <Image size={12} /> Generating image...
                    </span>
                  )}
                  {gs.status === "generating_video" && (
                    <span className="flex items-center gap-1 text-xs text-blue-400">
                      <Loader2 size={12} className="animate-spin" />
                      <Video size={12} /> Generating video...
                    </span>
                  )}
                  {gs.status === "done" && (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <CheckCircle size={12} /> Done
                    </span>
                  )}
                  {gs.status === "error" && (
                    <span className="flex items-center gap-1 text-xs text-red-400">
                      <AlertCircle size={12} /> Error
                    </span>
                  )}
                </div>
              </div>

              {/* Preview */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                {gs.imageUrl ? (
                  <img src={gs.imageUrl} alt={`Scene ${gs.sceneIndex}`} className="rounded-lg w-full aspect-video object-cover" />
                ) : (
                  <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center">
                    <Image size={24} className="text-gray-600" />
                  </div>
                )}
                {gs.videoUrl ? (
                  <video src={gs.videoUrl} controls className="rounded-lg w-full aspect-video object-cover" />
                ) : (
                  <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center">
                    <Video size={24} className="text-gray-600" />
                  </div>
                )}
              </div>

              {gs.error && (
                <p className="text-red-400 text-sm mb-2">{gs.error}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => generateScene(i)}
                  disabled={gs.status === "generating_image" || gs.status === "generating_video"}
                  className="flex items-center gap-1 text-xs bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 px-3 py-1.5 rounded transition-colors"
                >
                  <RefreshCw size={12} /> Regenerate
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={() => setStep(2)}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          disabled={!allDone}
          onClick={() => setStep(4)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Open Editor
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
