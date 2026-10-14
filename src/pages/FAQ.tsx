import React, { useState } from "react";
import { ChevronDown, LifeBuoy } from "lucide-react";
import { Footer } from "./Landing";
import { Link } from "react-router-dom";

const FAQS: { q: string; a: string }[] = [
  {
    q: "Are my account and data stored on a server?",
    a: "Not yet. This build runs without a backend: your account, progress and saved items live in this browser's localStorage under your email key. Connect a database + auth backend (Supabase or Node/Express + DB) to sync across devices.",
  },
  {
    q: "Are the AI answers real AI?",
    a: "Only if an AI provider key is configured in the build environment. Otherwise you're in demo mode and every response is labelled 'Demo' — generated locally from templates. Nothing pretends to be real AI.",
  },
  {
    q: "Can the coding hub run my code?",
    a: "It runs exercises with local browser checks (no external sandbox). Results are honest PASS/FAIL — never simulated success.",
  },
  {
    q: "How does the Pomodoro affect my dashboard?",
    a: "Every completed focus session is logged and feeds the weekly study chart, streak and time totals on the Overview page.",
  },
  {
    q: "Are the internship and scholarship listings real?",
    a: "They're clearly labelled sample data in this build. Save and add real opportunities you find — your entries keep your own links and deadlines.",
  },
  {
    q: "Who can see my resume?",
    a: "It never leaves your browser. It's stored locally, export is plain text, and there are no third-party trackers on the page.",
  },
  {
    q: "Is the 3D scene required to use the tools?",
    a: "No. The universe map is a visual layer; every zone also links from the dashboard sidebar and an accessible list, and heavy effects respect prefers-reduced-motion.",
  },
  {
    q: "When will the community be live?",
    a: "The forum/groups UI is ready as a local demo; real multi-user community requires the backend wiring (accounts + database + moderation tools).",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div>
      <div className="page-bg" />
      <div className="max-w-3xl mx-auto px-5 py-16">
        <span className="chip">Help Center</span>
        <h1 className="h-section mt-4">Frequently asked questions</h1>
        <div className="mt-8 space-y-3">
          {FAQS.map((f, i) => (
            <div key={i} className="card !p-0 overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
                aria-expanded={open === i}
              >
                <span className="font-semibold text-sm">{f.q}</span>
                <ChevronDown className={`w-4 h-4 text-cyan shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <p className="px-5 pb-4 text-sm text-secondary leading-relaxed">{f.a}</p>}
            </div>
          ))}
        </div>
        <div className="card mt-8 flex items-center gap-3">
          <LifeBuoy className="w-5 h-5 text-teal" />
          <p className="text-sm">
            Didn't find your answer? <Link to="/contact" className="text-cyan font-semibold hover:underline">Contact us</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
