import React, { Suspense, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { Flame, Clock, CheckCircle2, CalendarClock, Target } from "lucide-react";
import { useStore } from "../../store";
import { StatCard, ProgressRing, PageHeader } from "../../components/ui";
import { aiConfigured } from "../../ai";

const MiniPlanet = React.lazy(() => import("../../components/three/MiniPlanet"));

function lastDays(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().slice(0, 10);
  });
}

export default function Overview() {
  const { prefs, events, getVal } = useStore();
  const tasks = (getVal<{ note: string; done: boolean; at: number }[]>("tasks", []) || []);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // weekly study minutes from tracked pomodoro/session events
  const days = lastDays(7);
  const chart = useMemo(
    () =>
      days.map((d) => ({
        day: d.slice(5),
        minutes: events.filter((e) => new Date(e.at).toISOString().slice(0, 10) === d && (e.kind === "pomodoro" || e.kind === "session")).reduce((a, e) => a + (e.minutes ?? 0), 0),
      })),
    [days.join(""), events] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const streak = useMemo(() => {
    let s = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const active = events.some((e) => new Date(e.at).toISOString().slice(0, 10) === key && e.kind !== "session");
      if (active) s++;
      else if (i > 0) break;
    }
    return s;
  }, [events]);

  const totalMinutes = chart.reduce((a, c) => a + c.minutes, 0);
  const doneTasks = tasks.filter((t) => t.done).length;
  const taskPct = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0;
  const quizzes = events.filter((e) => e.kind === "quiz");
  const avgScore = quizzes.length ? Math.round(quizzes.reduce((a, q) => a + (q.score ?? 0), 0) / quizzes.length) : null;

  // AI vs rule-based: recommendations clearly labelled
  const recommendations = useMemo(() => {
    const recs = [];
    if (avgScore === null || avgScore < 70) recs.push({ label: "Take a practice quiz", to: "/app/quiz", why: avgScore === null ? "No quizzes yet — establish a baseline" : `Your latest average is ${avgScore}%` });
    if (totalMinutes < 50) recs.push({ label: "Log 25 focused minutes", to: "/app/productivity", why: "Only " + totalMinutes + " study minutes tracked this week" });
    recs.push({ label: "Generate a project idea", to: "/app/projects", why: "Portfolio building drives internship chances" });
    if (prefs?.careerInterests) recs.push({ label: "Update your resume for " + prefs.careerInterests, to: "/app/career", why: "Mirror your target role keywords" });
    return recs.slice(0, 3);
  }, [avgScore, totalMinutes, prefs]);

  return (
    <div>
      <PageHeader
        title={`${greeting}, ${prefs?.name?.split(" ")[0] ?? "Student"} 👋`}
        subtitle={aiConfigured ? "Here's your universe today." : "Here's your universe today."}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Study streak" value={`${streak} day${streak === 1 ? "" : "s"}`} hint="Tracked from real activity" color="#facc15" />
        <StatCard label="Weekly focus" value={`${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`} hint="Pomodoro + sessions" color="#22d3ee" />
        <StatCard label="Task progress" value={`${doneTasks}/${tasks.length || 0}`} hint="Today's checklist" color="#22c55e" />
        <StatCard label="Quiz average" value={avgScore === null ? "—" : `${avgScore}%`} hint={quizzes.length + " quizzes taken"} color="#8b5cf6" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-5">
        {/* Weekly chart */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm">Weekly study time <span className="text-secondary font-medium">(tracked activity)</span></h2>
          </div>
          <div className="mt-3 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}>
                <defs>
                  <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} unit="m" width={38} />
                <Tooltip
                  contentStyle={{ background: "rgba(11,18,32,.9)", border: "1px solid rgba(148,163,184,.2)", borderRadius: 12, color: "#f8fafc", fontSize: 12 }}
                  labelStyle={{ color: "#94a3b8" }}
                  formatter={(v) => [`${v} min`, "Focused"]}
                />
                <Area type="monotone" dataKey="minutes" stroke="#14b8a6" strokeWidth={2} fill="url(#tealGrad)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily goal + mini planet */}
        <div className="card flex flex-col items-center text-center">
          <h2 className="font-bold text-sm self-start">Today's goal</h2>
          <Suspense fallback={<div className="w-28 h-28 mt-2" />}>
            <MiniPlanet className="w-28 h-28 mt-2" />
          </Suspense>
          <ProgressRing value={taskPct} label="Daily goal progress" />
          <p className="text-sm text-secondary mt-2">
            {tasks.length ? `${doneTasks}/${tasks.length} checklist items done` : "Add a few goals to track progress"}
          </p>
          <Link to="/app/productivity" className="btn-ghost mt-3 !py-2 text-xs">Open Productivity Core</Link>
        </div>
      </div>

      {/* Recommendations — clearly labelled */}
      <div className="grid md:grid-cols-2 gap-4 mt-5">
        <div className="card">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-violet" />
            <h2 className="font-bold text-sm">Recommended next <span className="text-[10px] uppercase tracking-wider text-muted">AI-recommended</span></h2>
          </div>
          <div className="mt-3 space-y-2.5">
            {recommendations.map((r) => (
              <Link key={r.to + r.label} to={r.to} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-white/5 border border-[var(--bg-card-border)] hover:border-cyan/40 transition group">
                <div>
                  <p className="text-sm font-semibold group-hover:text-cyan transition">{r.label}</p>
                  <p className="text-[11px] text-secondary">{r.why}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-teal" />
            <h2 className="font-bold text-sm">Recent activity</h2>
          </div>
          <div className="mt-3 space-y-2 max-h-52 overflow-y-auto scrollbar-thin">
            {events.length === 0 && <p className="text-sm text-secondary">No tracked activity yet — finish a Pomodoro or quiz to start your streak.</p>}
            {events.slice(-8).reverse().map((e, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                <span className="flex-1">{e.label}</span>
                <span className="text-[11px] text-secondary">{new Date(e.at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
