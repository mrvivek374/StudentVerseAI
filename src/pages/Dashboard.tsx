import React, { Suspense, lazy } from "react";
import { Routes, Route, NavLink, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, GraduationCap, CalendarRange, FileText, BookOpenCheck, Lightbulb,
  Terminal, Briefcase, Globe, Timer, Trophy, Users, Settings, Sparkles, Search,
  Bell, Sun, Moon, LogOut, Code2,
} from "lucide-react";
import { useStore } from "../store";
import { useTheme } from "../theme";
import Overview from "./modules/Overview";
import Study from "./modules/Study";
import Planner from "./modules/Planner";
import Notes from "./modules/Notes";
import Quiz from "./modules/Quiz";
import Projects from "./modules/Projects";
import Coding from "./modules/Coding";
import Career from "./modules/Career";
import Opportunities from "./modules/Opportunities";
import Productivity from "./modules/Productivity";
import Community from "./modules/Community";
import Achievements from "./modules/Achievements";
import SettingsPage from "./modules/Settings";
import Onboarding from "./modules/Onboarding";

const NAV = [
  { to: "/app", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/app/study", icon: GraduationCap, label: "AI Study Assistant" },
  { to: "/app/planner", icon: CalendarRange, label: "Study Planner" },
  { to: "/app/notes", icon: FileText, label: "Notes & Summaries" },
  { to: "/app/quiz", icon: BookOpenCheck, label: "Quiz Center" },
  { to: "/app/projects", icon: Lightbulb, label: "Project Studio" },
  { to: "/app/coding", icon: Terminal, label: "Coding Hub" },
  { to: "/app/career", icon: Briefcase, label: "Career Center" },
  { to: "/app/opportunities", icon: Globe, label: "Opportunities" },
  { to: "/app/productivity", icon: Timer, label: "Productivity" },
  { to: "/app/community", icon: Users, label: "Community" },
  { to: "/app/achievements", icon: Trophy, label: "Achievements" },
  { to: "/app/settings", icon: Settings, label: "Settings" },
];

export default function Dashboard() {
  const { user, signOut, prefs } = useStore();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();

  if (!prefs?.onboardingDone) return <Onboarding />;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-[var(--bg-card-border)] bg-[var(--bg-page-2)]/60 backdrop-blur-xl sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-2 px-5 h-16 border-b border-[var(--bg-card-border)]">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal to-cyan grid place-items-center">
            <Sparkles className="w-3.5 h-3.5 text-deepspace" />
          </div>
          <span className="font-extrabold tracking-tight">StudentVerse</span>
        </Link>
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2.5 space-y-0.5 text-sm">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-medium transition ${
                  isActive
                    ? "bg-teal/15 text-teal shadow-[inset_0_0_12px_rgba(20,184,166,.15)]"
                    : "text-secondary hover:text-cyan hover:bg-white/5"
                }`
              }
            >
              <n.icon className="w-4 h-4 shrink-0" /> {n.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 glass border-x-0 border-t-0 rounded-none flex items-center gap-3 px-4 md:px-6">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal to-cyan" />
          </div>
          <div className="flex-1 max-w-md hidden md:block relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="field !pl-9" placeholder="Search modules, tools, notes…" aria-label="Search" />
          </div>
          <div className="flex-1 md:hidden" />
          <span className="demo-badge" title="No backend configured — accounts and data live in this browser only">Demo account · local data</span>
          <button onClick={toggle} className="p-2 rounded-lg hover:bg-white/5 text-secondary hover:text-cyan transition" aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal to-cyan grid place-items-center text-deepspace font-bold text-xs" title={user?.email}>
            {user?.name?.[0]?.toUpperCase() ?? "S"}
          </div>
          <button
            onClick={() => { signOut(); nav("/"); }}
            className="p-2 rounded-lg hover:bg-white/5 text-secondary hover:text-rose-400 transition"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </header>

        {/* Mobile nav strip */}
        <div className="lg:hidden flex gap-1.5 px-3 py-2 overflow-x-auto scrollbar-thin border-b border-[var(--bg-card-border)]">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  isActive ? "border-teal/50 text-teal bg-teal/10" : "border-[var(--bg-card-border)] text-secondary"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </div>

        <main className="flex-1 p-4 md:p-7 max-w-6xl w-full mx-auto">
          <Suspense fallback={<p className="text-secondary">Loading module…</p>}>
            <ModuleRoutes />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function ModuleRoutes() {
  return (
    <Routes>
      <Route index element={<Overview />} />
      <Route path="study" element={<Study />} />
      <Route path="planner" element={<Planner />} />
      <Route path="notes" element={<Notes />} />
      <Route path="quiz" element={<Quiz />} />
      <Route path="projects" element={<Projects />} />
      <Route path="coding" element={<Coding />} />
      <Route path="career" element={<Career />} />
      <Route path="opportunities" element={<Opportunities />} />
      <Route path="productivity" element={<Productivity />} />
      <Route path="community" element={<Community />} />
      <Route path="achievements" element={<Achievements />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="*" element={<p className="text-secondary">Module not found. <Link className="text-cyan underline" to="/app">Back to overview</Link></p>} />
    </Routes>
  );
}

export const unusedIconsForTreeShaking = [Code2];
