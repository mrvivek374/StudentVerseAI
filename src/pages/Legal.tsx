import React from "react";
import { Footer } from "./Landing";
import { ShieldCheck, FileSignature } from "lucide-react";

const PRIVACY = [
  {
    h: "What we store (this build)",
    p: "Demo accounts and student data (profile, plans, quiz history, saved items) are stored in your browser's localStorage only, keyed by your email. Nothing is transmitted to any server in this build.",
  },
  {
    h: "What we don't collect",
    p: "No analytics trackers, no third-party ad scripts, no fingerprinting. Uploads to the Notes tool are processed entirely in-browser.",
  },
  {
    h: "AI features",
    p: "When an AI provider is configured, your prompt text plus preference context is sent to that provider to generate responses. Demo mode sends nothing anywhere.",
  },
  {
    h: "Deleting your data",
    p: "Use Settings → Data & security → 'Delete my data' to permanently remove everything stored for your demo account in this browser.",
  },
  {
    h: "When a backend is added",
    p: "Real accounts will use hashed credentials, per-user database access rules, and server-side validation. Passwords are never stored or logged in plain text. Sensitive documents are not stored unless you explicitly save them.",
  },
];

const TERMS = [
  {
    h: "The service (demo)",
    p: "StudentVerse AI is provided as a demo educational platform, without warranty of any kind. Features may change; data stored in your browser can be lost by clearing browser storage.",
  },
  {
    h: "Your account",
    p: "Demo accounts are local to your browser. Don't store passwords here that you use elsewhere — this is not a production credential system yet.",
  },
  {
    h: "AI generated content",
    p: "AI responses (or labelled demo templates) are educational aids, not professional advice. Verify important facts with your institution's curriculum.",
  },
  {
    h: "Opportunities content",
    p: "Sample listings are placeholders. Always verify real opportunities on their official pages before applying or paying anything. If a listing asks for money to apply, treat it as a red flag.",
  },
  {
    h: "Community conduct",
    p: "When community features go live: be honest, cite sources, no harassment, no academic-fraud services (essay mills, exam leaks). Moderation decisions can be appealed via Contact.",
  },
  {
    h: "Intellectual property",
    p: "Your generated content is yours. Platform design and code remain the project's until an open-source license is published.",
  },
];

export default function Legal({ title }: { title: string }) {
  const isPrivacy = title.includes("Privacy");
  const sections = isPrivacy ? PRIVACY : TERMS;
  return (
    <div>
      <div className="page-bg" />
      <div className="max-w-3xl mx-auto px-5 py-16">
        <span className="chip inline-flex">{isPrivacy ? <ShieldCheck className="w-3.5 h-3.5" /> : <FileSignature className="w-3.5 h-3.5" />} Legal</span>
        <h1 className="h-section mt-4">{title}</h1>
        <p className="text-xs text-secondary mt-2">Last updated: October 13, 2026 · applies to the demo build</p>
        <div className="mt-8 space-y-6">
          {sections.map((s) => (
            <div key={s.h}>
              <h2 className="font-bold text-lg">{s.h}</h2>
              <p className="text-sm text-secondary mt-2 leading-relaxed">{s.p}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
