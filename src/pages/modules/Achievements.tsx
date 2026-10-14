import React, { useMemo } from "react";
import { Trophy, Lock } from "lucide-react";
import { PageHeader, ProgressRing } from "../../components/ui";
import { useStore } from "../../store";

/** Badges are derived ONLY from real tracked events — no fake history. */
export default function Achievements() {
  const { events, user, getVal } = useStore();

  const pomodoros = events.filter((e) => e.kind === "pomodoro").length;
  const quizzes = events.filter((e) => e.kind === "quiz").length;
  const tasks = events.filter((e) => e.kind === "task").length;
  const challenges = events.filter((e) => e.kind === "challenge").length;
  const codingSolved = (getVal<string[]>("codingSolved", []) || []).length;
  const minutes = events.reduce((a, e) => a + (e.minutes ?? 0), 0);

  const badges = useMemo(
    () => [
      { id: "first-focus", name: "First Focus", desc: "Complete your first Pomodoro", got: pomodoros >= 1, progress: pomodoros / 1 },
      { id: "focus-5", name: "Flow State", desc: "5 Pomodoro sessions", got: pomodoros >= 5, progress: pomodoros / 5 },
      { id: "focus-20", name: "Deep Worker", desc: "20 Pomodoro sessions", got: pomodoros >= 20, progress: pomodoros / 20 },
      { id: "quiz-1", name: "Quiz Rookie", desc: "Finish a quiz", got: quizzes >= 1, progress: quizzes / 1 },
      { id: "quiz-10", name: "Quiz Champion", desc: "Finish 10 quizzes", got: quizzes >= 10, progress: quizzes / 10 },
      { id: "task-10", name: "Checklist Pro", desc: "Complete 10 tasks", got: tasks >= 10, progress: tasks / 10 },
      { id: "challenge-7", name: "Streak Setter", desc: "7 daily challenges", got: challenges >= 7, progress: challenges / 7 },
      { id: "code-3", name: "Code Rookie", desc: "Solve 3 coding exercises", got: codingSolved >= 3, progress: codingSolved / 3 },
      { id: "time-120", name: "Time Keeper", desc: "Focus 120 total minutes", got: minutes >= 120, progress: minutes / 120 },
    ],
    [pomodoros, quizzes, tasks, challenges, codingSolved, minutes]
  );

  const unlocked = badges.filter((b) => b.got).length;

  /** Fair leaderboard: displays YOUR tracked point totals only during demo.
   *  With a backend this ranks real students on activity, not identity data. */
  const myPoints = pomodoros * 10 + quizzes * 15 + tasks * 5 + challenges * 20 + codingSolved * 25;
  const chart = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toDateString();
        return events.filter((e) => new Date(e.at).toDateString() === key).reduce((a, e) => a + (e.minutes ?? 0), 0);
      }).reverse(),
    [events]
  );

  return (
    <div>
      <PageHeader icon={Trophy} title="Achievements" subtitle="Badges and points earned only from your actual activity — nothing simulated." />

      <div className="grid lg:grid-cols-[auto_1fr] gap-6 items-center">
        <div className="card grid place-items-center">
          <ProgressRing value={(unlocked / badges.length) * 100} size={120} stroke={9} label="Badge completion" />
          <p className="text-sm text-secondary mt-2">{unlocked}/{badges.length} badges unlocked</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`rounded-xl p-3.5 border transition ${b.got ? "border-teal/50 bg-teal/10" : "border-[var(--bg-card-border)] bg-white/[0.03] opacity-70"}`}
            >
              <div className="flex items-center gap-2">
                {b.got ? <Trophy className="w-4 h-4 text-teal" /> : <Lock className="w-3.5 h-3.5 text-muted" />}
                <p className={`font-bold text-sm ${b.got ? "text-teal" : "text-secondary"}`}>{b.name}</p>
              </div>
              <p className="text-[11px] text-secondary mt-1">{b.desc}</p>
              {!b.got && (
                <div className="h-1 mt-2 rounded-full bg-white/10 overflow-hidden">
                  <span className="block h-full bg-cyan" style={{ width: `${Math.min(100, b.progress * 100)}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="font-bold text-sm">Leaderboard <span className="text-secondary font-medium">— fair by design</span></h2>
        <p className="text-sm text-secondary mt-2">
          Points are earned from tracked activity only: Pomodoro ×10, quiz ×15, task ×5, challenge ×20, exercise ×25.
        </p>
        <div className="mt-3 bg-white/5 rounded-lg px-3 py-2.5 flex items-center justify-between">
          <span className="text-sm font-semibold">{user?.name ?? "You"} <span className="text-secondary text-xs">(your local demo row)</span></span>
          <span className="text-2xl font-extrabold text-teal">{myPoints} pts</span>
        </div>
        <p className="text-[11px] text-secondary mt-3 leading-relaxed">
          In demo mode your browser is the only "server", so a one-column leaderboard is the honest version. When a
          backend is connected, this ranks genuine activity across students — with fair-play rules (no self-reported hours).
        </p>
      </div>

      <div className="card mt-4">
        <h2 className="font-bold text-sm mb-3">Last 14 days of tracked focus</h2>
        <div className="flex items-end gap-1 h-24">
          {chart.map((m, i) => (
            <div key={i} className="flex-1 rounded-t-md" style={{ height: `${Math.min(100, (m / 120) * 100)}%`, minHeight: 4, background: m ? "linear-gradient(to top, #14b8a6, #22d3ee)" : "rgba(148,163,184,.18)" }} title={`${m} min`} />
          ))}
        </div>
      </div>
    </div>
  );
}
