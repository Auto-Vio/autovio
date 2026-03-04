import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { ProjectAsset } from "@autovio/shared";
import { getProjectAssetUrl } from "../../storage/projectStorage";
import { getAuthToken } from "../../store/useAuthStore";

interface AssetPreviewModalProps {
  open: boolean;
  asset: ProjectAsset | null;
  projectId: string;
  onClose: () => void;
}

export default function AssetPreviewModal({
  open,
  asset,
  projectId,
  onClose,
}: AssetPreviewModalProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open || !asset || asset.type !== "image" || !projectId) {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      setBlobUrl(null);
      return;
    }
    const url = getProjectAssetUrl(projectId, asset.id);
    const token = getAuthToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    let cancelled = false;
    fetch(url, { headers })
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => {
        if (cancelled || !blob) return;
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        const u = URL.createObjectURL(blob);
        blobUrlRef.current = u;
        setBlobUrl(u);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      setBlobUrl(null);
    };
  }, [open, asset?.id, projectId]);

  if (!open || !asset) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Asset preview"
    >
      <div
        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-10 right-0 p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white z-10"
        >
          <X size={24} />
        </button>
        {asset.type === "image" ? (
          blobUrl ? (
            <img
              src={blobUrl}
              alt={asset.name}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-xl"
            />
          ) : (
            <div className="text-gray-400">Loading...</div>
          )
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-xl px-8 py-6 text-center">
            <p className="text-gray-400 mb-2">Preview not available for this file type.</p>
            <p className="text-white font-medium">{asset.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}
