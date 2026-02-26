import type { StyleGuide } from "@viragen/shared";

interface StyleGuideFormProps {
  value: StyleGuide | undefined;
  onChange: (guide: StyleGuide | undefined) => void;
  onExtract?: () => void;
  isExtracting?: boolean;
}

export function StyleGuideForm({
  value,
  onChange,
  onExtract,
  isExtracting,
}: StyleGuideFormProps) {
  const guide = value || {};

  const updateField = (field: keyof StyleGuide, val: unknown) => {
    onChange({ ...guide, [field]: val });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-400">Style Guide (Optional)</h4>
        {onExtract && (
          <button
            type="button"
            onClick={onExtract}
            disabled={isExtracting}
            className="text-xs px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {isExtracting ? "Extracting…" : "✨ Extract from Context"}
          </button>
        )}
      </div>

      <div className="border-t border-gray-700/50 pt-3">
        <h5 className="text-xs font-medium text-gray-500 mb-2">Visual Style</h5>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Tone</label>
          <input
            type="text"
            value={guide.tone || ""}
            onChange={(e) => updateField("tone", e.target.value || undefined)}
            placeholder="e.g., energetic, professional, calm"
            className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
          />
        </div>

        <div className="mt-2">
          <label className="block text-xs text-gray-500 mb-1">Color Palette (hex codes)</label>
          <input
            type="text"
            value={guide.color_palette?.join(", ") || ""}
            onChange={(e) => {
              const colors = e.target.value
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean);
              updateField("color_palette", colors.length > 0 ? colors : undefined);
            }}
            placeholder="e.g., #FF5733, #33C3FF, #FFD700"
            className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white font-mono placeholder-gray-500 focus:border-purple-500 focus:outline-none"
          />
          {guide.color_palette && guide.color_palette.length > 0 && (
            <div className="flex gap-2 mt-1.5">
              {guide.color_palette.map((color, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded border border-gray-600"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-2">
          <label className="block text-xs text-gray-500 mb-1">Tempo</label>
          <select
            value={guide.tempo || ""}
            onChange={(e) =>
              updateField("tempo", (e.target.value || undefined) as StyleGuide["tempo"])
            }
            className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          >
            <option value="">Not specified</option>
            <option value="fast">Fast</option>
            <option value="medium">Medium</option>
            <option value="slow">Slow</option>
          </select>
        </div>

        <div className="mt-2">
          <label className="block text-xs text-gray-500 mb-1">Camera Style</label>
          <input
            type="text"
            value={guide.camera_style || ""}
            onChange={(e) => updateField("camera_style", e.target.value || undefined)}
            placeholder="e.g., dynamic with zoom-ins, static wide shots"
            className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="border-t border-gray-700/50 pt-3">
        <h5 className="text-xs font-medium text-gray-500 mb-2">Brand Elements</h5>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Brand Voice</label>
          <input
            type="text"
            value={guide.brand_voice || ""}
            onChange={(e) => updateField("brand_voice", e.target.value || undefined)}
            placeholder="e.g., friendly and conversational"
            className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
          />
        </div>

        <div className="mt-2">
          <label className="block text-xs text-gray-500 mb-1">Must Include (comma-separated)</label>
          <input
            type="text"
            value={guide.must_include?.join(", ") || ""}
            onChange={(e) => {
              const items = e.target.value
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean);
              updateField("must_include", items.length > 0 ? items : undefined);
            }}
            placeholder="e.g., logo in corner, product shot"
            className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
          />
        </div>

        <div className="mt-2">
          <label className="block text-xs text-gray-500 mb-1">Must Avoid (comma-separated)</label>
          <input
            type="text"
            value={guide.must_avoid?.join(", ") || ""}
            onChange={(e) => {
              const items = e.target.value
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean);
              updateField("must_avoid", items.length > 0 ? items : undefined);
            }}
            placeholder="e.g., dark mood, text clutter"
            className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      <p className="text-xs text-gray-500 italic">
        All fields are optional. Use &quot;Extract from Context&quot; to auto-fill from your
        free-form notes.
      </p>
    </div>
  );
}
