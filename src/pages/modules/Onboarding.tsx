import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useStore } from "../../store";
import { Sparkles } from "lucide-react";

const LEVELS = ["School", "Pre-university / High school", "Undergraduate", "Postgraduate", "Bootcamp / Self-taught"];
const GOALS = ["Improve grades", "Learn a new skill", "Build projects", "Get an internship", "Prepare for placements", "Personal growth"];
const STYLES = ["Visual", "Reading/Writing", "Practice-first", "Video", "Group study"];

export default function Onboarding() {
  const { user, savePrefs, logEvent } = useStore();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: user?.name ?? "",
    academicLevel: "Undergraduate",
    field: "",
    goals: [] as string[],
    careerInterests: "",
    skillLevel: "Beginner",
    learningStyle: "Practice-first",
    studyHours: 10,
  });

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));
  const toggleGoal = (g: string) =>
    setForm((f) => ({ ...f, goals: f.goals.includes(g) ? f.goals.filter((x) => x !== g) : [...f.goals, g] }));

  const finish = () => {
    savePrefs({ ...form, onboardingDone: true });
    logEvent("session", "Completed onboarding");
    nav("/app");
  };

  const steps = ["About you", "Goals", "Learning preferences"];

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 justify-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal to-cyan grid place-items-center">
            <Sparkles className="w-4 h-4 text-deepspace" />
          </div>
          <span className="font-extrabold tracking-tight text-lg">StudentVerse</span>
        </div>
        <p className="text-center text-secondary text-sm mt-2">Let's personalize your universe — this shapes your planner, recommendations and career tools.</p>

        {/* Progress */}
        <div className="flex gap-2 justify-center mt-6">
          {steps.map((s, i) => (
            <div key={s} className={`h-1.5 rounded-full transition-all ${i <= step ? "w-10 bg-teal" : "w-6 bg-white/10"}`} />
          ))}
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="card mt-6 !p-6">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-bold">About you</h2>
              <input className="field" placeholder="What should we call you?" value={form.name} onChange={(e) => set({ name: e.target.value })} />
              <div>
                <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Academic level</label>
                <select className="field mt-1.5" value={form.academicLevel} onChange={(e) => set({ academicLevel: e.target.value })}>
                  {LEVELS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Course / field of study</label>
                <input className="field mt-1.5" placeholder="e.g. Computer Science, Mechanical, BBA" value={form.field} onChange={(e) => set({ field: e.target.value })} />
              </div>
              <button className="btn-primary w-full justify-center" onClick={() => setStep(1)}>Continue</button>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-bold">Your main learning goals</h2>
              <div className="flex flex-wrap gap-2">
                {GOALS.map((g) => (
                  <button key={g} onClick={() => toggleGoal(g)} className={`pill ${form.goals.includes(g) ? "!border-teal/60 !text-teal !bg-teal/10" : ""}`}>
                    {g}
                  </button>
                ))}
              </div>
              <input className="field" placeholder="Career interests (e.g. frontend developer, data analyst)" value={form.careerInterests} onChange={(e) => set({ careerInterests: e.target.value })} />
              <div className="flex gap-3">
                <button className="btn-ghost flex-1 justify-center" onClick={() => setStep(0)}>Back</button>
                <button className="btn-primary flex-1 justify-center" onClick={() => setStep(2)}>Continue</button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-bold">Learning preferences</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Skill level</label>
                  <select className="field mt-1.5" value={form.skillLevel} onChange={(e) => set({ skillLevel: e.target.value })}>
                    {["Beginner", "Intermediate", "Advanced"].map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Study availability (h/week)</label>
                  <input type="number" min={1} max={80} className="field mt-1.5" value={form.studyHours} onChange={(e) => set({ studyHours: Math.max(1, Number(e.target.value) || 1) })} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Preferred learning style</label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {STYLES.map((s) => (
                    <button key={s} onClick={() => set({ learningStyle: s })} className={`pill ${form.learningStyle === s ? "!border-teal/60 !text-teal !bg-teal/10" : ""}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button className="btn-ghost flex-1 justify-center" onClick={() => setStep(1)}>Back</button>
                <button className="btn-primary flex-1 justify-center" onClick={finish}>Enter my universe ✦</button>
              </div>
              <p className="text-[11px] text-secondary">
                Preferences are stored locally in this browser. You can change or delete them anytime in Settings.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
