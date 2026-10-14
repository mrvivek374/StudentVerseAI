import React, { useMemo, useState } from "react";
import { CalendarRange, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useStore } from "../../store";
import { PageHeader, EmptyState } from "../../components/ui";

type Session = { id: string; subject: string; day: string; time: string; minutes: number; priority: "High" | "Medium" | "Low"; done: boolean };
type Draft = { subject: string; deadlineDays: number; difficulty: "Easy" | "Medium" | "Hard" };

export default function Planner() {
  const { prefs, getVal, setVal, logEvent } = useStore();
  const [drafts, setDrafts] = useState<Draft[]>([{ subject: "", deadlineDays: 7, difficulty: "Medium" }]);
  const [hoursWeek, setHoursWeek] = useState(prefs?.studyHours ?? 10);
  const [plan, setPlan] = useState<Session[]>(() => getVal<Session[]>("plan", []));

  const persist = (p: Session[]) => {
    setPlan(p);
    setVal("plan", p);
  };
  const updateDraft = (i: number, patch: Partial<Draft>) => setDrafts((d) => d.map((x, j) => (i === j ? { ...x, ...patch } : x)));

  function savePlan() {
    const subjects = drafts.filter((d) => d.subject.trim());
    if (!subjects.length) return;
    const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weight = { Easy: 1, Medium: 1.4, Hard: 1.8 } as const;
    const totalW = subjects.reduce((a, s) => a + weight[s.difficulty], 0);
    const out: Session[] = [];
    let slot = 0;
    const slotsPerDay = hoursWeek / 7 >= 2 ? 2 : 1;
    subjects.forEach((s) => {
      const share = Math.max(1, Math.round((weight[s.difficulty] / totalW) * (hoursWeek * slotsPerDay)));
      for (let i = 0; i < share; i++) {
        const day = DAYS[(slot + i) % 7];
        const startH = 16 + Math.floor(((slot + i) % 3)) * 2;
        out.push({
          id: crypto.randomUUID(),
          subject: s.subject.trim(),
          day,
          time: `${String(startH).padStart(2, "0")}:00`,
          minutes: slotsPerDay === 2 ? 45 : 60,
          priority: s.difficulty === "Hard" ? "High" : s.difficulty === "Medium" ? "Medium" : "Low",
          done: false,
        });
      }
      slot += 3;
    });
    persist(out.sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day)));
    logEvent("session", "Generated a study plan");
  }

  const grouped = useMemo(() => {
    const map = new Map<string, Session[]>();
    plan.forEach((p) => map.set(p.day, [...(map.get(p.day) ?? []), p]));
    return map;
  }, [plan]);

  const byId = (id: string) => plan.find((p) => p.id === id);
  function toggle(id: string) {
    const p = byId(id);
    if (p) {
      persist(plan.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
      if (!p.done) logEvent("task", `Completed study session: ${p.subject}`, p.minutes);
    }
  }
  function remove(id: string) {
    persist(plan.filter((p) => p.id !== id));
  }
  function addSession() {
    persist([...plan, { id: crypto.randomUUID(), subject: "", day: "Mon", time: "17:00", minutes: 45, priority: "Medium", done: false }]);
  }
  function edit(id: string, patch: Partial<Session>) {
    persist(plan.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  const donePct = plan.length ? Math.round((plan.filter((p) => p.done).length / plan.length) * 100) : 0;

  return (
    <div>
      <PageHeader icon={CalendarRange} title="Study Planner" subtitle="Turn subjects, deadlines and available hours into a realistic weekly plan." />

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Generator */}
        <div className="card">
          <h2 className="font-bold text-sm">1 · Subjects & deadlines</h2>
          <div className="space-y-3 mt-3">
            {drafts.map((d, i) => (
              <div key={i} className="grid grid-cols-[1fr_84px_92px] gap-2 items-center">
                <input className="field" placeholder={`Subject ${i + 1} name`} value={d.subject} onChange={(e) => updateDraft(i, { subject: e.target.value })} />
                <select className="field" value={d.difficulty} onChange={(e) => updateDraft(i, { difficulty: e.target.value as Draft["difficulty"] })} aria-label="Difficulty">
                  {["Easy", "Medium", "Hard"].map((x) => <option key={x}>{x}</option>)}
                </select>
                <div className="flex items-center gap-1">
                  <input type="number" min={1} className="field !px-2" value={d.deadlineDays} onChange={(e) => updateDraft(i, { deadlineDays: Number(e.target.value) || 1 })} aria-label="Days until deadline" />
                  <span className="text-[11px] text-secondary whitespace-nowrap">days</span>
                </div>
              </div>
            ))}
            <button onClick={() => setDrafts((d) => [...d, { subject: "", deadlineDays: 7, difficulty: "Medium" }])} className="pill inline-flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add subject
            </button>
          </div>

          <div className="mt-5">
            <h2 className="font-bold text-sm text-secondary">2 · Available hours / week: <span className="text-teal">{hoursWeek}h</span></h2>
            <input type="range" min={2} max={40} value={hoursWeek} onChange={(e) => setHoursWeek(Number(e.target.value))} className="w-full mt-2 accent-teal" aria-label="Hours per week" />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-secondary">
              Formula: harder subjects get a larger share of your hours (Easy ×1, Medium ×1.4, Hard ×1.8).
            </p>
            <button className="btn-primary text-sm" onClick={savePlan}>Generate plan</button>
          </div>
        </div>

        {/* Plan output */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm">Your week</h2>
            <span className="text-xs text-secondary">{donePct}% completed</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-teal to-cyan transition-all" style={{ width: `${donePct}%` }} />
          </div>

          {plan.length === 0 ? (
            <EmptyState title="No plan yet" hint="Add subjects on the left and generate a schedule — it stays editable right here." />
          ) : (
            <div className="mt-4 space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
              {[..."MTWTFSS"].slice(0, 7).map(() => null)}
              {[...grouped.entries()].map(([day, items]) => (
                <div key={day}>
                  <p className="text-xs font-bold text-cyan uppercase tracking-wider mb-1.5">{day}</p>
                  {items.map((p) => (
                    <div key={p.id} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 mb-1.5">
                      <button onClick={() => toggle(p.id)} aria-label={p.done ? "Mark incomplete" : "Mark complete"}>
                        <CheckCircle2 className={`w-4.5 h-4.5 transition ${p.done ? "text-success" : "text-muted"}`} />
                      </button>
                      <input className="bg-transparent text-sm flex-1 min-w-0 outline-none" value={p.subject} onChange={(e) => edit(p.id, { subject: e.target.value })} />
                      <span className="text-[11px] text-secondary whitespace-nowrap">{p.time} · {p.minutes}m</span>
                      <button onClick={() => remove(p.id)} aria-label="Delete session" className="text-muted hover:text-rose-400 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
              <button onClick={addSession} className="pill w-full justify-center inline-flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add session manually
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
