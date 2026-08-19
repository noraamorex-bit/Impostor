"use client";

import { Sparkles } from "lucide-react";
import { CATEGORY_META } from "@/lib/words";

interface CategoryPickerProps {
  /** Empty array means "all categories". */
  selected: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  /** Categories with no related pairs are disabled in unknown-imposter mode. */
  disabledIds?: string[];
}

export default function CategoryPicker({
  selected,
  onToggle,
  onSelectAll,
  disabledIds = [],
}: CategoryPickerProps) {
  const allSelected = selected.length === 0;
  const disabled = new Set(disabledIds);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className="chip"
        data-selected={allSelected}
        aria-pressed={allSelected}
        onClick={onSelectAll}
      >
        <Sparkles size={15} strokeWidth={2.2} />
        All categories
      </button>

      {CATEGORY_META.map((category) => {
        const isSelected = selected.includes(category.id);
        const isDisabled = disabled.has(category.id);
        return (
          <button
            key={category.id}
            type="button"
            className="chip"
            data-selected={isSelected}
            aria-pressed={isSelected}
            disabled={isDisabled}
            title={isDisabled ? "No related pairs in this category yet" : `${category.count} words`}
            style={isDisabled ? { opacity: 0.32, cursor: "not-allowed" } : undefined}
            onClick={() => onToggle(category.id)}
          >
            <span aria-hidden="true">{category.emoji}</span>
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
