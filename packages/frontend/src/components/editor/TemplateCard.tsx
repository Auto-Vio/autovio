import { FileText, Trash2 } from "lucide-react";
import type { EditorTemplateMeta } from "@autovio/shared";

interface TemplateCardProps {
  template: EditorTemplateMeta;
  onApply: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export default function TemplateCard({
  template,
  onApply,
  onDelete,
  isDeleting,
}: TemplateCardProps) {
  const summary = [
    template.textOverlayCount > 0 && `${template.textOverlayCount} text`,
    template.imageOverlayCount > 0 && `${template.imageOverlayCount} image`,
  ]
    .filter(Boolean)
    .join(" • ");
  const updated = new Date(template.updatedAt);
  const updatedStr =
    updated.getTime() === updated.getTime()
      ? updated.toLocaleDateString(undefined, { hour: "2-digit", minute: "2-digit" })
      : "";

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3 space-y-2">
      <div className="flex items-start gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-gray-700 text-gray-400">
          <FileText size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-white truncate">{template.name}</p>
          {template.description && (
            <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{template.description}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {summary}
            {updatedStr && ` • ${updatedStr}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onApply}
          className="text-xs bg-teal-600 hover:bg-teal-500 text-white px-2.5 py-1.5 rounded transition-colors"
        >
          Apply
        </button>
        <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="Delete template"
          >
            <Trash2 size={14} />
          </button>
      </div>
    </div>
  );
}
