import React, { useState } from "react";
import { BookOpenCheck, Play, RotateCcw, Trophy } from "lucide-react";
import { demoQuiz, aiConfigured } from "../../ai";
import { PageHeader, AIBadge, EmptyState } from "../../components/ui";
import { useStore } from "../../store";

type Q = { question: string; options: string[]; correctIndex: number; explanation: string };
type History = { topic: string; difficulty: string; count: number; score: number; at: number };

export default function Quiz() {
  const { getVal, setVal, logEvent } = useStore();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [count, setCount] = useState(5);
  const [qs, setQs] = useState<Q[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [demo, setDemo] = useState(true);
  const [history, setHistory] = useState<History[]>(() => getVal<History[]>("quizHistory", []));

  async function generate() {
    const t = topic.trim();
    if (t.length < 3) return;
    setBusy(true);
    setSubmitted(false);
    try {
      // Demo build: structured local generator. With an AI key exchange demoQuiz
      // for an askAI() call that parses JSON questions from the provider.
      const generated = demoQuiz(t, Math.min(Math.max(count, 3), 10), difficulty);
      setDemo(true);
      setQs(generated);
      setAnswers(Array(generated.length).fill(null));
    } finally {
      setBusy(false);
    }
  }

  function submit() {
    const score = qs.filter((q, i) => answers[i] === q.correctIndex).length;
    const entry: History = { topic: topic.trim(), difficulty, count: qs.length, score, at: Date.now() };
    const next = [entry, ...history].slice(0, 30);
    setHistory(next);
    setVal("quizHistory", next);
    logEvent("quiz", `Quiz: ${topic.trim()} — ${score}/${qs.length}`, undefined, Math.round((score / qs.length) * 100));
    setSubmitted(true);
  }

  const pct = qs.length ? Math.round((qs.filter((q, i) => answers[i] === q.correctIndex).length / qs.length) * 100) : 0;

  return (
    <div>
      <PageHeader icon={BookOpenCheck} title="Quiz Center" subtitle="Generate practice quizzes from any topic — scored, with explanations." />

      <div className="card mb-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Topic</label>
          <input className="field mt-1" placeholder="e.g. OS scheduling, SQL joins, Newton's laws" value={topic} onChange={(e) => setTopic(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Difficulty</label>
          <select className="field mt-1" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            {["Easy", "Medium", "Hard"].map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Questions</label>
          <input type="number" min={3} max={10} className="field mt-1 w-20" value={count} onChange={(e) => setCount(Number(e.target.value) || 5)} />
        </div>
        <button className="btn-primary text-sm" onClick={generate} disabled={busy || topic.trim().length < 3}>
          <Play className="w-4 h-4" /> {busy ? "Generating…" : "Generate"}
        </button>
      </div>

      {!aiConfigured && qs.length > 0 && <div className="mb-3"><AIBadge demo /></div>}

      {qs.length === 0 ? (
        <div className="card"><EmptyState title="No quiz yet" hint="Enter a topic above and generate your first practice set." /></div>
      ) : (
        <div className="space-y-3">
          {qs.map((q, i) => (
            <div key={i} className="card !p-4">
              <p className="font-semibold text-sm">{i + 1}. {q.question}</p>
              <div className="mt-3 grid sm:grid-cols-2 gap-2">
                {q.options.map((opt, j) => {
                  const chosen = answers[i] === j;
                  const correct = submitted && j === q.correctIndex;
                  const wrong = submitted && chosen && j !== q.correctIndex;
                  return (
                    <button
                      key={j}
                      onClick={() => !submitted && setAnswers((a) => a.map((x, k) => (k === i ? j : x)))}
                      className={`text-left text-sm px-3 py-2 rounded-lg border transition ${
                        correct ? "border-success/60 bg-success/10"
                        : wrong ? "border-rose-500/60 bg-rose-500/10"
                        : chosen ? "border-teal/60 bg-teal/10"
                        : "border-[var(--bg-card-border)] hover:border-cyan/40"
                      }`}
                    >
                      <span className="font-bold mr-2">{String.fromCharCode(65 + j)}.</span>{opt}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <p className="text-xs text-secondary mt-2.5 leading-relaxed"><span className="text-teal font-semibold">Why:</span> {q.explanation}</p>
              )}
            </div>
          ))}

          <div className="flex items-center gap-3">
            {!submitted ? (
              <button className="btn-primary" onClick={submit} disabled={answers.some((a) => a === null)}>
                {answers.some((a) => a === null) ? "Answer all questions" : `Submit quiz (${answers.filter((a, i) => a === qs[i].correctIndex).length}/${qs.length})`}
              </button>
            ) : (
              <button className="btn-primary" onClick={() => { setQs([]); setAnswers([]); }}>
                <RotateCcw className="w-4 h-4" /> New quiz
              </button>
            )}
            {submitted && (
              <span className="chip !border-success/40 !text-success !bg-success/10"><Trophy className="w-3 h-3" /> Score: {pct}%</span>
            )}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="card mt-5">
          <h2 className="font-bold text-sm mb-3">Quiz history <span className="text-secondary font-medium">(saved locally)</span></h2>
          <div className="space-y-1.5 text-sm">
            {history.slice(0, 8).map((h, i) => (
              <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                <span>{h.topic} <span className="text-secondary text-xs">· {h.difficulty}</span></span>
                <span className={`font-bold ${h.score / h.count >= 0.7 ? "text-success" : h.score / h.count >= 0.4 ? "text-[#facc15]" : "text-rose-400"}`}>{h.score}/{h.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
