import { useState, useEffect } from "react";
import { Image, Video, Music, Type, Upload, Trash2, Eye, Loader2 } from "lucide-react";
import type { ProjectAsset } from "@autovio/shared";
import { listProjectAssets, getProjectAssetUrl, deleteProjectAsset } from "../../storage/projectStorage";
import { getAuthToken } from "../../store/useAuthStore";
import { useToastStore } from "../../store/useToastStore";
import AssetUploadDialog from "./AssetUploadDialog";
import AssetPreviewModal from "./AssetPreviewModal";
import ConfirmModal from "../ui/ConfirmModal";

interface ProjectAssetsPanelProps {
  projectId: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  image: <Image size={24} className="text-purple-400" />,
  video: <Video size={24} className="text-blue-400" />,
  audio: <Music size={24} className="text-green-400" />,
  font: <Type size={24} className="text-amber-400" />,
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ProjectAssetsPanel({ projectId }: ProjectAssetsPanelProps) {
  const addToast = useToastStore((s) => s.addToast);
  const [assets, setAssets] = useState<ProjectAsset[]>([]);
  const [totalSize, setTotalSize] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | ProjectAsset["type"]>("all");
  const [showUpload, setShowUpload] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<ProjectAsset | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectAsset | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [thumbUrls, setThumbUrls] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const list = await listProjectAssets(
        projectId,
        filter === "all" ? undefined : filter
      );
      setAssets(list.assets);
      setTotalSize(list.totalSize);
    } catch {
      addToast("Failed to load assets", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [projectId, filter]);

  const handleUploaded = () => {
    setShowUpload(false);
    load();
    addToast("Asset uploaded", "success");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProjectAsset(projectId, deleteTarget.id);
      setDeleteTarget(null);
      load();
      addToast("Asset deleted", "success");
    } catch {
      addToast("Failed to delete asset", "error");
    } finally {
      setDeleting(false);
    }
  };
  
  // Resolve image thumbnails with auth so <img> can load reliably
  useEffect(() => {
    const imageAssets = assets.filter((a) => a.type === "image");
    if (!imageAssets.length) {
      // Clean up if no images
      setThumbUrls((prev) => {
        Object.values(prev).forEach((u) => URL.revokeObjectURL(u));
        return {};
      });
      return;
    }

    const token = getAuthToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    let cancelled = false;

    imageAssets.forEach((asset) => {
      if (thumbUrls[asset.id]) return;
      const url = getProjectAssetUrl(projectId, asset.id);
      fetch(url, { headers })
        .then((res) => (res.ok ? res.blob() : null))
        .then((blob) => {
          if (!blob || cancelled) return;
          const blobUrl = URL.createObjectURL(blob);
          setThumbUrls((prev) => {
            // Revoke any older url for this asset
            if (prev[asset.id]) URL.revokeObjectURL(prev[asset.id]);
            return { ...prev, [asset.id]: blobUrl };
          });
        })
        .catch(() => {});
    });

    // Cleanup removed assets
    setThumbUrls((prev) => {
      const next: Record<string, string> = {};
      const validIds = new Set(imageAssets.map((a) => a.id));
      for (const [id, url] of Object.entries(prev)) {
        if (validIds.has(id)) next[id] = url;
        else URL.revokeObjectURL(url);
      }
      return next;
    });

    return () => {
      cancelled = true;
    };
  }, [assets, projectId]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {(["all", "image", "video", "audio", "font"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Upload size={16} />
          Upload
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-gray-500">
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : assets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-600 bg-gray-800/30 py-8 text-center text-gray-500 text-sm">
          No assets yet. Upload logos, images, or other files to use in your videos.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="rounded-lg border border-gray-700 bg-gray-800/50 overflow-hidden group"
              >
                <div
                  className="aspect-square flex items-center justify-center bg-gray-900/80 cursor-pointer"
                  onClick={() => asset.type === "image" && setPreviewAsset(asset)}
                >
                  {asset.type === "image" && thumbUrls[asset.id] ? (
                    <img
                      src={thumbUrls[asset.id]}
                      alt={asset.name}
                      className="w-full h-full object-contain"
                    />
                  ) : asset.type === "image" ? (
                    <span className="text-gray-500">
                      <Image size={24} />
                    </span>
                  ) : (
                    <span className="text-gray-500">
                      {TYPE_ICONS[asset.type] ?? <Image size={32} />}
                    </span>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-sm font-medium text-white truncate" title={asset.name}>
                    {asset.name}
                  </p>
                  <p className="text-xs text-gray-500">{formatSize(asset.size)}</p>
                </div>
                <div className="flex items-center gap-1 p-2 border-t border-gray-700/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  {asset.type === "image" && (
                    <button
                      type="button"
                      onClick={() => setPreviewAsset(asset)}
                      className="p-1.5 rounded text-gray-400 hover:bg-gray-700 hover:text-white"
                      title="Preview"
                    >
                      <Eye size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(asset)}
                    className="p-1.5 rounded text-red-400 hover:bg-red-500/20"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Total: {assets.length} asset{assets.length !== 1 ? "s" : ""}, {formatSize(totalSize)}
          </p>
        </>
      )}

      <AssetUploadDialog
        open={showUpload}
        projectId={projectId}
        onClose={() => setShowUpload(false)}
        onUploaded={handleUploaded}
      />

      <AssetPreviewModal
        open={previewAsset !== null}
        asset={previewAsset}
        projectId={projectId}
        onClose={() => setPreviewAsset(null)}
      />

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete asset"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  );
}
