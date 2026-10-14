import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

/**
 * Demo auth + persistence layer.
 *
 * NOTE: This build has no backend/database credentials configured, so accounts
 * and student data live in this browser's localStorage only. Every signed-in
 * user sees a "Demo account — local data" badge in the UI. To go live, wire
 * this module to a real backend (Supabase / Node + DB) — the shapes below are
 * designed to map onto server tables.
 */

export type Profile = {
  name: string;
  email: string;
  academicLevel: string;
  field: string;
  goals: string[];
  careerInterests: string;
  skillLevel: string;
  learningStyle: string;
  studyHours: number;
  onboardingDone: boolean;
};

export type ProgressEvent = {
  kind: "pomodoro" | "quiz" | "task" | "challenge" | "session" | "project" | "roadmap";
  label: string;
  minutes?: number;
  score?: number;
  at: number;
};

export type Val =
  | Profile
  | ProgressEvent
  | { note: string; done: boolean; at: number }
  | Record<string, unknown>;

type User = { id: string; name: string; email: string };

type StoreShape = {
  user: User | null;
  signIn: (email: string, password: string) => string | null;
  signUp: (name: string, email: string, password?: string) => string | null;
  resetPassword: (email: string, newPassword: string) => void;
  signOut: () => void;
  prefs: Profile | null;
  savePrefs: (p: Partial<Profile>) => void;
  getVal: <T>(key: string, fallback: T) => T;
  setVal: (key: string, value: unknown) => void;
  logEvent: (kind: ProgressEvent["kind"], label: string, minutes?: number, score?: number) => void;
  events: ProgressEvent[];
  isDemo: true;
};

const StoreCtx = createContext<StoreShape>(null as unknown as StoreShape);

const lsKey = (suffix: string) => `sv:${suffix}`;
const userPrefix = (email: string) => `sv:u:${email}`;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Hydrate the session synchronously so Protected routes never see a false
  // "signed out" state on first render (which previously bounced /app to /signin).
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(lsKey("session"));
      return saved ? (JSON.parse(saved) as User) : null;
    } catch {
      return null;
    }
  });
  const [version, setVersion] = useState(0);

  const api = useMemo<StoreShape>(() => {
    const prefix = () => (user ? userPrefix(user.email) : "");

    const readVal = (key: string) => {
      try {
        const raw = localStorage.getItem(userPrefix(JSON.parse(localStorage.getItem(lsKey("session")) || "{}").email ?? "") + key);
        return raw ? JSON.parse(raw) : undefined;
      } catch {
        return undefined;
      }
    };

    return {
      user,
      isDemo: true,
      signIn(email, password) {
        const e = email.toLowerCase();
        const stored = localStorage.getItem(lsKey(`pass:${e}`));
        if (!stored) {
          // Demo convenience: first sign-in with any email auto-creates the
          // account so personal emails work immediately (local to this browser).
          localStorage.setItem(lsKey(`pass:${e}`), btoa(password));
          const name = e.split("@")[0];
          localStorage.setItem(userPrefix(e) + "profileName", name);
        } else if (stored !== btoa(password)) {
          return "Incorrect password. Use “Reset it” below if you forgot.";
        }
        const u: User = { id: e, name: e.split("@")[0], email: e };
        const savedName = localStorage.getItem(userPrefix(e) + "profileName");
        if (savedName) u.name = savedName;
        localStorage.setItem(lsKey("session"), JSON.stringify(u));
        setUser(u);
        return null;
      },
      signUp(name, email, password?: string) {
        const e = email.toLowerCase();
        if (localStorage.getItem(lsKey(`pass:${e}`))) return "An account with this email already exists.";
        localStorage.setItem(userPrefix(e) + "profileName", name);
        if (password) localStorage.setItem(lsKey(`pass:${e}`), btoa(password));
        return null;
      },
      /**
       * Demo password recovery: sets/creates the password for this email in
       * this browser. With a real backend this would be an emailed reset link.
       */
      resetPassword(email: string, newPassword: string): void {
        const e = email.toLowerCase();
        localStorage.setItem(lsKey(`pass:${e}`), btoa(newPassword));
        if (!localStorage.getItem(userPrefix(e) + "profileName")) {
          localStorage.setItem(userPrefix(e) + "profileName", e.split("@")[0]);
        }
      },
      signOut() {
        localStorage.removeItem(lsKey("session"));
        setUser(null);
      },
      savePrefs(p) {
        const cur = (readVal("profile") as Profile) || null;
        const next: Profile = { ...{ name: user?.name ?? "", email: user?.email ?? "" }, ...cur, ...p } as Profile;
        localStorage.setItem(prefix() + "profile", JSON.stringify(next));
        setVersion((v) => v + 1);
      },
      getVal<T>(key: string, fallback: T): T {
        const raw = user ? readVal(key) : undefined;
        return raw === undefined ? fallback : (raw as T);
      },
      setVal(key, value) {
        if (user) localStorage.setItem(prefix() + key, JSON.stringify(value));
        setVersion((v) => v + 1);
      },
      logEvent(kind, label, minutes, score) {
        const e: ProgressEvent = { kind, label, minutes, score, at: Date.now() };
        const list = ((user ? readVal("events") : undefined) as ProgressEvent[]) || [];
        list.push(e);
        if (user) localStorage.setItem(prefix() + "events", JSON.stringify(list.slice(-500)));
        setVersion((v) => v + 1);
      },
      events: ((user ? readVal("events") : undefined) as ProgressEvent[]) || [],
      prefs: (user ? (readVal("profile") as Profile) : undefined) || null,
    };
  }, [user, version]);

  return <StoreCtx.Provider value={api}>{children}</StoreCtx.Provider>;
}

export const useStore = () => useContext(StoreCtx);
