import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send, Sparkles } from "lucide-react";
import { askAI, ChatTurn, aiConfigured } from "../ai";
import { useStore } from "../store";

type Msg = { role: "user" | "assistant"; content: string; demo?: boolean; error?: string };

const SUGGESTIONS = [
  "Explain this topic simply",
  "Create my study plan",
  "Help me build a project",
  "Improve my resume",
  "Find suitable internships",
  "Prepare me for an interview",
];

export default function Copilot() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm **StudentVerse Copilot** — your AI companion across the universe.\n\nAsk me anything, or tap a suggestion below to get started." +
        (aiConfigured ? "" : "\n\n_Demo mode active: no AI provider key is configured, so replies are labelled local templates._"),
    },
  ]);
  const user = useStore();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    setInput("");
    const history: ChatTurn[] = [...msgs.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })), { role: "user", content }];
    setMsgs((m) => [...m, { role: "user", content }]);
    setBusy(true);
    try {
      const prefsSummary = user.prefs
        ? `Student context: level=${user.prefs.academicLevel || "-"}, field=${user.prefs.field || "-"}, goals=${(user.prefs.goals || []).join(", ") || "-"}, weekly hours=${user.prefs.studyHours || "-"}.`
        : "";
      const system =
        "You are StudentVerse Copilot, a friendly guide inside a student platform. Keep answers concise and structured. Use bullet points. Answer the user's actual question. When asked about the platform, list relevant modules." +
        (prefsSummary ? " " + prefsSummary : "");
      const res = await askAI(history, { system, maxTokens: 700 });
      if (res.ok) {
        setMsgs((m) => [...m, { role: "assistant", content: res.text, demo: res.demo }]);
      } else {
        setMsgs((m) => [...m, { role: "assistant", content: "", error: res.error ?? "The AI service is unavailable." }]);
      }
    } finally {
      setBusy(false);
    }
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <>
      {/* Holographic orb launcher */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-5 right-5 z-[60] w-14 h-14 rounded-full grid place-items-center cursor-pointer"
        style={{
          background: "radial-gradient(circle at 35% 30%, #67e8f9, #14b8a6 55%, #0891b2)",
          boxShadow: "0 0 24px rgba(20,184,166,.55), 0 8px 24px rgba(2,8,20,.5)",
        }}
        aria-label={open ? "Close AI Copilot" : "Open AI Copilot"}
      >
        <span className="absolute inset-0 rounded-full border border-cyan/60 animate-[pulse_2.4s_ease-in-out_infinite]" />
        {open ? <X className="w-5 h-5 text-deepspace" /> : <Sparkles className="w-5 h-5 text-deepspace" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-24 right-5 z-[60] w-[min(24rem,calc(100vw-2.5rem))] h-30rem rounded-2xl glass-strong overflow-hidden flex flex-col"
            style={{ height: "30rem" }}
            role="dialog"
            aria-label="StudentVerse Copilot"
          >
            <div className="px-4 py-3 flex items-center gap-2.5 border-b border-[var(--bg-card-border)]">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal to-cyan grid place-items-center">
                <Sparkles className="w-3.5 h-3.5 text-deepspace" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">StudentVerse Copilot</p>
                <p className="text-[10px] text-secondary">{aiConfigured ? "Connected to AI provider" : "Demo mode — local templates"}</p>
              </div>
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto scrollbar-thin px-3.5 py-3 space-y-3">
              {msgs.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                  <div
                    className={`max-w-[88%] rounded-xl px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap ${
                      m.error
                        ? "bg-rose-500/10 border border-rose-400/30"
                        : m.role === "user"
                        ? "bg-teal/20 border border-teal/30"
                        : "bg-white/5 border border-[var(--bg-card-border)]"
                    }`}
                  >
                    {m.error
                      ? `⚠ ${m.error}`
                      : m.content}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex gap-1.5 px-1">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="w-1.5 h-1.5 rounded-full bg-cyan animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              )}
            </div>

            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.slice(0, 4).map((s) => (
                <button
                  key={s}
                  onClick={() => void send(s)}
                  className="text-[10.5px] px-2 py-1 rounded-full border border-[var(--bg-card-border)] text-secondary hover:text-cyan hover:border-cyan/40 transition"
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-[var(--bg-card-border)] flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                placeholder="Ask Copilot anything…"
                className="field !py-2"
              />
              <button onClick={() => void send()} disabled={busy} className="btn-primary !p-2.5 disabled:opacity-50" aria-label="Send">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
