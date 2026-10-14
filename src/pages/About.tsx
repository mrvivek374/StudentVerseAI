import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Target, Compass, Rocket, ShieldCheck, HeartHandshake } from "lucide-react";
import { Footer } from "./Landing";

const CAPS = [
  { icon: Sparkles, t: "AI learning assistant", d: "Explanations, doubt solving, notes summarization, quiz generation." },
  { icon: Target, t: "Project & career studio", d: "Idea → architecture → report/PPT, resume + ATS, interview coaching, roadmaps." },
  { icon: Compass, t: "Universe navigation", d: "Everything discoverable through an interactive 3D map — never gated behind it." },
  { icon: Rocket, t: "Productivity engine", d: "Pomodoro, calculators, challenges and genuine streaks." },
  { icon: HeartHandshake, t: "Community (planned)", d: "Groups, forum and showcases once backend accounts are connected." },
  { icon: ShieldCheck, t: "Privacy-first", d: "Demo data stays locally; AI keys are server-side; no invented claims anywhere." },
];

export default function About() {
  return (
    <div>
      <div className="page-bg" />
      <div className="max-w-4xl mx-auto px-5 py-16">
        <span className="chip">About</span>
        <h1 className="h-section mt-4">StudentVerse AI</h1>
        <p className="text-lg text-secondary mt-3 max-w-2xl leading-relaxed">
          Your Complete Academic &amp; Career Success Partner. One immersive universe where AI tutoring,
          project building, career prep, productivity and community live in the same connected system.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 mt-10">
          <div className="card">
            <h2 className="font-bold flex items-center gap-2"><Target className="w-4 h-4 text-teal" /> Mission</h2>
            <p className="text-sm text-secondary mt-2 leading-relaxed">
              Make every student's day measurably easier: fewer tabs, less friction, honest AI help, and progress
              they can actually see.
            </p>
          </div>
          <div className="card">
            <h2 className="font-bold flex items-center gap-2"><Compass className="w-4 h-4 text-cyan" /> Vision</h2>
            <p className="text-sm text-secondary mt-2 leading-relaxed">
              A virtual student campus that feels like the future — but stays fast, accessible and grounded in real tools.
            </p>
          </div>
        </div>

        <h2 className="text-xl font-extrabold mt-12 mb-4">Platform capabilities</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {CAPS.map((c) => (
            <div key={c.t} className="card !p-4">
              <h3 className="font-bold text-sm flex items-center gap-2"><c.icon className="w-4 h-4 text-teal" /> {c.t}</h3>
              <p className="text-sm text-secondary mt-1.5">{c.d}</p>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-extrabold mt-12 mb-2">Roadmap &amp; current status</h2>
        <div className="card mt-2">
          <ul className="space-y-2.5 text-sm">
            <li className="flex gap-2.5"><span className="text-success font-bold">✦ Now</span><span>Immersive 3D homepage &amp; universe explorer, full toolkit modules, personalization onboarding, dashboard analytics (demo data, local accounts).</span></li>
            <li className="flex gap-2.5"><span className="text-cyan font-bold">Next</span><span>Backend wiring: real accounts, shared community data, synced progress. AI provider key for genuine responses instead of labelled demo templates.</span></li>
            <li className="flex gap-2.5"><span className="text-violet font-bold">Later</span><span>Voice learning assistant, real-time collaboration rooms, verified opportunity feed integrations.</span></li>
          </ul>
        </div>

        <p className="text-xs text-secondary mt-8">
          We don't publish invented testimonials, partner logos or user counts — when real ones exist, they'll appear here.
          <Link to="/contact" className="text-cyan ml-1 hover:underline">Questions? Contact us.</Link>
        </p>
      </div>
      <Footer />
    </div>
  );
}
