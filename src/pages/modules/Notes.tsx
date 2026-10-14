import React, { useState } from "react";
import { FileText, Upload, Copy, Download, ArrowRight } from "lucide-react";
import { demoSummarize, aiConfigured } from "../../ai";
import { PageHeader, AIBadge } from "../../components/ui";
import { useStore } from "../../store";

export default function Notes() {
  const { logEvent } = useStore();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ summary: string; keyPoints: string[]; definitions: string[]; demo: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setError("File too large (max 5 MB).");
    if (file.name.toLowerCase().endsWith(".pdf")) {
      // Extraction without an SDK: attempt naive PDF text pull; degrade gracefully.
      try {
        const buf = await file.arrayBuffer();
        const raw = new TextDecoder("latin1").decode(buf);
        const chunks = [...raw.matchAll(/\(((?:\\.|[^\\()])*)\)/g)].map((m) => m[1].replace(/\\(\(|\))/g, "$1").replace(/\\[rn]/g, " ")).join(" ");
        if (chunks.trim().length < 40) {
          setError("Couldn't extract readable text from this PDF (likely scanned or image-only). Paste the text manually instead.");
          return;
        }
        setText(chunks.slice(0, 40000));
      } catch {
        setError("Failed to read the PDF. Paste the text manually instead.");
      }
    } else if (file.name.toLowerCase().match(/\.(txt|md|csv|html?)$/)) {
      setText(await file.text());
    } else {
      setError("Unsupported file type. Use PDF, TXT, or paste the content directly.");
    }
  }

  async function summarize() {
    if (text.trim().length < 80) return setError("Add at least ~80 characters of content to summarize.");
    setError(null);
    setBusy(true);
    try {
      if (aiConfigured) {
        const res = await fetch("not-used").catch(() => null); // demo build keeps extractive summarizer
        void res;
      }
      const r = demoSummarize(text.slice(0, 20000));
      setResult({ ...r, demo: true });
      logEvent("session", "Summarized notes");
    } finally {
      setBusy(false);
    }
  }

  function copy() {
    if (!result) return;
    const all = `SUMMARY\n${result.summary}\n\nKEY POINTS\n${result.keyPoints.map((k) => "• " + k).join("\n")}\n\nDEFINITIONS\n${result.definitions.map((d) => "• " + d).join("\n")}`;
    navigator.clipboard.writeText(all).catch(() => setError("Clipboard unavailable in this browser context."));
  }

  function download() {
    if (!result) return;
    const blob = new Blob([`SUMMARY\n${result.summary}\n\nKEY POINTS\n${result.keyPoints.map((k) => "• " + k).join("\n")}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "studentverse-summary.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PageHeader icon={FileText} title="Notes & PDF Summarizer" subtitle="Extract summaries, key points and definitions from pasted text or documents." />

      {error && <p className="text-sm text-rose-400 mb-3">{error}</p>}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm">Source text</h2>
            <label className="pill inline-flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3 h-3" /> Upload
              <input type="hidden" />
              <input type="file" accept=".pdf,.txt,.md,.csv,.htm,.html" onChange={onFile} className="sr-only" />
            </label>
          </div>
          <textarea
            className="field mt-2.5 h-64 resize-none font-mono !text-xs leading-relaxed"
            placeholder="Paste lecture notes, an article, or PDF text here…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-[11px] text-secondary">{text.length.toLocaleString()} chars</span>
            <button className="btn-primary text-sm inline-flex items-center gap-1.5" onClick={summarize} disabled={busy}>
              {busy ? <span className="w-4 h-4 border-2 border-black/30 border-t-black animate-spin rounded-full" /> : <ArrowRight className="w-4 h-4" />} Summarize
            </button>
          </div>
          <p className="text-[11px] text-secondary mt-2">Demo mode uses extractive summarization (priority-weighted sentence ranking). Files are processed in-browser only — nothing is uploaded.</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm">Output</h2>
            {result && <AIBadge demo={result.demo} />}
          </div>
          {!result ? (
            <p className="text-sm text-secondary mt-4">Your summary, key points and definitions will appear here.</p>
          ) : (
            <div className="mt-3 space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal">Summary</h3>
                <p className="text-sm mt-1.5 leading-relaxed">{result.summary}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan">Key points</h3>
                <ul className="text-sm mt-1.5 space-y-1.5 list-disc pl-4">
                  {result.keyPoints.map((k, i) => <li key={i} className="leading-relaxed">{k}</li>)}
                </ul>
              </div>
              {result.definitions.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-violet">Definitions found</h3>
                  <ul className="text-sm mt-1.5 space-y-1.5 list-disc pl-4">
                    {result.definitions.map((d, i) => <li key={i} className="leading-relaxed">{d}</li>)}
                  </ul>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={copy} className="btn-ghost text-xs inline-flex items-center gap-1.5"><Copy className="w-3.5 h-3.5" /> Copy notes</button>
                <button onClick={download} className="btn-ghost text-xs inline-flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Export .txt</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
