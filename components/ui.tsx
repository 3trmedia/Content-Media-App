"use client";

import { useState, type ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-3 px-4 pt-4 pb-4">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-accent">{eyebrow}</p>
        <h1 className="mt-1 font-display text-[1.5rem] font-semibold leading-tight text-ink">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-[13px] text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="px-4 pb-6">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Card({
  children,
  accent = "none",
  className = "",
  onClick,
}: {
  children: ReactNode;
  accent?: "accent" | "warm" | "danger" | "none";
  className?: string;
  onClick?: () => void;
}) {
  const border =
    accent === "accent"
      ? "border-l-[3px] border-l-accent"
      : accent === "warm"
        ? "border-l-[3px] border-l-warm"
        : accent === "danger"
          ? "border-l-[3px] border-l-danger"
          : "";
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-line bg-surface p-3.5 ${border} ${onClick ? "cursor-pointer active:opacity-80" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "warm" | "danger" | "info";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-bg text-ink-soft",
    accent: "bg-accent-soft text-accent",
    warm: "bg-warm-soft text-warm",
    danger: "bg-danger-soft text-danger",
    info: "bg-info-soft text-info",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 rounded-lg bg-bg p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[12.5px] font-medium transition-colors ${
            value === opt.value ? "bg-surface text-ink shadow-sm" : "text-ink-soft"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      aria-pressed={checked}
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors ${
        checked ? "border-accent bg-accent text-bg" : "border-line bg-surface"
      }`}
    >
      {checked && (
        <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 6.2L4.6 8.8L10 3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

export function Collapsible({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-line bg-surface">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3.5 py-3 text-left"
      >
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
          {title}
        </span>
        <span className={`text-ink-soft transition-transform ${open ? "rotate-180" : ""}`}>
          ⌄
        </span>
      </button>
      {open && <div className="border-t border-line px-3.5 py-3.5">{children}</div>}
    </div>
  );
}

export function ScorePill({ score }: { score: number | null }) {
  if (score === null) return <Pill>—</Pill>;
  const tone = score >= 70 ? "accent" : score >= 40 ? "warm" : "danger";
  return <Pill tone={tone}>{score}</Pill>;
}

export function EasePill({ ease }: { ease: number | null }) {
  if (ease === null) return <Pill>—</Pill>;
  return <Pill tone={ease >= 4 ? "accent" : ease >= 2 ? "warm" : "danger"}>Ease {ease}</Pill>;
}
