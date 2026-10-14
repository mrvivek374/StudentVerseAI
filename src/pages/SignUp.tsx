import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useStore } from "../store";

export default function SignUp() {
  const { signUp, signIn } = useStore();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Enter a valid email address.");
    if (password.length < 4) return setError("Password must be at least 4 characters.");
    const err = signUp(name.trim(), email.trim(), password);
    if (err) return setError(err);
    const signInErr = signIn(email.trim(), password);
    if (signInErr) return setError(signInErr);
    // remember the display name the student chose
    localStorage.setItem(`sv:u:${email.trim().toLowerCase()}profileName`, name.trim());
    nav("/app");
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
        <h1 className="text-center font-bold mt-5 text-lg">Create your universe</h1>
        <p className="text-center text-sm text-secondary mt-1">
          Use your personal email — the account lives in this browser (demo build, no server yet).
          Or just <Link to="/signin" className="text-cyan font-semibold hover:underline">sign in directly</Link> with your email: first sign-in auto-creates the account.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input className="field" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="field" placeholder="Personal email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="field" placeholder="Password (min 4 chars)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button className="btn-primary w-full justify-center">Create account</button>
        </form>
        <p className="text-sm text-secondary text-center mt-4">
          Have an account? <Link to="/signin" className="text-cyan font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
