import React, { useState } from "react";
import { Settings as SettingsIcon, Trash2, Save, Bell } from "lucide-react";
import { PageHeader } from "../../components/ui";
import { useStore } from "../../store";

export default function SettingsPage() {
  const { prefs, savePrefs, user, signOut, getVal, setVal } = useStore();
  const [form, setForm] = useState({
    name: prefs?.name ?? "",
    academicLevel: prefs?.academicLevel ?? "Undergraduate",
    field: prefs?.field ?? "",
    careerInterests: prefs?.careerInterests ?? "",
    skillLevel: prefs?.skillLevel ?? "Beginner",
    learningStyle: prefs?.learningStyle ?? "Practice-first",
    studyHours: prefs?.studyHours ?? 10,
  });
  const [notif, setNotif] = useState({ pomodoroDone: true, dailyReminder: false, opportunityDeadline: true });
  const [saved, setSaved] = useState(false);
  const [wiped, setWiped] = useState(false);

  const edit = (k: keyof typeof form, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <PageHeader icon={SettingsIcon} title="Settings" subtitle="Profile, personalization preferences, notifications and data controls." />

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-bold text-sm mb-1">Account</h2>
          <p className="text-xs text-secondary mb-4">{user?.email} · demo account, stored locally in this browser</p>
          <div className="grid grid-cols-2 gap-2.5">
            <label className="text-xs text-secondary">Name
              <input className="field mt-1" value={form.name} onChange={(e) => edit("name", e.target.value)} />
            </label>
            <label className="text-xs text-secondary">Academic level
              <select className="field mt-1" value={form.academicLevel} onChange={(e) => edit("academicLevel", e.target.value)}>
                {["School", "Pre-university / High school", "Undergraduate", "Postgraduate", "Bootcamp / Self-taught"].map((l) => <option key={l}>{l}</option>)}
              </select>
            </label>
          </div>
          <label className="text-xs text-secondary block mt-2.5">Field of study
            <input className="field mt-1" value={form.field} onChange={(e) => edit("field", e.target.value)} />
          </label>
          <label className="text-xs text-secondary block mt-2.5">Career interests
            <input className="field mt-1" value={form.careerInterests} onChange={(e) => edit("careerInterests", e.target.value)} />
          </label>
          <div className="grid grid-cols-2 gap-2.5 mt-2.5">
            <label className="text-xs text-secondary">Skill level
              <select className="field mt-1" value={form.skillLevel} onChange={(e) => edit("skillLevel", e.target.value)}>
                {["Beginner", "Intermediate", "Advanced"].map((l) => <option key={l}>{l}</option>)}
              </select>
            </label>
            <label className="text-xs text-secondary">Study hours / week
              <input type="number" min={1} max={80} className="field mt-1" value={form.studyHours} onChange={(e) => edit("studyHours", Math.max(1, Number(e.target.value) || 1))} />
            </label>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button
              className="btn-primary text-sm inline-flex items-center gap-1.5"
              onClick={() => { savePrefs({ ...form, department: (form as Record<string, unknown>).department as string } as never); setSaved(true); setTimeout(() => setSaved(false), 1800); }}
            >
              <Save className="w-4 h-4" /> Save preferences
            </button>
            {saved && <span className="text-xs text-success font-semibold">Saved ✓</span>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h2 className="font-bold text-sm mb-3 inline-flex items-center gap-2"><Bell className="w-4 h-4 text-teal" /> Notification preferences</h2>
            {([
              ["pomodoroDone", "Pomodoro completion sound / notification"],
              ["dailyReminder", "Daily learning reminder"],
              ["opportunityDeadline", "Deadline reminders for saved opportunities"],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between py-2">
                <span className="text-sm">{label}</span>
                <button
                  role="switch"
                  aria-checked={notif[key]}
                  onClick={() => setNotif((n) => ({ ...n, [key]: !n[key] }))}
                  className={`w-10 h-5.5 rounded-full relative transition ${notif[key] ? "bg-teal" : "bg-white/15"}`}
                  style={{ height: 22 }}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${notif[key] ? "left-[1.15rem]" : "left-0.5"}`} />
                </button>
              </label>
            ))}
            {!("Notification" in window) && <p className="text-[11px] text-secondary">This browser doesn't support notifications; sounds still work.</p>}
          </div>

          <div className="card !border-rose-500/30">
            <h2 className="font-bold text-sm mb-2 text-rose-400">Data & security</h2>
            <p className="text-xs text-secondary leading-relaxed">
              All data in this demo build lives in your browser's localStorage, scoped per account email. Deleting your
              data is permanent for this browser. When a backend is configured, per-user database isolation and access
              controls (server-side validation, ownership checks) will apply instead.
            </p>
            <button
              className="btn-ghost text-xs mt-3 !border-rose-500/40 text-rose-400 inline-flex items-center gap-1.5"
              onClick={() => {
                if (!user) return;
                const prefix = `sv:u:${user.email}`;
                Object.keys(localStorage).filter((k) => k.startsWith(prefix)).forEach((k) => localStorage.removeItem(k));
                setWiped(true);
                setTimeout(() => window.location.reload(), 800);
              }}
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete my data (this browser)
            </button>
            {wiped && <p className="text-xs text-rose-400 mt-2">Deleted — reloading…</p>}
          </div>

          <div className="card !border-warning/0">
            <h2 className="font-bold text-sm mb-2">Learning preferences → AI usage</h2>
            <p className="text-xs text-secondary leading-relaxed">
              Your preferences ({form.academicLevel}, {form.field || "field unset"}, {form.learningStyle.toLowerCase()} style) are sent as context to the
              AI service ONLY when you use AI features, and only over its configured provider. {`Tracked activity never leaves your device in this build. To exercise deletion: use "Delete my data" above or clear Preferences.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
