"use client";

interface SegmentedProps<T extends string | number> {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  label: string;
}

export default function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  label,
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="glass-flat flex gap-1 overflow-x-auto p-1 hide-scrollbar"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className="relative min-h-[42px] flex-1 whitespace-nowrap rounded-[14px] px-3 text-[0.85rem] font-semibold transition"
            style={{
              background: selected
                ? "linear-gradient(135deg, rgba(179,168,255,0.95), rgba(139,124,255,0.95))"
                : "transparent",
              color: selected ? "#14071f" : "var(--color-ink-300)",
              boxShadow: selected ? "0 10px 24px -14px rgba(139,124,255,0.95)" : "none",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
