import { useState, useMemo } from "react";
import { X } from "lucide-react";
import type { EditorTemplate } from "@autovio/shared";
import { findPlaceholders } from "../../utils/templateUtils";

interface ApplyTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  template: EditorTemplate | null;
  videoDuration: number;
  onApply: (placeholderValues: Record<string, string>) => void;
  isApplying?: boolean;
}

export default function ApplyTemplateDialog({
  open,
  onClose,
  template,
  videoDuration,
  onApply,
  isApplying,
}: ApplyTemplateDialogProps) {
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});

  const placeholders = useMemo(() => {
    if (!template?.content?.textOverlays) return [];
    const set = new Set<string>();
    for (const t of template.content.textOverlays) {
      findPlaceholders(t.text).forEach((k) => set.add(k));
    }
    return Array.from(set);
  }, [template]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(placeholderValues);
  };

  if (!open) return null;

  const textCount = template?.content?.textOverlays?.length ?? 0;
  const imageCount = template?.content?.imageOverlays?.length ?? 0;
  const hasExportSettings = Boolean(template?.content?.exportSettings);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">
            Apply template: {template?.name ?? ""}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-sm text-gray-400">
            This template contains: {textCount} text overlay{textCount !== 1 ? "s" : ""}
            {imageCount > 0 && `, ${imageCount} image overlay${imageCount !== 1 ? "s" : ""}`}
            {hasExportSettings && ", export settings"}.
            Video duration: {videoDuration.toFixed(1)}s.
          </p>

          {placeholders.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-300">Placeholder values</p>
              {placeholders.map((key) => (
                <div key={key}>
                  <label className="block text-xs text-gray-500 mb-0.5">{`{{${key}}}`}</label>
                  <input
                    type="text"
                    value={placeholderValues[key] ?? ""}
                    onChange={(e) =>
                      setPlaceholderValues((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    placeholder={`Value for ${key}`}
                    className="w-full rounded-lg bg-gray-800 border border-gray-600 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isApplying}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:bg-gray-700 disabled:text-gray-500 text-white transition-colors"
            >
              {isApplying ? "Applying..." : "Apply template"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
