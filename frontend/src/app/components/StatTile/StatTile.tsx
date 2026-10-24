import type { ReactNode } from "react";

export function StatTile({
  icon,
  label,
  value,
  unit,
  sub,
  children,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
  unit?: string;
  sub?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="flex items-center gap-2 text-sm font-medium text-ink-secondary">
        {icon}
        {label}
      </p>
      <p className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-ink">{value}</span>
        {unit && value !== "—" && <span className="text-sm text-ink-muted">{unit}</span>}
      </p>
      {sub && <div className="mt-1 text-sm text-ink-muted">{sub}</div>}
      {children}
    </div>
  );
}
