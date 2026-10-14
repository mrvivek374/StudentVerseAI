import React, { useState } from "react";
import { Terminal, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { PageHeader, EmptyState } from "../../components/ui";
import { useStore } from "../../store";

type Exercise = {
  id: string;
  topic: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  prompt: string;
  starter: string;
  tests: { input: string; expected: string }[];
  hint: string;
  solution: string;
};

const EXERCISES: Exercise[] = [
  {
    id: "two-sum",
    topic: "Arrays",
    title: "Two Sum",
    difficulty: "Easy",
    prompt: "Given the numbers string in input (comma-separated) and a target as the last number, return the indices of the two numbers that add up to the target. Input: '2,7,11,15 9' → Expected: '0 1'.",
    starter: "// Parse input: values + target on separate lines\nconst lines = input.trim().split('\\n');\nconst nums = lines[0].split(',').map(Number);\nconst target = Number(lines[1]);\n\n// Return \"i j\"\n",
    tests: [
      { input: "2,7,11,15\n9", expected: "0 1" },
      { input: "3,2,4\n6", expected: "1 2" },
    ],
    hint: "Use a hash map from value → index; check target - x as you iterate.",
    solution: "const map = {};\nfor (let i = 0; i < nums.length; i++) {\n  const need = target - nums[i];\n  if (need in map) return map[need] + ' ' + i;\n  map[nums[i]] = i;\n}",
  },
  {
    id: "reverse-words",
    topic: "Strings",
    title: "Reverse Word Order",
    difficulty: "Easy",
    prompt: "Reverse the order of words in the input sentence, keeping words intact. Input: 'hello student world' → Expected: 'world student hello'.",
    starter: "const words = input.trim().split(/\\s+/);\n// Build the result string\n",
    tests: [
      { input: "hello student world", expected: "world student hello" },
      { input: "a b c d", expected: "d c b a" },
    ],
    hint: "split → reverse → join.",
    solution: "return words.reverse().join(' ');",
  },
  {
    id: "fizzbuzz",
    topic: "Logic",
    title: "FizzBuzz",
    difficulty: "Easy",
    prompt: "From 1 to N (given in input), print numbers — but multiples of 3 → 'Fizz', of 5 → 'Buzz', of both → 'FizzBuzz'. One per line.",
    starter: "const n = Number(input.trim());\nlet out = [];\n",
    tests: [{ input: "15", expected: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz" }],
    hint: "Check divisibility by 15 first.",
    solution: "for (let i = 1; i <= n; i++) out.push(i % 15 === 0 ? 'FizzBuzz' : i % 3 === 0 ? 'Fizz' : i % 5 === 0 ? 'Buzz' : i);\nreturn out.join('\\n');",
  },
  {
    id: "group-anagrams",
    topic: "Hash Maps",
    title: "Group Anagrams",
    difficulty: "Medium",
    prompt: "Input is comma-separated words on one line. Group words that are anagrams; print each group sorted, groups separated by ' | '. Input: 'eat,tea,ate,ten' → Expected: 'eat,tea,ate | ten'.",
    starter: "const words = input.trim().split(',');\n// Group by a canonical form\n",
    tests: [
      { input: "eat,tea,ate,ten", expected: "eat,tea,ate | ten" },
      { input: "cat,act,dog", expected: "cat,act | dog" },
    ],
    hint: "Sort each word's letters to make a map key; preserve insertion order for stable output.",
    solution: "const groups = {};\nfor (const w of words) {\n  const key = [...w].sort().join('');\n  (groups[key] ??= []).push(w);\n}\nreturn Object.values(groups).map(g => [...g].sort().join(',')).join(' | ');",
  },
];
//"fix quote

const TOPICS = ["All", ...new Set(EXERCISES.map((e) => e.topic))];

export default function Coding() {
  const { getVal, setVal, logEvent } = useStore();
  const solved = getVal<string[]>("codingSolved", []);
  const [topic, setTopic] = useState("All");
  const [active, setActive] = useState<Exercise | null>(EXERCISES[0]);
  const [code, setCode] = useState(EXERCISES[0]?.starter ?? "");
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [feedback, setFeedback] = useState<React.ReactNode>(null);

  function select(ex: Exercise) {
    setActive(ex);
    setCode(ex.starter);
    setShowHint(false);
    setShowSolution(false);
    setFeedback(null);
  }

  function run() {
    if (!active) return;
    // Local evaluation: exercises are written so their checks run in the
    // browser (no real sandbox) — labelled honestly as local checks.
    try {
      const wrapped = `"use strict";\nconst input = (typeof __INPUT__ === "undefined" ? "" : __INPUT__);\n${code}\n;return typeof out !== "undefined" && out !== undefined ? String(out) : undefined;`;
      const preserves = active.tests.map((t) => {
        try {
          const f = new Function("__INPUT__", wrapped.replace(/input\b/g, "__INPUT__"));
          const actual = f(t.input);
          if (actual === undefined) throw new Error("No output produced — set the `out` variable before returning.");
          return { ...t, actual };
        } catch (err) {
          return { ...t, actual: `Error: ${(err as Error).message}` };
        }
      });
      const passes = preserves.filter((t) => t.actual.trim?.() === t.expected || String(t.actual) === t.expected);
      const allPass = passes.length === active.tests.length;
      if (allPass && !solved.includes(active.id)) {
        const next = [...solved, active.id];
        setVal("codingSolved", next);
        logEvent("challenge", `Solved exercise: ${active.title}`);
      }
      setFeedback(
        <div>
          {preserves.map((t, i) => (
            <p key={i} className={`text-xs font-mono ${String(t.actual) === t.expected ? "text-success" : "text-rose-400"}`}>
              {String(t.actual) === t.expected ? "PASS" : "FAIL"} · input "{t.input.slice(0, 24)}…" → got "{String(t.actual).slice(0, 40) || "(empty)"}", expected "{t.expected.slice(0, 40)}"
            </p>
          ))}
        </div>
      );
    } catch (err) {
      setFeedback(<p className="text-xs text-rose-400 font-mono">Error: {(err as Error).message}</p>);
    }
  }

  const list = EXERCISES.filter((e) => topic === "All" || e.topic === topic);
  const pct = Math.round((solved.length / EXERCISES.length) * 100);

  return (
    <div>
      <PageHeader icon={Terminal} title="Coding Hub" subtitle="Practice exercises with checks — solved status counts toward your streak." />

      <div className="flex gap-2 mb-4 flex-wrap items-center">
        <span className="text-xs text-secondary mr-1">Progress: {solved.length}/{EXERCISES.length} solved ({pct}%)</span>
        <span className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden max-w-xs">
          <span className="block h-full bg-gradient-to-r from-teal to-cyan transition-all" style={{ width: `${pct}%` }} />
        </span>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-4">
        <div className="card !p-3">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {TOPICS.map((t) => (
              <button key={t} onClick={() => setTopic(t)} className={`pill !px-2.5 !py-1 ${topic === t ? "!border-teal/60 !text-teal !bg-teal/10" : ""}`}>{t}</button>
            ))}
          </div>
          <div className="space-y-1.5">
            {list.map((e) => (
              <button key={e.id} onClick={() => select(e)} className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition ${active?.id === e.id ? "border-teal/60 bg-teal/10" : "border-[var(--bg-card-border)] hover:border-cyan/40"}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-xs">{e.title}</span>
                  {solved.includes(e.id) && <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />}
                </div>
                <span className="text-[10px] text-secondary">{e.topic} · {e.difficulty}</span>
              </button>
            ))}
          </div>
        </div>

        {active ? (
          <div className="card">
            <h2 className="font-bold text-sm">{active.title}</h2>
            <p className="text-sm text-secondary mt-1.5 leading-relaxed">{active.prompt}</p>

            <div className="mt-4 h-64 relative">
              <textarea
                className="field h-full resize-none font-mono !text-xs leading-relaxed"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                aria-label="Code editor"
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button className="btn-primary text-sm" onClick={run}>Run checks</button>
              <button onClick={() => setShowHint((h) => !h)} className="pill inline-flex items-center gap-1.5">
                {showHint ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} {showHint ? "Hide" : "Show"} hint
              </button>
              <button onClick={() => setShowSolution((s) => !s)} className="pill inline-flex items-center gap-1.5">
                {showSolution ? "Hide" : "Show"} solution
              </button>
              <span className="ml-auto text-[11px] text-secondary">Local browser checks — no sandbox execution</span>
            </div>

            {showHint && <p className="text-xs text-cyan mt-2.5">💡 {active.hint}</p>}
            {showSolution && <pre className="text-xs font-mono bg-white/5 border border-[var(--bg-card-border)] rounded-lg p-3 mt-2.5 whitespace-pre-wrap">{active.solution}</pre>}

            {feedback && <div className="mt-3 rounded-lg bg-white/5 border border-[var(--bg-card-border)] p-3">{feedback}</div>}
          </div>
        ) : (
          <div className="card"><EmptyState title="Pick an exercise" /></div>
        )}
      </div>
    </div>
  );
}
