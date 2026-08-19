"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

export default function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl px-1 py-2 text-left transition active:scale-[0.99]"
    >
      <span className="min-w-0">
        <span className="block text-[0.95rem] font-semibold text-ink-50">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-[0.8rem] leading-snug text-ink-300">{description}</span>
        ) : null}
      </span>
      <span
        aria-hidden="true"
        className="relative h-[30px] w-[52px] shrink-0 rounded-full border transition-colors duration-300"
        style={{
          background: checked
            ? "linear-gradient(135deg, var(--color-violet-soft), var(--color-violet))"
            : "rgba(255,255,255,0.08)",
          borderColor: checked ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)",
          boxShadow: checked ? "0 8px 22px -10px rgba(139,124,255,0.9)" : "none",
        }}
      >
        <span
          className="absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow-md transition-all duration-300"
          style={{ left: checked ? "26px" : "3px" }}
        />
      </span>
    </button>
  );
}
