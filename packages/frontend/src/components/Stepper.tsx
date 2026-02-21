import { Check, SkipForward } from "lucide-react";
import { useStore } from "../store/useStore";

const steps = [
  { label: "Setup", step: 0 },
  { label: "Analyze", step: 1 },
  { label: "Scenario", step: 2 },
  { label: "Generate", step: 3 },
  { label: "Editor", step: 4 },
] as const;

export default function Stepper() {
  const { currentStep, hasReferenceVideo, setStep } = useStore();

  return (
    <nav
      className="flex items-center gap-2 mb-8"
      aria-label="Pipeline steps"
    >
      {steps.map(({ label, step }, i) => {
        const isSkipped = !hasReferenceVideo && step === 1;
        const isActive = currentStep === step;
        const isDone = currentStep > step;

        return (
          <div key={step} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep(step)}
              className="flex items-center gap-2 rounded-lg px-1 py-0.5 -mx-1 transition-colors hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-950"
              aria-current={isActive ? "step" : undefined}
              aria-label={`${label}${isDone ? ", completed" : isSkipped ? ", skipped" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  isSkipped
                    ? "bg-gray-800 text-gray-600"
                    : isDone
                      ? "bg-green-600 text-white"
                      : isActive
                        ? "bg-purple-600 text-white"
                        : "bg-gray-800 text-gray-500"
                }`}
              >
                {isSkipped ? (
                  <SkipForward size={14} />
                ) : isDone ? (
                  <Check size={16} />
                ) : (
                  step + 1
                )}
              </div>
              <span
                className={`text-sm ${
                  isSkipped
                    ? "text-gray-600 line-through"
                    : isActive
                      ? "text-white font-medium"
                      : isDone
                        ? "text-green-400"
                        : "text-gray-500"
                }`}
              >
                {label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div
                className={`w-8 h-px ${
                  isSkipped ? "bg-gray-800" : isDone ? "bg-green-600" : "bg-gray-700"
                }`}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
