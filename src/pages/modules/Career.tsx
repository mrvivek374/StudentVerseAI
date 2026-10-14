import React, { useMemo, useState } from "react";
import { Briefcase, Contact, ShieldCheck, Mic, Map, Coins } from "lucide-react";
import { PageHeader, EmptyState, AIBadge } from "../../components/ui";
import { useStore } from "../../store";

/* ---------------- Resume builder ---------------- */
type Resume = {
  name: string; email: string; phone: string; headline: string;
  summary: string; skills: string;
  experience: string; projects: string; education: string;
};

const EMPTY_RESUME: Resume = { name: "", email: "", phone: "", headline: "", summary: "", skills: "", experience: "", projects: "", education: "" };

const ATS_ACTION_VERBS = ["built", "led", "designed", "shipped", "reduced", "improved", "created", "launched", "automated", "optimized", "developed", "managed"];

function atsCheck(resume: Resume, jd: string) {
  const all = `${resume.summary} ${resume.experience} ${resume.projects}`.toLowerCase();
  const tips: string[] = [];
  let score = 55;

  // keyword matching
  const jdWords = Array.from(new Set((jd.toLowerCase().match(/[a-z+#.\-]{3,}/g) ?? []).filter((w) => !["the", "and", "for", "with", "you", "will", "our", "are", "have", "this", "that", "from", "your", "their", "about", "work", "team", "role", "job", "who", "what", "using", "across"].includes(w))));
  const matched = jdWords.filter((w) => resume.skills.toLowerCase().includes(w) || all.includes(w));
  if (jd.trim() && jdWords.length) {
    const kw = Math.round((matched.length / Math.min(jdWords.length, 20)) * 30);
    score = Math.min(95, 50 + kw + (resume.summary.length > 120 ? 8 : 0));
    const missing = jdWords.filter((w) => !matched.includes(w)).slice(0, 6);
    if (missing.length) tips.push(`Missing high-value job keywords: ${missing.join(", ")}. Add them where they're genuinely true.`);
  }

  // bullets with action verbs + metrics
  const bullets = all.split(/[.;\n]/).filter((s) => s.trim());
  const strong = bullets.filter((b) => ATS_ACTION_VERBS.some((v) => b.includes(v))).length;
  const numbers = (all.match(/\d+%|\d+x|\$\d/g) || []).length;
  if (strong < 2) tips.push("Start fewer bullets with weak phrasing — lead with action verbs like Built, Shipped, Reduced.");
  if (numbers === 0) tips.push("No measurable results found — add numbers (%, time saved, users, revenue).");
  if (matched.length >= 2 && strong >= 2 && numbers >= 2) score = Math.max(score, 90);

  tips.push("Keep single-column, standard section headers (Experience, Projects, Education, Skills) and no text inside images.");
  return { score: Math.min(score, 97), tips: tips.slice(0, 5) };
}

/* ---------------- Interview coach ---------------- */
const QUESTION_BANK: Record<string, string[]> = {
  Technical: [
    "Walk me through the most complex bug you've fixed. What was your debugging process?",
    "How would you design a simple URL shortener? What are the trade-offs?",
    "Explain a data structure you reach for daily and when it's the wrong choice.",
    "A feature broke right after your release — what do you do in the first 10 minutes?",
  ],
  HR: [
    "Tell me about yourself in 90 seconds.",
    "Describe a time you disagreed with a teammate and how you resolved it.",
    "What's your biggest strength in evidence, not adjectives?",
    "Why this role, and what do you want to learn from it?",
  ],
  Behavioral: [
    "Tell me about a deadline you nearly missed. What did you change?",
    "How do you prioritize when three tasks are all urgent?",
    "Describe feedback that stung but made you better.",
  ],
};

function interviewFeedback(answer: string) {
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  const hasSTAR = /\bI\b/.test(answer) && /then|after|so|because|result|finally/i.test(answer);
  const hasNumbers = /\d/.test(answer);
  return {
    length: words < 40 ? "Too short — aim for 90–150 words with a concrete story." : words > 220 ? "Too long — trim to the decision moments." : "Good length.",
    structure: hasSTAR ? "Good: your answer has a situation → action → outcome flow." : "Try STAR: Situation, Task, Action, Result — name what YOU did, then the outcome.",
    metrics: hasNumbers ? "Nice — you included a concrete number." : "Add one measurable detail (time saved, users, %).",
  };
}

/* ---------------- Career roadmap ---------------- */
function roadmap(role: string, skills: string, hours: number) {
  const base = [
    { w: "Weeks 1–2", item: `Solidify fundamentals: ${skills || "core language + data structures"} — 2 focused hours per day, project-first`, done: false },
    { w: "Weeks 3–4", item: `Build one small ${role} end-to-end project; deploy it live with a README`, done: false },
    { w: "Weeks 5–6", item: `Second project with a real dataset/users; write a 50-line "what I learned" post`, done: false },
    { w: "Weeks 7–8", item: `Interview prep: ${role} questions, 2 mock interviews, STAR stories written`, done: false },
    { w: "Weeks 9–10", item: `Polish resume/portfolio around ${role} keywords; apply to 10 targeted roles`, done: false },
    { w: "Weeks 11–12", item: "Ship one stretch feature on an open-source or community project", done: false },
  ];
  return base;
}

/* ---------------- Skill-to-income hub ---------------- */
const SKILL_PATHS = [
  { skill: "Frontend Development", paths: "JavaScript → React → Next.js", projects: "E-commerce PWA, analytics dashboard", earning: "Freelance sites, part-time internships; realistic range varies by country — verify local rates" },
  { skill: "Data Analytics", paths: "Excel → SQL → Python (pandas) → dashboards", projects: "Public-data dashboard for your campus", earning: "Data-entry-to-analyst freelancing; student portfolio reports" },
  { skill: "Technical Writing", paths: "Strong basics → write tutorials → publish", projects: "Tutorial series on your course notes", earning: "Paid technical writing programs run by dev tool companies" },
  { skill: "Design (UI/UX)", paths: "Figma → design systems → case studies", projects: "Redesign a known app; publish case study", earning: "Student-org design work, contests (e.g. community challenges)" },
];

/* ================= Component ================= */
export default function Career() {
  const { getVal, setVal, logEvent, prefs } = useStore();
  const [tab, setTab] = useState<"resume" | "interview" | "roadmap" | "income">("resume");
  const [resume, setResume] = useState<Resume>(() => getVal<Resume>("resume", EMPTY_RESUME));
  const [jd, setJd] = useState("");
  const [ats, setAts] = useState<ReturnType<typeof atsCheck> | null>(null);
  const [role, setRole] = useState("Technical");
  const [qIndex, setQIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<ReturnType<typeof interviewFeedback> | null>(null);
  const [timer, setTimer] = useState(120);
  const [timerOn, setTimerOn] = useState(false);
  const [targetRole, setTargetRole] = useState(prefs?.careerInterests || "");
  const [roadmapItems, setRoadmapItems] = useState<{ w: string; item: string; done: boolean }[]>(() => getVal("roadmap", []));
  const editR = (k: keyof Resume, v: string) => setResume((r) => ({ ...r, [k]: v }));

  React.useEffect(() => {
    if (!timerOn || timer === 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timerOn, timer]);
  React.useEffect(() => setTimer(120), [qIndex]);

  const save = (patch?: Partial<Resume>) => {
    const next = { ...resume, ...patch };
    setResume(next);
    setVal("resume", next);
    logEvent("task", "Updated resume");
  };

  const questions = QUESTION_BANK[role];

  return (
    <div>
      <PageHeader icon={Briefcase} title="Career Center" subtitle="Resume + ATS check, interview practice, roadmaps and earning skills." />

      <div className="flex flex-wrap gap-2 mb-5">
        {([["resume", Contact, "Resume & ATS"], ["interview", Mic, "Interview Coach"], ["roadmap", Map, "Roadmap"], ["income", Coins, "Skill → Income"]] as const).map(([id, Icon, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`pill inline-flex items-center gap-1.5 ${tab === id ? "!border-teal/60 !text-teal !bg-teal/10" : ""}`}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {tab === "resume" && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="card">
            <h2 className="font-bold text-sm mb-3">Resume builder <span className="text-secondary font-medium">— professional template</span></h2>
            <div className="grid grid-cols-2 gap-2.5">
              <input className="field" placeholder="Full name" value={resume.name} onChange={(e) => editR("name", e.target.value)} />
              <input className="field" placeholder="Email" value={resume.email} onChange={(e) => editR("email", e.target.value)} />
              <input className="field" placeholder="Phone (optional)" value={resume.phone} onChange={(e) => editR("phone", e.target.value)} />
              <input className="field" placeholder="Headline (e.g. CS Junior · React)" value={resume.headline} onChange={(e) => editR("headline", e.target.value)} />
            </div>
            <textarea className="field mt-2.5 h-20" placeholder="Professional summary (2–3 lines)" value={resume.summary} onChange={(e) => editR("summary", e.target.value)} />
            <input className="field mt-2.5" placeholder="Skills (comma-separated)" value={resume.skills} onChange={(e) => editR("skills", e.target.value)} />
            <textarea className="field mt-2.5 h-20" placeholder="Experience — bullet lines" value={resume.experience} onChange={(e) => editR("experience", e.target.value)} />
            <textarea className="field mt-2.5 h-20" placeholder="Projects — bullet lines" value={resume.projects} onChange={(e) => editR("projects", e.target.value)} />
            <input className="field mt-2.5" placeholder="Education — e.g. B.Tech CS, 2024–2028, GPA 8.4" value={resume.education} onChange={(e) => editR("education", e.target.value)} />
            <div className="flex gap-2 mt-3">
              <button className="btn-ghost text-xs" onClick={() => save()}>Save resume</button>
              <button
                className="btn-ghost text-xs"
                onClick={() => {
                  const r = resume;
                  const text = `${r.name}\n${r.headline}\n${r.email}${r.phone ? " · " + r.phone : ""}\n\nSUMMARY\n${r.summary}\n\nSKILLS\n${r.skills}\n\nEXPERIENCE\n${r.experience}\n\nPROJECTS\n${r.projects}\n\nEDUCATION\n${r.education}`;
                  const blob = new Blob([text], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url; a.download = "studentverse-resume.txt"; a.click(); URL.revokeObjectURL(url);
                }}
              >Export .txt</button>
            </div>
            <p className="text-[11px] text-secondary mt-2">Export uses plain text (safe for real ATS parsing). Your resume stays in this browser.</p>
          </div>

          <div className="card">
            <h2 className="font-bold text-sm mb-3 inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-teal" /> ATS checker</h2>
            <textarea className="field h-36" placeholder="Paste the full job description here…" value={jd} onChange={(e) => setJd(e.target.value)} />
            <button className="btn-primary text-sm mt-3" onClick={() => setAts(atsCheck(resume, jd))}>Analyze</button>
            {ats && (
              <div className="mt-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-extrabold" style={{ color: ats.score >= 75 ? "#22c55e" : ats.score >= 50 ? "#facc15" : "#f43f5e" }}>{ats.score}%</div>
                  <p className="text-xs text-secondary max-w-[16rem]">ATS readiness estimate vs the pasted job description. Heuristic — not a guarantee.</p>
                </div>
                <ul className="mt-3 space-y-1.5 text-sm list-disc pl-4">
                  {ats.tips.map((t, i) => <li key={i} className="leading-relaxed">{t}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "interview" && (
        <div className="grid lg:grid-cols-[280px_1fr] gap-4">
          <div className="card !p-3">
            <div className="flex gap-1.5 mb-3 flex-wrap">
              {Object.keys(QUESTION_BANK).map((r) => (
                <button key={r} onClick={() => { setRole(r); setQIndex(0); setFeedback(null); }} className={`pill !px-2.5 !py-1 ${role === r ? "!border-teal/60 !text-teal !bg-teal/10" : ""}`}>{r}</button>
              ))}
            </div>
            <div className="space-y-1.5">
              {questions.map((q, i) => (
                <button
                  key={q}
                  onClick={() => { setQIndex(i); setAnswer(""); setFeedback(null); setTimer(120); }}
                  className={`w-full text-left text-xs px-3 py-2 rounded-lg border transition ${qIndex === i ? "border-teal/60 bg-teal/10" : "border-[var(--bg-card-border)] hover:border-cyan/40"}`}
                >
                  {i + 1}. {q.slice(0, 44)}…
                </button>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-sm">{questions[qIndex]}</p>
              <span className={`text-xs font-mono font-bold ${timer <= 20 ? "text-rose-400" : "text-cyan"}`}>
                {String(Math.floor(timer / 60)).padStart(1, "0")}:{String(timer % 60).padStart(2, "0")}
              </span>
            </div>
            <div className="mt-2 flex gap-2">
              <button onClick={() => setTimerOn((t) => !t)} className="pill !py-1">{timerOn ? "Pause timer" : "Start 2-min timer"}</button>
            </div>
            <textarea
              className="field mt-3 h-36"
              placeholder="Answer as if you're speaking — then get feedback below…"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            <button className="btn-primary text-sm mt-3" onClick={() => setFeedback(interviewFeedback(answer))}>Get feedback</button>
            {feedback && (
              <ul className="mt-3 space-y-1.5 text-sm list-disc pl-4">
                <li><span className="text-teal font-semibold">Length:</span> {feedback.length}</li>
                <li><span className="text-teal font-semibold">Structure:</span> {feedback.structure}</li>
                <li><span className="text-teal font-semibold">Evidence:</span> {feedback.metrics}</li>
              </ul>
            )}
            <p className="text-[11px] text-secondary mt-3">Voice recording is planned — this build uses written answers (works well for practice too).</p>
          </div>
        </div>
      )}

      {tab === "roadmap" && (
        <div className="card">
          <h2 className="font-bold text-sm mb-3">Career roadmap generator</h2>
          <div className="flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-56">
              <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Target role</label>
              <input className="field mt-1" placeholder="e.g. Frontend developer, Data analyst" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
            </div>
            <div className="w-40">
              <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Known skills</label>
              <input className="field mt-1" placeholder="e.g. Python, SQL" onChange={() => undefined} id="rm-skills" />
            </div>
            <button
              className="btn-primary text-sm"
              onClick={() => {
                const skills = (document.getElementById("rm-skills") as HTMLInputElement)?.value ?? "";
                const items = roadmap(targetRole, skills, prefs?.studyHours ?? 10);
                setRoadmapItems(items);
                setVal("roadmap", items);
                logEvent("roadmap", `Roadmap generated for ${targetRole || "target role"}`);
              }}
            >Generate milestone plan</button>
          </div>

          {roadmapItems.length === 0 ? (
            <EmptyState title="No roadmap yet" hint="Enter your target role and generate a 12-week plan you can tick off." />
          ) : (
            <div className="mt-4 space-y-2">
              {roadmapItems.map((m, i) => (
                <label key={i} className="flex items-start gap-3 bg-white/5 rounded-lg px-3 py-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={m.done}
                    onChange={() => {
                      const next = roadmapItems.map((x, j) => (i === j ? { ...x, done: !x.done } : x));
                      setRoadmapItems(next);
                      setVal("roadmap", next);
                    }}
                    className="mt-0.5 accent-teal"
                  />
                  <span className="text-sm">
                    <span className={`font-bold ${m.done ? "text-success line-through" : "text-cyan"}`}>{m.w}</span> — {m.item}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "income" && (
        <div className="card">
          <p className="text-xs text-secondary mb-4">Realistic, hedged guidance — no income guarantees. Skill progression and common, legitimate earning channels.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {SKILL_PATHS.map((s) => (
              <div key={s.skill} className="bg-white/5 border border-[var(--bg-card-border)] rounded-xl p-4">
                <h3 className="font-bold text-teal">{s.skill}</h3>
                <p className="text-xs text-secondary mt-2"><span className="font-bold text-cyan uppercase tracking-wider">Path:</span> {s.paths}</p>
                <p className="text-xs text-secondary mt-1.5"><span className="font-bold text-violet uppercase tracking-wider">Portfolio projects:</span> {s.projects}</p>
                <p className="text-xs text-secondary mt-1.5"><span className="font-bold text-muted uppercase tracking-wider">Where students earn:</span> {s.earning}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
