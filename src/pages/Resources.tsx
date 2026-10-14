import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Brain, Code2, Briefcase } from "lucide-react";
import { Footer } from "./Landing";

const CATEGORIES = [
  {
    icon: Brain,
    title: "Study techniques",
    route: "/app/study",
    items: ["Active recall & spaced repetition", "The Feynman technique in 5 minutes", "Building a weekly review ritual", "How to read a dense textbook chapter"],
  },
  {
    icon: Code2,
    title: "AI & programming",
    route: "/app/coding",
    items: ["LLMs 101: what they can and can't do", "Your first 10 programming exercises", "Debugging like a detective", "Git basics your team actually uses"],
  },
  {
    icon: BookOpen,
    title: "Project tutorials",
    route: "/app/projects",
    items: ["Scoping a hackathon-sized project", "From idea to architecture in one evening", "Writing a project report that gets marks", "Demo-day slide structure"],
  },
  {
    icon: Briefcase,
    title: "Career preparation",
    route: "/app/career",
    items: ["Resume bullets that ATS systems read", "Mock interview: the STAR method", "Picking a career roadmap you'll finish", "Finding your first internship (sample checklist)"],
  },
];

export default function Resources() {
  return (
    <div>
      <div className="page-bg" />
      <div className="max-w-6xl mx-auto px-5 py-16">
        <span className="chip">Resources</span>
        <h1 className="h-section mt-4">Learning resources &amp; guides</h1>
        <p className="text-secondary mt-3 max-w-2xl">
          Handpicked technique guides linked to the exact tool that makes each one actionable. Articles marked "guide" are
          concise in-app write-ups; deeper external links come with the content backend.
        </p>

        <div className="grid md:grid-cols-2 gap-5 mt-10">
          {CATEGORIES.map((c) => (
            <div key={c.title} className="card">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg grid place-items-center bg-teal/12 border border-teal/30">
                  <c.icon className="w-4.5 h-4.5 text-teal" />
                </div>
                <h2 className="font-bold">{c.title}</h2>
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {c.items.map((i) => (
                  <li key={i} className="flex items-center justify-between gap-2 bg-white/5 rounded-lg px-3 py-2">
                    <span>{i}</span>
                    <Link to={c.route} className="text-[11px] font-bold text-cyan whitespace-nowrap hover:underline">Open tool →</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="card mt-8">
          <p className="text-sm text-secondary">
            📌 We deliberately don't publish beginner-course lists with affiliate links or fabricated "top 10" rankings.
            Every guide above maps to a working tool on the platform — try it instead of just reading about it.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
