import { useState } from "react";
import type { StyleGuide } from "@autovio/shared";
import { extractStyleGuideFromLanding, type ExtractFromLandingProductInfo } from "../../api/client";

export interface ExtractFromLandingResult {
  styleGuide: StyleGuide;
  productInfo?: ExtractFromLandingProductInfo;
}

interface ExtractFromLandingModalProps {
  open: boolean;
  onClose: () => void;
  /** "landing" = full page → style guide; "feature" = only feature section → productInfo for video idea */
  mode?: "landing" | "feature";
  /** When mode is "landing", also request productInfo from AI. */
  includeProductInfo?: boolean;
  /** Called with styleGuide (and productInfo when applicable). */
  onExtracted: (result: ExtractFromLandingResult) => void;
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export default function ExtractFromLandingModal({
  open,
  onClose,
  mode = "landing",
  includeProductInfo = false,
  onExtracted,
}: ExtractFromLandingModalProps) {
  const [url, setUrl] = useState("");
  const [step, setStep] = useState<"input" | "loading" | "complete" | "error">(
    "input"
  );
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    const raw = url.trim();
    if (!raw) {
      setError("Please enter a URL");
      return;
    }
    if (!isValidUrl(raw)) {
      setError("Please enter a valid URL (e.g. https://example.com)");
      return;
    }
    setError(null);
    setStep("loading");
    try {
      const result = await extractStyleGuideFromLanding(raw, {
        mode,
        includeProductInfo: mode === "landing" ? includeProductInfo : undefined,
      });
      onExtracted(result);
      setStep("complete");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze page");
      setStep("error");
    }
  };

  const handleClose = () => {
    setUrl("");
    setStep("input");
    setError(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div
        className="bg-gray-900 border border-gray-700 rounded-xl shadow-xl max-w-md w-full p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">
            {mode === "feature" ? "Extract from Feature" : "Extract from Landing Page"}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          {mode === "feature"
            ? "Enter a URL. Only the feature/main content section of the page will be analyzed to fill Product Name, Video Idea, and Target Audience."
            : includeProductInfo
              ? "Enter a landing page URL. We'll analyze it and fill Product Name, Video Idea, and Target Audience."
              : "Enter a landing page URL. The backend will fetch the page, extract content and styles, and generate a style guide with AI."}
        </p>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
          placeholder="https://www.example.com"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none text-sm mb-4"
          disabled={step === "loading"}
        />
        {error && (
          <p className="text-sm text-red-400 mb-4" role="alert">
            {error}
          </p>
        )}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={step === "loading"}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {step === "loading" ? "Analyzing…" : "Analyze"}
          </button>
        </div>
      </div>
    </div>
  );
}
