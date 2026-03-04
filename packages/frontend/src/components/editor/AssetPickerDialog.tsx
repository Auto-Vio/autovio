import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import type { ProjectAsset } from "@autovio/shared";
import { listProjectAssets, getProjectAssetUrl } from "../../storage/projectStorage";
import { getAuthToken } from "../../store/useAuthStore";

interface AssetPickerDialogProps {
  open: boolean;
  projectId: string | null;
  onSelect: (asset: ProjectAsset) => void;
  onClose: () => void;
}

export default function AssetPickerDialog({
  open,
  projectId,
  onSelect,
  onClose,
}: AssetPickerDialogProps) {
  const [assets, setAssets] = useState<ProjectAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [thumbUrls, setThumbUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open || !projectId) return;
    setLoading(true);
    listProjectAssets(projectId, "image")
      .then((list) => setAssets(list.assets))
      .catch(() => setAssets([]))
      .finally(() => setLoading(false));
  }, [open, projectId]);

  // Resolve image thumbnails with auth (must run unconditionally for hook order)
  useEffect(() => {
    if (!open || !projectId) {
      setThumbUrls((prev) => {
        Object.values(prev).forEach((u) => URL.revokeObjectURL(u));
        return {};
      });
      return;
    }
    const token = getAuthToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    let cancelled = false;

    assets.forEach((asset) => {
      if (thumbUrls[asset.id]) return;
      const url = getProjectAssetUrl(projectId, asset.id);
      fetch(url, { headers })
        .then((res) => (res.ok ? res.blob() : null))
        .then((blob) => {
          if (!blob || cancelled) return;
          const blobUrl = URL.createObjectURL(blob);
          setThumbUrls((prev) => {
            if (prev[asset.id]) URL.revokeObjectURL(prev[asset.id]);
            return { ...prev, [asset.id]: blobUrl };
          });
        })
        .catch(() => {});
    });

    // Cleanup removed
    setThumbUrls((prev) => {
      const next: Record<string, string> = {};
      const ids = new Set(assets.map((a) => a.id));
      for (const [id, url] of Object.entries(prev)) {
        if (ids.has(id)) next[id] = url;
        else URL.revokeObjectURL(url);
      }
      return next;
    });

    return () => {
      cancelled = true;
    };
  }, [open, projectId, assets]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="bg-gray-900 border border-gray-700 rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="asset-picker-title"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h2 id="asset-picker-title" className="text-lg font-semibold text-white">
            Select image asset
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={28} className="animate-spin text-purple-400" />
            </div>
          ) : assets.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">
              No image assets. Upload images in Project settings → Project assets.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => {
                    onSelect(asset);
                    onClose();
                  }}
                  className="rounded-lg border border-gray-700 bg-gray-800/50 hover:border-purple-500 hover:bg-gray-800 overflow-hidden text-left"
                >
                  <div className="aspect-square flex items-center justify-center bg-gray-900/80">
                    {thumbUrls[asset.id] ? (
                      <img
                        src={thumbUrls[asset.id]}
                        alt={asset.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-gray-500 text-xs">Loading...</div>
                    )}
                  </div>
                  <p className="p-2 text-xs font-medium text-white truncate">{asset.name}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
