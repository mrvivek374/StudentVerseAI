import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Inbox } from "lucide-react";

export function PageHeader({ title, subtitle, icon: Icon }: { title: string; subtitle?: string; icon?: React.ElementType }) {
  return (
    <div className="mb-6">
      <Link to="/app" className="text-xs text-secondary hover:text-cyan inline-flex items-center gap-1 mb-3 transition">
        <ArrowLeft className="w-3 h-3" /> Dashboard
      </Link>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-xl grid place-items-center bg-teal/12 border border-teal/30">
            <Icon className="w-5 h-5 text-teal" />
          </div>
        )}
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-secondary mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

export function StatCard({ label, value, hint, color = "#14b8a6" }: { label: string; value: string | number; hint?: string; color?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="card"
    >
      <p className="text-xs font-semibold text-secondary uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-extrabold mt-1.5" style={{ color }}>{value}</p>
      {hint && <p className="text-[11px] text-secondary mt-1">{hint}</p>}
    </motion.div>
  );
}

export function ProgressRing({ value, size = 72, stroke = 7, color = "#22d3ee", label }: { value: number; size?: number; stroke?: number; color?: string; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(Math.max(value, 0), 100);
  return (
    <svg width={size} height={size} role="img" aria-label={label ?? `${Math.round(pct)}% progress`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(148,163,184,.2)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - pct / 100) }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill="var(--text-primary)" fontSize={size / 4.5} fontWeight="700">
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="text-center py-10 px-6">
      <div className="w-12 h-12 mx-auto rounded-full grid place-items-center bg-white/5 border border-[var(--bg-card-border)]">
        <Inbox className="w-5 h-5 text-secondary" />
      </div>
      <p className="font-semibold mt-3">{title}</p>
      {hint && <p className="text-sm text-secondary mt-1 max-w-sm mx-auto">{hint}</p>}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-secondary">
      <span className="w-4 h-4 rounded-full border-2 border-teal/30 border-t-teal animate-spin" />
      {label ?? "Working…"}
    </span>
  );
}

/** AI demo/labelling badge used wherever generated content is shown. */
export function AIBadge({ demo }: { demo: boolean }) {
  return demo ? <span className="demo-badge">Demo — template response</span> : <span className="chip !border-teal/40 !text-teal !bg-teal/10">AI generated</span>;
}

export const pill = "text-xs px-3 py-1.5 rounded-full border border-[var(--bg-card-border)] font-semibold text-secondary hover:text-cyan hover:border-cyan/40 transition";
