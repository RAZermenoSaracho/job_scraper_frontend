import { useState } from "react";
import ChipInput from "./ChipInput.jsx";

function NumberField({ label, value, onChange, min = 0 }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

/**
 * Collapsible search configuration panel. Fully controlled: all edits go
 * through `onChange`, and the parent (App) is responsible for persisting
 * this to localStorage via useJobConfig.
 */
export default function ConfigForm({ config, onChange, onSearch, loading }) {
  const [isOpen, setIsOpen] = useState(true);

  function updateField(field, value) {
    onChange({ ...config, [field]: value });
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <h2 className="text-base font-semibold text-gray-900">Search configuration</h2>
        <span className="text-gray-500">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="space-y-4 border-t border-gray-200 px-4 py-4">
          <ChipInput
            label="Keywords"
            values={config.keywords}
            onChange={(values) => updateField("keywords", values)}
            placeholder="Add keyword and press Enter"
          />
          <ChipInput
            label="Acceptable locations"
            values={config.acceptable_locations}
            onChange={(values) => updateField("acceptable_locations", values)}
            placeholder="Add location and press Enter"
          />
          <ChipInput
            label="Anti-keywords"
            values={config.anti_keywords}
            onChange={(values) => updateField("anti_keywords", values)}
            placeholder="Add anti-keyword and press Enter"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <NumberField
              label="Max jobs saved"
              value={config.max_jobs_saved}
              onChange={(value) => updateField("max_jobs_saved", value)}
              min={1}
            />
            <NumberField
              label="Max jobs searched per keyword"
              value={config.max_jobs_searched_per_keyword}
              onChange={(value) => updateField("max_jobs_searched_per_keyword", value)}
              min={1}
            />
            <NumberField
              label="Max experience years"
              value={config.max_experience_years}
              onChange={(value) => updateField("max_experience_years", value)}
              min={0}
            />
          </div>

          <button
            type="button"
            onClick={onSearch}
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 sm:w-auto"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      )}
    </div>
  );
}
