import React, { useEffect, useMemo, useRef, useState } from "react";
import { Timer, CheckCircle2, Play, Pause, RotateCcw, Bell, CalendarX2, Sparkles, ListTodo } from "lucide-react";
import { PageHeader, EmptyState, StatCard } from "../../components/ui";
import { useStore } from "../../store";

/* ---------------- Pomodoro ---------------- */
function Pomodoro({ onLog }: { onLog: (minutes: number) => void }) {
  const [study, setStudy] = useState(25);
  const [brk, setBrk] = useState(5);
  const [phase, setPhase] = useState<"study" | "break">("study");
  const [left, setLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sound, setSound] = useState(true);
  const tick = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    tick.current = window.setInterval(() => {
      setLeft((l) => Math.max(0, l - 1));
    }, 1000);
    return () => window.clearInterval(tick.current!);
  }, [running]);

  // Phase transition when the timer hits zero
  useEffect(() => {
    if (left !== 0) return;
    setRunning(false);
    if (sound) {
      try {
        const ctx = new AudioContext();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = 880; g.gain.value = 0.06;
        o.start(); o.stop(ctx.currentTime + 0.5);
      } catch { /* audio unavailable */ }
    }
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(phase === "study" ? "Pomodoro complete! Take a break 🍅" : "Break over — back to focus! 💪");
    }
    if (phase === "study") onLog(study);
    const nextLen = (phase === "study" ? brk : study) * 60;
    setPhase(phase === "study" ? "break" : "study");
    setLeft(nextLen);
  }, [left]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = (phase === "study" ? study : brk) * 60;
  const pct = total ? ((total - left) / total) * 100 : 0;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div className="card text-center">
      <h2 className="font-bold text-sm inline-flex items-center gap-2"><Timer className="w-4 h-4 text-teal" /> Pomodoro</h2>
      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-secondary">
        <label>Study <input type="number" min={5} max={90} className="field !w-16 !py-1 text-center" value={study} onChange={(e) => setStudy(Math.max(5, Number(e.target.value) || 25))} /></label>
        <label>Break <input type="number" min={1} max={30} className="field !w-14 !py-1 text-center" value={brk} onChange={(e) => setBrk(Math.max(1, Number(e.target.value) || 5))} /></label>
      </div>
      <div className="relative w-40 h-40 mx-auto mt-4">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(148,163,184,.15)" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="44" fill="none"
            stroke={phase === "study" ? "#14b8a6" : "#22d3ee"} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 44}
            strokeDashoffset={2 * Math.PI * 44 * (1 - pct / 100)}
            style={{ transition: "stroke-dashoffset .5s linear" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div>
            <p className={`text-3xl font-extrabold font-mono ${running ? "" : "text-secondary"}`}>{mm}:{ss}</p>
            <p className="text-[10px] uppercase tracking-widest text-secondary mt-1">{phase === "study" ? "Focus" : "Break"}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 mt-4">
        <button onClick={() => setRunning((r) => !r)} className="btn-primary !p-2.5" aria-label={running ? "Pause" : "Start"}>
          {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button onClick={() => { setRunning(false); setLeft(phase === "study" ? study * 60 : brk * 60); }} className="btn-ghost !p-2.5" aria-label="Reset">
          <RotateCcw className="w-4 h-4" />
        </button>
        <button onClick={() => setSound((s) => !s)} className={`pill !px-2.5 ${sound ? "!text-teal !border-teal/50" : ""}`} title="Completion sound + browser notification">
          <Bell className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-[11px] text-secondary mt-3">Completed focus sessions feed your dashboard analytics automatically.</p>
    </div>
  );
}

/* ---------------- Attendance calculator ---------------- */
function Attendance() {
  const [attended, setAttended] = useState(30);
  const [total, setTotal] = useState(40);
  const [target, setTarget] = useState(75);

  const pct = total > 0 ? (attended / total) * 100 : 0;
  // with x future classes all attended: (attended + x) / (total + x) >= target
  const need = (() => {
    if (pct >= target) return null;
    const denom = attended / target - total;
    return denom > 0 ? Math.ceil(denom) : null;
  })();
  // with y future bunks: keep (attended)/(total+y) >= target
  const canSkip = pct >= target ? Math.floor(attended / (target / 100) - total) : 0;

  return (
    <div className="card">
      <h2 className="font-bold text-sm inline-flex items-center gap-2"><CalendarX2 className="w-4 h-4 text-cyan" /> Attendance calculator</h2>
      <div className="grid grid-cols-3 gap-2 mt-3">
        <label className="text-xs text-secondary">Attended<input type="number" min={0} className="field mt-1 !py-1.5" value={attended} onChange={(e) => setAttended(Math.max(0, Number(e.target.value) || 0))} /></label>
        <label className="text-xs text-secondary">Total classes<input type="number" min={1} className="field mt-1 !py-1.5" value={total} onChange={(e) => setTotal(Math.max(1, Number(e.target.value) || 1))} /></label>
        <label className="text-xs text-secondary">Target %<input type="number" min={1} max={100} className="field mt-1 !py-1.5" value={target} onChange={(e) => setTarget(Math.min(100, Math.max(1, Number(e.target.value) || 75)))} /></label>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className={`text-3xl font-extrabold ${pct >= target ? "text-success" : "text-rose-400"}`}>{pct.toFixed(1)}%</div>
        <div className="text-xs text-secondary leading-relaxed flex-1">
          {pct >= target
            ? canSkip > 0
              ? `You're on target. You can miss up to ~${canSkip} more class(es) and stay ≥ ${target}%.`
              : "You're on target."
            : `Attend the next ~${need ?? "—"} consecutive class(es) to reach ${target}% (assumes all future classes attended).`}
        </div>
      </div>
      <p className="text-[11px] text-secondary mt-3">Formula: attended ÷ total × 100. Projection assumes you attend every future class.</p>
    </div>
  );
}

/* ---------------- CGPA calculator ---------------- */
function CGPA() {
  const scale = String(["10-point", "4-point"][0]);
  const [courses, setCourses] = useState([{ g: "9", c: "4" }, { g: "8", c: "3" }]);
  const result = useMemo(() => {
    const tc = courses.reduce((a, x) => a + (Number(x.c) || 0), 0);
    if (!tc) return null;
    const weighted = courses.reduce((a, x) => a + (Number(x.g) || 0) * (Number(x.c) || 0), 0);
    return (weighted / tc).toFixed(2);
  }, [courses]);

  return (
    <div className="card">
      <h2 className="font-bold text-sm">CGPA / SGPA calculator <span className="text-secondary font-medium">({scale})</span></h2>
      <div className="space-y-2 mt-3">
        {courses.map((c, i) => (
          <div key={i} className="grid grid-cols-2 gap-2">
            <input type="number" step="0.1" className="field !py-1.5" placeholder="Grade points" value={c.g} onChange={(e) => setCourses((cs) => cs.map((x, j) => (i === j ? { ...x, g: e.target.value } : x)))} aria-label={`Course ${i + 1} grade`} />
            <input type="number" className="field !py-1.5" placeholder="Credits" value={c.c} onChange={(e) => setCourses((cs) => cs.map((x, j) => (i === j ? { ...x, c: e.target.value } : x)))} aria-label={`Course ${i + 1} credits`} />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-3">
        <button onClick={() => setCourses((c) => [...c, { g: "", c: "" }])} className="pill">+ course</button>
        <div className="flex items-center gap-3">
          {result && <span className="text-2xl font-extrabold text-teal">{result}</span>}
          <button onClick={() => setCourses([{ g: "", c: "" }])} className="pill">Reset</button>
        </div>
      </div>
      <p className="text-[11px] text-secondary mt-2">Weighted average: Σ(grade × credits) ÷ Σ(credits). Enter per-course grade points on your institute's scale.</p>
    </div>
  );
}

/* ---------------- Daily challenge + checklist ---------------- */
const CHALLENGES = [
  "Solve 2 coding exercises on arrays",
  "Teach one concept you learned today to an imaginary friend",
  "Quiz yourself: 5 questions on yesterday's weakest topic",
  "Write a 5-line summary of today's hardest lecture",
  "Complete one Pomodoro before lunch",
];

export default function Productivity() {
  const { events, logEvent, getVal, setVal } = useStore();
  const [checklist, setChecklist] = useState<string>(() => getVal("dailyChecklist", CHALLENGES[new Date().getDate() % CHALLENGES.length]));
  const [input, setInput] = useState("");

  const pomodoroCount = events.filter((e) => e.kind === "pomodoro").length;
  const todayPomodoros = events.filter((e) => e.kind === "pomodoro" && new Date(e.at).toDateString() === new Date().toDateString()).length;
  const todayMinutes = events.filter((e) => (e.kind === "pomodoro" || e.kind === "session") && new Date(e.at).toDateString() === new Date().toDateString()).reduce((a, e) => a + (e.minutes ?? 0), 0);

  const tasks = getVal<{ note: string; done: boolean; at: number }[]>("tasks", []);
  const toggleTask = (i: number) => {
    const next = tasks.map((t, j) => (i === j ? { ...t, done: !t.done } : t));
    setVal("tasks", next);
    if (!tasks[i].done) logEvent("task", `Task completed: ${tasks[i].note.slice(0, 40)}`);
  };
  const addTask = () => {
    if (input.trim().length < 2) return;
    setVal("tasks", [...tasks, { note: input.trim(), done: false, at: Date.now() }]);
    setInput("");
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      // request lazily on user gesture
      document.addEventListener("click", () => { void Notification.requestPermission(); }, { once: true });
    }
  }, []);

  return (
    <div>
      <PageHeader icon={Timer} title="Productivity Core" subtitle="Focus timer, calculators, daily challenges and a personal checklist." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="Total focus sessions" value={pomodoroCount} color="#14b8a6" />
        <StatCard label="Today's sessions" value={todayPomodoros} color="#22d3ee" />
        <StatCard label="Today's focus" value={`${todayMinutes} min`} color="#22c55e" />
        <StatCard label="Checklist" value={`${tasks.filter((t) => t.done).length}/${tasks.length}`} color="#8b5cf6" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Pomodoro onLog={(m) => logEvent("pomodoro", `${m}-minute focus session`, m)} />
        <div className="space-y-4">
          <Attendance />
          <CGPA />
        </div>

        <div className="card">
          <h2 className="font-bold text-sm inline-flex items-center gap-2"><Sparkles className="w-4 h-4 text-violet" /> Daily challenge</h2>
          <p className="text-sm mt-3 leading-relaxed">🎯 {checklist}</p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => { logEvent("challenge", `Daily challenge completed: ${checklist.slice(0, 40)}`); setChecklist(CHALLENGES[(CHALLENGES.indexOf(checklist) + 1) % CHALLENGES.length]); }}
              className="btn-primary text-sm"
            >Mark done → next challenge</button>
          </div>
          <p className="text-[11px] text-secondary mt-2">Streaks on the Overview page count any tracked activity today.</p>
        </div>

        <div className="card">
          <h2 className="font-bold text-sm inline-flex items-center gap-2"><ListTodo className="w-4 h-4 text-teal" /> Task checklist</h2>
          {tasks.length === 0 ? (
            <EmptyState title="No tasks yet" hint="Add today's goals below — completing one plays a small celebration on your dashboard." />
          ) : (
            <div className="mt-3 space-y-1.5">
              {tasks.map((t, i) => (
                <div key={i} className={`flex items-center gap-2.5 bg-white/5 rounded-lg px-3 py-2 ${t.done ? "opacity-60" : ""}`}>
                  <button onClick={() => toggleTask(i)} aria-label={t.done ? "Mark incomplete" : "Mark complete"}>
                    <CheckCircle2 className={`w-4.5 h-4.5 transition ${t.done ? "text-success" : "text-muted"}`} />
                  </button>
                  <span className={`text-sm ${t.done ? "line-through" : ""}`}>{t.note}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 mt-3">
            <input className="field" placeholder="Add a task for today…" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} />
            <button className="btn-primary !px-4 text-sm" onClick={addTask}>Add</button>
          </div>
        </div>
      </div>
    </div>
  );
}
