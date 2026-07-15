import { useState } from "react";

/**
 * Tag/chip input: type a value and press Enter or "," to add it as a chip.
 * Click the "x" on a chip to remove it.
 */
export default function ChipInput({ label, values, onChange, placeholder }) {
  const [draft, setDraft] = useState("");

  function commitDraft() {
    const value = draft.trim();
    if (value && !values.includes(value)) {
      onChange([...values, value]);
    }
    setDraft("");
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitDraft();
    } else if (event.key === "Backspace" && draft === "" && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  }

  function removeChip(index) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-300 mb-1">{label}</label>
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-neutral-700 bg-neutral-950 p-2 focus-within:ring-2 focus-within:ring-blue-500">
        {values.map((value, index) => (
          <span
            key={value}
            className="flex items-center gap-1 rounded-full bg-blue-900/40 px-2.5 py-1 text-sm text-blue-300"
          >
            {value}
            <button
              type="button"
              onClick={() => removeChip(index)}
              className="text-blue-400 hover:text-blue-200"
              aria-label={`Remove ${value}`}
            >
              &times;
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitDraft}
          placeholder={placeholder}
          className="min-w-[120px] flex-1 border-none bg-transparent p-1 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none focus:ring-0"
        />
      </div>
    </div>
  );
}
