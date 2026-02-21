import { CheckCircle, X, AlertCircle } from "lucide-react";
import { useToastStore, type ToastItem } from "../../store/useToastStore";

function ToastItem({ id, message, type }: ToastItem) {
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <div
      role="status"
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${
        type === "success"
          ? "bg-gray-900 border-green-600/50 text-green-100"
          : "bg-gray-900 border-red-600/50 text-red-100"
      }`}
    >
      {type === "success" ? (
        <CheckCircle size={20} className="flex-shrink-0 text-green-400" />
      ) : (
        <AlertCircle size={20} className="flex-shrink-0 text-red-400" />
      )}
      <p className="text-sm font-medium flex-1 min-w-0">{message}</p>
      <button
        type="button"
        onClick={() => removeToast(id)}
        className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      <div className="flex flex-col gap-2 pointer-events-auto">
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} />
        ))}
      </div>
    </div>
  );
}
