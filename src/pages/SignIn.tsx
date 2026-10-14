import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, KeyRound } from "lucide-react";
import { useStore } from "../store";

export default function SignIn() {
  const { signIn, resetPassword } = useStore();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [recovering, setRecovering] = useState(false);
  const [newPass, setNewPass] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Enter a valid email address.");
    if (password.length < 4) return setError("Password must be at least 4 characters.");
    const err = signIn(email, password);
    if (err) setError(err);
    else nav("/app");
  }

  function recover(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Enter a valid email address.");
    if (newPass.length < 4) return setError("New password must be at least 4 characters.");
    resetPassword(email, newPass);
    setRecovering(false);
    setNewPass("");
    setNotice("Password set for " + email + " — you can sign in now.");
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 relative py-10">
      <div className="page-bg" />
      <div className="card w-full max-w-sm !p-8">
        <Link to="/" className="flex items-center gap-2 justify-center">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal to-cyan grid place-items-center">
            <Sparkles className="w-4 h-4 text-deepspace" />
          </div>
          <span className="font-extrabold tracking-tight">StudentVerse <span className="gradient-text">AI</span></span>
        </Link>
        <h1 className="text-center font-bold mt-5 text-lg">{recovering ? "Set your password" : "Welcome back"}</h1>
        <p className="text-center text-sm text-secondary mt-1">
          {recovering
            ? "Demo build: this sets your password locally for this browser — with a real backend this would be an emailed reset link."
            : "Sign in with your own email — or create an account in one tap if it's your first visit."}
        </p>

        {recovering ? (
          <form onSubmit={recover} className="mt-6 space-y-3">
            <input className="field" placeholder="Your email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="field" placeholder="New password (min 4 chars)" type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
            {error && <p className="text-sm text-rose-400">{error}</p>}
            {notice && <p className="text-sm text-success">{notice}</p>}
            <button className="btn-primary w-full justify-center">Set password & sign in</button>
            <button type="button" className="btn-ghost w-full justify-center" onClick={() => { setRecovering(false); setError(null); setNotice(null); }}>
              Back to sign in
            </button>
          </form>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-3">
            <input className="field" placeholder="Your email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="field" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <p className="text-sm text-rose-400">{error}</p>}
            {notice && <p className="text-sm text-success">{notice}</p>}
            <button className="btn-primary w-full justify-center">Sign in</button>
          </form>
        )}

        {!recovering && (
          <>
            <p className="text-sm text-secondary text-center mt-3">
              Forgot your password?{" "}
              <button onClick={() => { setRecovering(true); setError(null); setNotice(null); }} className="text-cyan font-semibold hover:underline inline-flex items-center gap-1">
                <KeyRound className="w-3 h-3" /> Reset it
              </button>
            </p>
            <p className="text-sm text-secondary text-center mt-4">
              New here? <Link to="/signup" className="text-cyan font-semibold hover:underline">Create an account</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
