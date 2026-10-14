import React, { useState } from "react";
import { Lightbulb, Save, FileDown, Presentation, ScrollText } from "lucide-react";
import { demoProject, demoReport, aiConfigured } from "../../ai";
import { PageHeader, AIBadge } from "../../components/ui";
import { useStore } from "../../store";

type Project = ReturnType<typeof demoProject> & { title: string };

export default function Projects() {
  const { getVal, setVal, logEvent } = useStore();
  const [domain, setDomain] = useState("");
  const [level, setLevel] = useState("Intermediate");
  const [lang, setLang] = useState("JavaScript/TypeScript");
  const [complexity, setComplexity] = useState("Mini");
  const [project, setProject] = useState<Project | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<Project[]>(() => getVal<Project[]>("savedProjects", []));
  const [report, setReport] = useState<string | null>(null);
  const [ppt, setPpt] = useState<string[]>([]);

  async function generate() {
    if (domain.trim().length < 3) return;
    setBusy(true);
    try {
      const p = demoProject(domain.trim(), level, lang, complexity);
      setProject(p);
      setReport(null);
      setPpt([]);
      logEvent("project", `Generated project: ${p.title}`);
    } finally {
      setBusy(false);
    }
  }

  function saveProject() {
    if (!project) return;
    const next = [project, ...saved].slice(0, 20);
    setSaved(next);
    setVal("savedProjects", next);
  }

  function makeReport() {
    if (!project) return;
    setReport(demoReport(project.title));
  }

  function makePpt() {
    if (!project) return;
    setPpt([
      `Slide 1 — Title: ${project.title}`,
      `Slide 2 — Problem: What gap in ${domain} does this solve? Who feels it daily?`,
      `Slide 3 — Solution: ${project.description}`,
      `Slide 4 — Key features: ${project.features.slice(0, 4).join("; ")}`,
      `Slide 5 — Architecture: ${project.architecture[0]}`,
      `Slide 6 — Tech stack: ${project.tech.join(", ")}`,
      `Slide 7 — Demo/screens: show the core user journey in 2–3 screenshots`,
      `Slide 8 — Results & impact: metrics you improved, what you learned`,
      `Slide 9 — Roadmap: 3 next features you'd ship`,
      `Slide 10 — Thank you / Q&A`,
    ]);
  }

  function download(name: string, content: string) {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PageHeader icon={Lightbulb} title="Project Studio" subtitle="Generate project ideas, reports and presentation outlines in one place." />

      <div className="card mb-4 grid sm:grid-cols-4 gap-3 items-end">
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Domain / idea seed</label>
          <input className="field mt-1" placeholder="e.g. campus food waste, fitness, fintech" value={domain} onChange={(e) => setDomain(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Skill level</label>
          <select className="field mt-1" value={level} onChange={(e) => setLevel(e.target.value)}>
            {["Beginner", "Intermediate", "Advanced"].map((x) => <option key={x}>{x}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Language</label>
          <select className="field mt-1" value={lang} onChange={(e) => setLang(e.target.value)}>
            {["JavaScript/TypeScript", "Python", "Java", "C++", "Go"].map((x) => <option key={x}>{x}</option>)}
          </select>
        </div>
        <div className="sm:col-span-4 flex justify-end">
          <button className="btn-primary text-sm" onClick={generate} disabled={busy || domain.trim().length < 3}>
            {busy ? "Generating…" : "Generate project"}
          </button>
        </div>
      </div>

      {project && (
        <div className="card">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-lg font-extrabold text-teal">{project.title}</h2>
              <p className="text-sm text-secondary mt-1 max-w-2xl">{project.description}</p>
            </div>
            <AIBadge demo={!aiConfigured} />
          </div>

          <div className="grid md:grid-cols-2 gap-5 mt-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan">Features</h3>
              <ul className="text-sm mt-1.5 space-y-1 list-disc pl-4">{project.features.map((f, i) => <li key={i}>{f}</li>)}</ul>
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan mt-4">Tech stack</h3>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {project.tech.map((t) => <span key={t} className="text-[11px] px-2 py-1 rounded-md bg-teal/10 border border-teal/30 text-teal font-semibold">{t}</span>)}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-violet">Architecture</h3>
              <ul className="text-sm mt-1.5 space-y-1 list-disc pl-4">{project.architecture.map((a, i) => <li key={i}>{a}</li>)}</ul>
              <h3 className="text-xs font-bold uppercase tracking-wider text-violet mt-4">Implementation steps</h3>
              <ol className="text-sm mt-1.5 space-y-1 list-decimal pl-4">{project.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5 mt-5 text-sm">
            <div><h3 className="text-xs font-bold uppercase tracking-wider text-muted">Folder structure</h3><p className="mt-1.5 font-mono text-xs">{project.folder}</p></div>
            <div><h3 className="text-xs font-bold uppercase tracking-wider text-muted">Testing guidance</h3><p className="mt-1.5">{project.testing}</p></div>
          </div>

          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-[var(--bg-card-border)]">
            <button onClick={saveProject} className="btn-ghost text-xs inline-flex items-center gap-1.5"><Save className="w-3.5 h-3.5" /> Save project</button>
            <button onClick={makeReport} className="btn-ghost text-xs inline-flex items-center gap-1.5"><ScrollText className="w-3.5 h-3.5" /> Build report</button>
            <button onClick={makePpt} className="btn-ghost text-xs inline-flex items-center gap-1.5"><Presentation className="w-3.5 h-3.5" /> Build slides outline</button>
          </div>

          {report && (
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">Project report <span className="demo-badge ml-2">Demo template — fill with your real data</span></h3>
                <button onClick={() => download("report.md", report)} className="text-xs font-semibold text-cyan inline-flex items-center gap-1 hover:underline"><FileDown className="w-3 h-3" /> Export</button>
              </div>
              <pre className="mt-2 text-xs whitespace-pre-wrap font-mono bg-white/5 border border-[var(--bg-card-border)] rounded-lg p-4 max-h-72 overflow-y-auto scrollbar-thin">{report}</pre>
            </div>
          )}

          {ppt.length > 0 && (
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">Presentation outline</h3>
                <button onClick={() => download("presentation-outline.txt", ppt.join("\n\n"))} className="text-xs font-semibold text-cyan inline-flex items-center gap-1 hover:underline"><FileDown className="w-3 h-3" /> Export</button>
              </div>
              <ol className="mt-2 space-y-1.5 text-sm list-decimal pl-4">{ppt.map((s, i) => <li key={i}>{s}</li>)}</ol>
            </div>
          )}
        </div>
      )}

      {saved.length > 0 && (
        <div className="card mt-5">
          <h2 className="font-bold text-sm mb-3">Saved projects</h2>
          <div className="space-y-2">
            {saved.map((p, i) => (
              <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2.5 text-sm">
                <span className="font-semibold">{p.title}</span>
                <div className="flex gap-2">
                  <button onClick={() => setProject(p)} className="text-xs text-cyan hover:underline">Open</button>
                  <button
                    onClick={() => { const n = saved.filter((_, j) => j !== i); setSaved(n); setVal("savedProjects", n); }}
                    className="text-xs text-rose-400 hover:underline"
                  >Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
