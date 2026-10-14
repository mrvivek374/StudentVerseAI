import React, { Suspense, lazy, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Compass, GraduationCap, Code2, Briefcase, Clock, Users,
  ChevronDown, Zap, Target, Rocket, Sparkles,
} from "lucide-react";
import { useStore } from "../store";
import { ZONES } from "../components/three/UniverseScene";

const StudentVerseCore = lazy(() => import("../components/three/StudentVerseCore"));
const UniverseScene = lazy(() => import("../components/three/UniverseScene"));

/* ---------------- Reveal-on-scroll helper ---------------- */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

const FEATURES = [
  { icon: GraduationCap, title: "AI Study Assistant", desc: "Get step-by-step explanations, solved doubts and practice questions — your core 24/7 tutor.", route: "/app/study" },
  { icon: Code2, title: "Project Studio", desc: "Generate project ideas with architecture, folder structure, steps and testing guidance in minutes.", route: "/app/projects" },
  { icon: Briefcase, title: "Career Center", desc: "ATS-ready resume builder, interview coach and personalized career roadmaps.", route: "/app/career" },
  { icon: Clock, title: "Productivity Core", desc: "Pomodoro tracking, attendance & CGPA calculators and daily learning challenges.", route: "/app/productivity" },
  { icon: Users, title: "Community Nexus", desc: "Study groups, campus collaboration and fair leaderboards built on genuine activity.", route: "/app/community" },
  { icon: Target, title: "Opportunity Portal", desc: "Internships, scholarships, hackathons — searchable, filterable, saveable.", route: "/app/opportunities" },
];

export default function Landing() {
  const { user } = useStore();
  const scrollToTools = () => document.getElementById("universe")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="overflow-x-clip">
      {/* ============ NAVBAR ============ */}
      <header className="sticky top-0 z-40 glass border-x-0 border-t-0 rounded-none">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal to-cyan grid place-items-center shadow-lg shadow-teal/30">
              <Sparkles className="w-4.5 h-4.5 text-deepspace" />
            </div>
            <span className="font-extrabold tracking-tight text-lg">StudentVerse <span className="gradient-text">AI</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <button onClick={scrollToTools} className="hover:text-cyan transition">Universe</button>
            <Link to="/about" className="hover:text-cyan transition">About</Link>
            <Link to="/contact" className="hover:text-cyan transition">Contact</Link>
            <Link to="/faq" className="hover:text-cyan transition">FAQ</Link>
          </nav>
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/signin" title="Sign in with a different account" className="text-sm font-semibold hover:text-cyan transition">Sign in</Link>
              <Link to="/app" className="btn-primary !py-2 !px-4 text-sm">Dashboard</Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/signin" className="text-sm font-semibold hover:text-cyan transition">Sign in</Link>
              <Link to="/signup" className="btn-primary !py-2 !px-4 text-sm">Get started</Link>
            </div>
          )}
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative min-h-[92vh] flex items-center">
        <div className="max-w-7xl mx-auto px-5 grid lg:grid-cols-2 gap-8 items-center py-16">
          {/* Left */}
          <div>
            <span className="chip">⚡ The future of student success</span>
            <h1 className="mt-5 text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">
              Enter the <span className="gradient-text">Future of Learning</span>
            </h1>
            <p className="mt-5 text-lg text-secondary max-w-xl leading-relaxed">
              Learn smarter, build projects, unlock career opportunities, and achieve your goals
              inside your own AI-powered student universe. Your complete academic &amp; career
              success partner.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to={user ? "/app" : "/signin"} className="btn-primary text-base">
                Enter StudentVerse <ArrowRight className="w-4 h-4" />
              </Link>
              <button onClick={scrollToTools} className="btn-ghost text-base">
                <Compass className="w-4 h-4" /> Explore AI Tools
              </button>
            </div>
            {/* Credibility indicators — honest, no invented stats */}
            <div className="mt-9 flex flex-wrap gap-3 text-sm">
              <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4 text-teal" /> Learning tools for every subject
              </div>
              <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-cyan" /> Productivity built for students
              </div>
              <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2.5">
                <Rocket className="w-4 h-4 text-violet" /> Career development suite
              </div>
            </div>
          </div>

          {/* Right — 3D core */}
          <div className="relative h-[420px] md:h-[560px]">
            <Suspense fallback={<div className="absolute inset-0 grid place-items-center"><OrbitLoader /></div>}>
              <StudentVerseCore className="absolute inset-0" />
            </Suspense>
            {/* Floating glass cards */}
            <FloatCard className="absolute top-6 -left-2 md:-left-6" title="AI Tutor" value="Concepts explained step-by-step" color="#14b8a6" />
            <FloatCard className="absolute top-40 right-0 md:-right-4" title="Projects" value="Idea → report → PPT in one studio" color="#22d3ee" />
            <FloatCard className="absolute bottom-8 left-4" title="Career" value="ATS resume + interview prep" color="#8b5cf6" />
            <FloatCard className="absolute bottom-2 right-2" title="Opportunities" value="Internships & hackathons" color="#22c55e" />
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.button
          onClick={scrollToTools}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted hover:text-cyan transition"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          aria-label="Scroll down"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.button>
      </section>

      {/* ============ EXPLORE YOUR UNIVERSE ============ */}
      <section id="universe" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-5">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto">
              <span className="chip">🌍 One universe, six zones</span>
              <h2 className="h-section mt-4">Explore Your Universe</h2>
              <p className="mt-3 text-secondary">
                Every tool lives in one connected world. Hover or click a zone to peek inside —
                or jump straight in with the list below.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="glass rounded-2xl mt-10 p-2 md:p-4">
              <Suspense fallback={<div className="h-96 grid place-items-center text-secondary">Loading universe…</div>}>
                <UniverseScene />
              </Suspense>
            </div>
          </Reveal>

          {/* Accessible list alternative (never gate tools behind 3D) */}
          <Reveal delay={0.15}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {ZONES.map((z) => (
                <Link
                  key={z.id}
                  to={z.route}
                  className="card group hover:-translate-y-0.5"
                  style={{ borderColor: "var(--bg-card-border)" }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: z.color, boxShadow: `0 0 12px ${z.color}` }} />
                    <h3 className="font-bold" style={{ color: z.color }}>{z.name}</h3>
                  </div>
                  <p className="text-sm text-secondary mt-2 leading-relaxed">{z.desc}</p>
                  <span className="text-xs font-semibold mt-3 inline-flex items-center gap-1 group-hover:gap-2 transition-all text-cyan">
                    Open <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ FEATURE MODULES ============ */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-5">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto">
              <span className="chip">🧭 Full student toolkit</span>
              <h2 className="h-section mt-4">Everything a student needs, in one place</h2>
              <p className="mt-3 text-secondary">Six interconnected modules that share one dashboard, one identity, one universe.</p>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.06}>
                <Link to={f.route} className="card h-full block group hover:-translate-y-1">
                  <div className="w-11 h-11 rounded-xl grid place-items-center" style={{ background: "rgba(20,184,166,.12)", border: "1px solid rgba(20,184,166,.3)" }}>
                    <f.icon className="w-5 h-5 text-teal" />
                  </div>
                  <h3 className="font-bold mt-4 group-hover:text-cyan transition">{f.title}</h3>
                  <p className="text-sm text-secondary mt-2 leading-relaxed">{f.desc}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="py-24 relative">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <Reveal>
            <h2 className="h-section">Your universe is waiting</h2>
            <p className="mt-3 text-secondary text-lg">
              Create your free demo account (data stays in this browser) and enter the dashboard
              — or take a tour first.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <Footer />
    </div>
  );
}

function FloatCard({ className, title, value, color }: { className?: string; title: string; value: string; color: string }) {
  return (
    <div className={`${className} glass rounded-xl px-3.5 py-2.5 animate-pulse-soft`}>
      <p className="text-xs font-bold" style={{ color }}>{title}</p>
      <p className="text-[11px] text-secondary mt-0.5 max-w-[180px]">{value}</p>
    </div>
  );
}

function OrbitLoader() {
  return (
    <div className="w-16 h-16 relative">
      <div className="absolute inset-0 rounded-full border-2 border-teal/40 border-t-teal animate-spin" />
      <div className="absolute inset-2 rounded-full border-2 border-cyan/30 border-b-cyan animate-spin [animation-direction:reverse]" />
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[var(--bg-card-border)] py-10">
      <div className="max-w-7xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-5 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-teal to-cyan" />
          <span className="font-bold">StudentVerse AI</span>
          <span className="text-secondary">— Your Complete Academic &amp; Career Success Partner</span>
        </div>
        <nav className="flex flex-wrap gap-5 text-secondary">
          <Link to="/about">About</Link>
          <Link to="/resources">Resources</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </div>
      <p className="text-center text-xs text-secondary mt-6">
        © 2026 StudentVerse AI. Demo build — AI responses, accounts and data are local to your browser until a backend is configured.
      </p>
    </footer>
  );
}
