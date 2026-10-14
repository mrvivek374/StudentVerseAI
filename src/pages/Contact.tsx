import React, { useState } from "react";
import { Mail, Send, CheckCircle2, AlertTriangle } from "lucide-react";
import { Footer } from "./Landing";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", topic: "Feedback", message: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.name.trim().length < 2) return setError("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError("Please enter a valid email address.");
    if (form.message.trim().length < 20) return setError("Message should be at least 20 characters so we can actually help.");
    setSending(true);
    // Demo build: no email backend is configured — simulate server-side
    // validation success and show a clear, honest message.
    setTimeout(() => {
      setSending(false);
      setSuccess(true);
    }, 700);
  }

  return (
    <div>
      <div className="page-bg" />
      <div className="max-w-3xl mx-auto px-5 py-16">
        <span className="chip">Contact</span>
        <h1 className="h-section mt-4">Get in touch</h1>
        <p className="text-secondary mt-3 max-w-xl">
          Feedback on the platform, bug reports, or collaboration ideas — the form validates on the "server" side of this demo build and responds with a clear result.
        </p>

        <div className="card mt-8 max-w-xl">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-10 h-10 text-success mx-auto" />
              <h2 className="font-bold mt-3">Message received (demo)</h2>
              <p className="text-sm text-secondary mt-1 max-w-sm mx-auto">
                In demo mode nothing is emailed yet — connect an email service on the backend to deliver these messages for real.
              </p>
              <button className="btn-ghost mt-4 text-sm" onClick={() => { setSuccess(false); setForm({ name: "", email: "", topic: "Feedback", message: "" }); }}>
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs text-secondary font-semibold uppercase tracking-wider">Name
                  <input className="field mt-1" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </label>
                <label className="text-xs text-secondary font-semibold uppercase tracking-wider">Email
                  <input className="field mt-1" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                </label>
              </div>
              <label className="text-xs text-secondary font-semibold uppercase tracking-wider block">Topic
                <select className="field mt-1" value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}>
                  {["Feedback", "Bug report", "Feature request", "Collaboration", "Other"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label className="text-xs text-secondary font-semibold uppercase tracking-wider block">Message
                <textarea className="field mt-1 h-32 resize-none" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
              </label>
              {error && (
                <p className="text-sm text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> {error}
                </p>
              )}
              <button className="btn-primary inline-flex items-center gap-2" disabled={sending}>
                <Send className="w-4 h-4" /> {sending ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 flex items-center gap-2 text-sm text-secondary">
          <Mail className="w-4 h-4 text-teal" /> Prefer email? Once the backend is connected, a support address appears here.
        </div>
      </div>
      <Footer />
    </div>
  );
}
