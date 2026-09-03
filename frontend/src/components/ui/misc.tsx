import type { ReactNode } from "react";
import "./misc.css";

export function Badge({ status }: { status: "active" | "expired" | "disabled" }) {
  return <span className={`badge badge--${status}`}>{status}</span>;
}

export function Metric({ value, label, delta }: { value: string; label: string; delta?: string }) {
  return (
    <div className="metric">
      <span className="metric__value">{value}</span>
      <span className="metric__label">
        {label}
        {delta && <span className="metric__delta">{delta}</span>}
      </span>
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <h3 className="empty__title">{title}</h3>
      <p className="empty__body">{body}</p>
      {action && <div className="empty__action">{action}</div>}
    </div>
  );
}

export function Skeleton({ h = 16, w = "100%", r = 8 }: { h?: number; w?: number | string; r?: number }) {
  return <div className="skeleton" style={{ height: h, width: w, borderRadius: r }} aria-hidden />;
}

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="tooltip" tabIndex={0} aria-label={label}>
      {children}
      <span className="tooltip__bubble" role="tooltip">{label}</span>
    </span>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="segmented" role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          className={`segmented__item ${value === o.value ? "segmented__item--active" : ""}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function RowList({ items }: { items: { name: string; value: string; share: number }[] }) {
  return (
    <ul className="rowlist">
      {items.map((it) => (
        <li key={it.name} className="rowlist__row">
          <span className="rowlist__name">{it.name}</span>
          <span className="rowlist__bar" aria-hidden><span style={{ width: `${it.share}%` }} /></span>
          <span className="rowlist__value">{it.value}</span>
        </li>
      ))}
    </ul>
  );
}
