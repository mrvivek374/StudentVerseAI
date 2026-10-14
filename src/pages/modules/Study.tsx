import React, { useEffect, useMemo, useRef, useState } from "react";
import { Send, GraduationCap, MessageSquarePlus, Wand2, ListChecks, Layers, ScrollText, RotateCcw, Wrench } from "lucide-react";
import { PageHeader } from "../../components/ui";
import { MarkdownLite } from "../../components/MarkdownLite";
import { askAI, ChatTurn, refreshAiConfig, aiConfigured } from "../../ai";
import { useStore } from "../../store";

type Turn =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; demo: boolean }
  | { role: "assistant"; failed: true; error: string };

const SUBJECTS = ["Computer Science", "Mathematics", "Physics", "Chemistry", "Biology", "English", "Other"];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
const HISTORY_KEY = "studyHistory";

function isAssistantOk(t: Turn): t is { role: "assistant"; content: string; demo: boolean } {
  return t.role === "assistant" && "content" in t;
}

/** Contextual system prompt: subject/difficulty are guidance, never restrictions. */
function buildSystem(subject: string, difficulty: string): string {
  return (
    `You are StudentVerse AI's study assistant, tutoring a student who selected subject "${subject}" and level "${difficulty}".\n\n` +
    `Rules:\n` +
    `1. Answer the student's ACTUAL question every time. Never return a generic or unrelated explanation.\n` +
    `- Selected subject reflects the course the student is studying — treat it as context, not a filter. If the question clearly belongs to another subject, just answer it well.\n` +
    `- Adapt vocabulary, explanation length, examples and technical depth to the "${difficulty}" level.\n` +
    `- If the question is ambiguous, ask ONE short clarifying question first.\n` +
    `- For programming questions, use the language the student specifies. If none is specified, ask which language they want (or offer a sensible default and say so).\n` +
    `2. Format answers in clean Markdown: short \`##\` headings, \`**bold**\` key terms, numbered explanations, bullet points, fenced \`\`\` code blocks (with language tag) for code, and tables when useful.\n` +
    `- Write math in plain Unicode (x², √2, ×, ±, F = ma) — do NOT use LaTeX $...$ or $$...$$ notation, it will not be typeset here.\n` +
    `3. Never write raw HTML. Never invent facts; say what you are unsure about.\n` +
    `4. Be encouraging and concise; prefer step-by-step structure over a wall of text.`
  );
}

/** Per-action instruction, phrased as a user turn so conversation context stays consistent. */
const MODES: Record<string, (topicHint: string) => string> = {
  simpler: () => `Explain that in even simpler language for a complete beginner. Same topic, no new topic, plain everyday words and one relatable analogy.`,
  example: () => `Give me a fully worked, concrete example of exactly that. Show every step and the final result.`,
  practice: () => `Give me five practice questions about exactly that, each with a short hint — answers collected in a separate section at the end.`,
  steps: () => `Break that down step by step as a numbered procedure, explaining the reasoning at each step.`,
  summarize: () => `Summarize your previous answer in 5–8 concise bullet points, keeping the key terms bold.`,
};

export default function Study() {
  const { logEvent, getVal, setVal } = useStore();
  const [subject, setSubject] = useState("Computer Science");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [turns, setTurns] = useState<Turn[]>(() => {
    const saved = getVal<Turn[]>(HISTORY_KEY, []);
    return Array.isArray(saved) ? saved.slice(-40) : [];
  });
  const [providerReady, setProviderReady] = useState(aiConfigured);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Autos-scroll to the latest answer.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [turns.length, busy]);

  // Ensure the provider-status badge is current when the page opens.
  useEffect(() => {
    void refreshAiConfig().then(setProviderReady);
  }, []);

  /** Persist to the existing per-user local store (same privacy model as the rest of the app). */
  const persist = (next: Turn[]) => {
    setVal(HISTORY_KEY, next.slice(-40));
  };

  function lastAssistantTopic(): string {
    const lastUser = [...turns].reverse().find((t) => t.role === "user");
    return lastUser ? lastUser.content.slice(0, 120) : "the current topic";
  }

  async function send(qRaw?: string, mode?: keyof typeof MODES) {
    const q = (qRaw ?? input).trim();
    if (!q || busy) return;
    if (!mode) setInput("");

    const userTurn: Turn = { role: "user", content: q };
    const historyForModel: ChatTurn[] = turns.filter(isAssistantOk).map((t) =>
      (t.role as "user" | "assistant") === "user" ? { role: "user", content: t.content } : { role: "assistant", content: t.content }
    );

    let nextTurns = [...turns, userTurn];
    setTurns(nextTurns);
    setBusy(true);
    try {
      const res = await askAI([...historyForModel.slice(-10), { role: "user", content: q }], {
        system: buildSystem(subject, difficulty),
        maxTokens: mode === "practice" ? 1200 : 1100,
        temperature: 0.65,
      });

      if (res.ok) {
        nextTurns = [...nextTurns, { role: "assistant", content: res.text, demo: res.demo }];
        logEvent("session", `Studied ${subject}: ${q.slice(0, 60)}`);
      } else {
        nextTurns = [...nextTurns, { role: "assistant", failed: true, error: res.error ?? "The AI service is unavailable." }];
      }
      setTurns(nextTurns);
      persist(nextTurns);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  const providerHint = useMemo(
    () =>
      providerReady
        ? null
        : "No AI provider key is configured on the server yet — you'll see a clear notice instead of a made-up answer until one is set.",
    [providerReady]
  );

  const hasAnswer = turns.some((t) => isAssistantOk(t));

  return (
    <div>
      <PageHeader
        icon={GraduationCap}
        title="AI Study Assistant"
        subtitle="Ask anything — genuine AI answers matched to your actual question and level."
      />

      <div className="card mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Subject (context — questions outside it still get answered)</label>
          <select className="field mt-1" value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Subject">
            {SUBJECTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Difficulty</label>
          <select className="field mt-1" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} aria-label="Difficulty">
            {DIFFICULTIES.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {turns.length > 0 && (
            <button
              onClick={() => {
                setTurns([]);
                persist([]);
              }}
              className="pill"
            >
              Clear chat
            </button>
          )}
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div ref={listRef} className="h-[28rem] overflow-y-auto scrollbar-thin p-4 space-y-3">
          {turns.length === 0 && (
            <div className="text-center py-10 text-secondary text-sm space-y-1">
              <p>
                Try: <span className="text-cyan">"Explain photosynthesis in simple words"</span> ·{" "}
                <span className="text-cyan">"What is binary search? Give a Python program."</span>
              </p>
              <p>
                Or: <span className="text-cyan">"Solve 2x + 5 = 15 step by step."</span>
              </p>
              {providerHint && <p className="text-xs mt-3 max-w-sm mx-auto">{providerHint}</p>}
            </div>
          )}

          {turns.map((t, i) => (
            <div key={i} className={t.role === "user" ? "flex justify-end" : ""}>
              {t.role === "assistant" && "error" in t ? (
                <div className="max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm bg-rose-500/10 border border-rose-400/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-rose-300" />
                    <strong className="text-rose-200">Couldn't get an AI answer</strong>
                  </div>
                  <p className="text-secondary leading-relaxed">{t.error}</p>
                  <button onClick={() => void send(lastAssistantTopic())} className="pill !border-rose-400/40 !text-rose-200">
                    <RotateCcw className="inline w-3 h-3 mr-1" /> Retry
                  </button>
                </div>
              ) : (
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    t.role === "user"
                      ? "bg-teal/20 border border-teal/30 whitespace-pre-wrap"
                      : "bg-white/5 border border-[var(--bg-card-border)]"
                  }`}
                >
                  {t.role === "assistant" && (
                    <div className="mb-1.5 flex justify-end">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${t.demo ? "demo-badge" : "!border-teal/40 !text-teal !bg-teal/10"}`}>
                        {t.demo ? "Demo — template response" : "AI generated"}
                      </span>
                    </div>
                  )}
                  {t.role === "user" ? t.content : <MarkdownLite text={t.content} />}
                </div>
              )}
            </div>
          ))}

          {busy && (
            <div className="flex items-center gap-2 text-sm text-secondary">
              <span className="w-4 h-4 rounded-full border-2 border-teal/30 border-t-teal animate-spin" />
              Working on your answer…
            </div>
          )}
        </div>

        {/* Contextual answer modes — each regenerates from the current conversation. */}
        {hasAnswer && (
          <div className="px-4 pb-2 flex flex-wrap gap-2 border-t border-[var(--bg-card-border)] pt-2.5">
            <button onClick={() => void send(MODES.simpler(lastAssistantTopic()), "simpler")} disabled={busy} className="pill disabled:opacity-40">
              <Wand2 className="inline w-3 h-3 mr-1" /> Simpler explanation
            </button>
            <button onClick={() => void send(MODES.example(lastAssistantTopic()), "example")} disabled={busy} className="pill disabled:opacity-40">
              Worked example
            </button>
            <button onClick={() => void send(MODES.practice(lastAssistantTopic()), "practice")} disabled={busy} className="pill disabled:opacity-40">
              <ListChecks className="inline w-3 h-3 mr-1" /> Practice questions
            </button>
            <button onClick={() => void send(MODES.steps(lastAssistantTopic()), "steps")} disabled={busy} className="pill disabled:opacity-40">
              <Layers className="inline w-3 h-3 mr-1" /> Explain step by step
            </button>
            <button onClick={() => void send(MODES.summarize(lastAssistantTopic()), "summarize")} disabled={busy} className="pill disabled:opacity-40">
              <ScrollText className="inline w-3 h-3 mr-1" /> Summarize
            </button>
          </div>
        )}

        <div className="p-3 border-t border-[var(--bg-card-border)] flex gap-2 items-end">
          <textarea
            ref={inputRef}
            className="field resize-none min-h-[2.75rem] max-h-32"
            style={{ height: input.split("\n").length > 1 ? undefined : "" }}
            placeholder={`Ask a ${subject} question…  (Enter to send, Shift+Enter for a new line)`}
            value={input}
            rows={input.split("\n").length}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            aria-label="Study question"
          />
          <button onClick={() => void send()} disabled={busy || !input.trim()} className="btn-primary !p-2.5 disabled:opacity-40 shrink-0" aria-label="Send">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className={`text-[11px] mt-2 flex items-center gap-1.5 ${providerReady ? "text-teal" : "text-secondary"}`}>
        <MessageSquarePlus className="w-3 h-3" />
        {providerReady
          ? "Connected to a real AI provider — answers are generated from your question and conversation."
          : "Smarter once configured: answers come from a genuine AI model when the server's provider key is set. Demo templates remain available and always labelled."}
      </p>
    </div>
  );
}
