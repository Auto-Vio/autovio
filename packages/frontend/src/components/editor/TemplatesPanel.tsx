import { X, FileText, Loader2 } from "lucide-react";
import type { EditorTemplateMeta } from "@autovio/shared";
import TemplateCard from "./TemplateCard";

interface TemplatesPanelProps {
  open: boolean;
  onClose: () => void;
  templates: EditorTemplateMeta[];
  loading: boolean;
  onSaveCurrent: () => void;
  onApply: (template: EditorTemplateMeta) => void;
  onDelete: (template: EditorTemplateMeta) => void;
  deletingId: string | null;
  canSaveCurrent: boolean;
}

export default function TemplatesPanel({
  open,
  onClose,
  templates,
  loading,
  onSaveCurrent,
  onApply,
  onDelete,
  deletingId,
  canSaveCurrent,
}: TemplatesPanelProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 max-w-[90vw] bg-gray-900 border-l border-gray-700 shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <h3 className="font-semibold text-white">Templates</h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>
      <div className="p-3 border-b border-gray-700">
        <button
          type="button"
          onClick={onSaveCurrent}
          disabled={!canSaveCurrent}
          className="w-full flex items-center justify-center gap-2 text-sm bg-teal-600 hover:bg-teal-500 disabled:bg-gray-700 disabled:text-gray-500 text-white py-2 px-3 rounded-lg transition-colors"
        >
          <FileText size={16} /> Save current as template
        </button>
        {!canSaveCurrent && (
          <p className="text-xs text-gray-500 mt-1.5">
            Add at least one text or image overlay to save a template.
          </p>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-gray-400">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : templates.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">
            No templates yet. Save your current overlay layout as a template to reuse.
          </p>
        ) : (
          templates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onApply={() => onApply(t)}
              onDelete={() => onDelete(t)}
              isDeleting={deletingId === t.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
