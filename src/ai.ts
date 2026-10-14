/**
 * StudentVerse AI service layer.
 *
 * The frontend never reads provider secrets. Chat requests are proxied to a
 * server-side API endpoint that keeps keys in environment variables and validates
 * every request before forwarding it to the upstream provider.
 *
 * Honesty rule: when the real provider is unavailable, askAI returns `ok: false`
 * with a safe, human-readable error. It never presents a local template as a
 * genuine AI answer — demo templates exist only for modules that explicitly
 * label them (AI Quiz, Projects, Notes).
 */

export let aiConfigured = false;

export async function refreshAiConfig(): Promise<boolean> {
  try {
    const res = await fetch("/api/ai/health", { cache: "no-store" });
    const data = (await res.json().catch(() => ({}))) as { providerConfigured?: boolean };
    aiConfigured = !!data.providerConfigured;
    return aiConfigured;
  } catch {
    aiConfigured = false;
    return false;
  }
}

if (typeof window !== "undefined") {
  void refreshAiConfig();
}

export type ChatTurn = { role: "user" | "assistant" | "system"; content: string };

export type AiResult = { ok: boolean; text: string; demo: boolean; error?: string; retryable?: boolean };

async function readAiSessionToken(): Promise<string | undefined> {
  try {
    const sessionText = localStorage.getItem("sv:session");
    if (!sessionText) return undefined;
    const res = await fetch("/api/session/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-StudentVerse-Session": sessionText,
      },
    });
    if (!res.ok) return undefined;
    const data = (await res.json().catch(() => ({}))) as { token?: string };
    return data.token;
  } catch {
    return undefined;
  }
}

const AI_CLIENT_TIMEOUT_MS = 60_000;

async function postAiChat(body: string): Promise<Response> {
  const token = await readAiSessionToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_CLIENT_TIMEOUT_MS);
  try {
    return await fetch("/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
      body,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function askAI(
  messages: ChatTurn[],
  opts: { system?: string; maxTokens?: number; temperature?: number } = {}
): Promise<AiResult> {
  const cleanedMessages = messages
    .filter((m) => m && typeof m.content === "string")
    .map((m) => ({
      role: m.role === "assistant" || m.role === "user" || m.role === "system" ? m.role : "user",
      content: String(m.content).slice(0, 12000),
    }));

  const requestBody = JSON.stringify({
    model: "server-proxy",
    messages: [
      {
        role: "system" as const,
        content:
          opts.system ??
          "You are StudentVerse Copilot, a friendly AI study companion for university students. Be structured, concise, and encouraging. Always answer the student's actual question. Use markdown formatting (headings, bold, lists, code blocks).",
      },
      ...cleanedMessages,
    ],
    max_tokens: Math.min(Math.max(opts.maxTokens ?? 900, 32), 1800),
    temperature: Math.min(Math.max(opts.temperature ?? 0.7, 0), 1.25),
  });

  try {
    const res = await postAiChat(requestBody);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      const safeError =
        typeof data.error === "string" && data.error.trim()
          ? data.error
          : res.status === 503
            ? "The AI provider key is not configured on the server yet."
            : "The AI service is unavailable right now — please try again.";
      return { ok: false, text: "", demo: false, error: safeError, retryable: true };
    }

    const data = (await res.json().catch(() => ({}))) as { text?: string; demo?: boolean };
    const text = typeof data.text === "string" && data.text.trim() ? data.text : "";
    if (!text) {
      return {
        ok: false,
        text: "",
        demo: false,
        error: "The AI returned an empty response for this question. Try rephrasing it.",
        retryable: true,
      };
    }

    aiConfigured = true;
    return { ok: true, text, demo: !!data.demo };
  } catch {
    return {
      ok: false,
      text: "",
      demo: false,
      error: "Could not reach the AI service (network error or timeout). Please try again.",
      retryable: true,
    };
  }
}

/* ------------------------------------------------------------------ */
/* Demo mode: local templates, ALWAYS explicitly labelled as demo.     */
/* Used only by modules that opt in (Quiz, Notes, Projects) when the   */
/* provider is not configured. Never passed off as a real AI answer.   */
/* ------------------------------------------------------------------ */

const strip = (s: string) => s.toLowerCase();

/** Keyword-routed demo templates for the Study-like free-text contexts. */
export function demoTemplate(q: string): string {
  const t = strip(q);
  const topic = q.replace(/^(explain|what is|how to|teach me)\s*/i, "").trim() || "this topic";

  if (/\b(explain|concept|what is|define)\b/.test(t)) {
    return (
      `**Demo mode — local explanation template**\n\nSimple explanation of **${topic}**:\n\n` +
      `1. **In one sentence:** Think of ${topic} as a puzzle piece — it only makes sense when you see where it fits in the bigger picture.\n\n` +
      `2. **Key idea broken down:**\n   - What it is: the core definition and why it exists\n   - How it works: the mechanism, in plain language\n   - When to use it: the situations where it matters\n\n` +
      `3. **A simple analogy:** connect ${topic} to something familiar from daily life.\n\n` +
      `**Practice questions:**\n   - Try explaining ${topic} in your own words without notes\n   - Find one real-world example of ${topic}\n\n` +
      `_(In demo mode this is a template response. Configure an AI provider key to get genuine explanations.)_`
    );
  }
  if (/\b(study plan|timetable|schedule)\b/.test(t)) {
    return (
      `**Demo mode — sample study plan skeleton**\n\n` +
      `1. **Warm-up (10 min)** — review yesterday's notes\n2. **Deep focus block 1 (50 min)** — hardest subject first\n3. **Break (10 min)** — move, hydrate\n4. **Deep focus block 2 (50 min)** — practice problems\n5. **Review (20 min)** — summarize what you learned in 5 bullet points\n\n` +
      `Use the Study Planner tool to save a full week built from your actual subjects, deadlines and available hours.`
    );
  }
  if (/\b(project|hackathon|build)\b/.test(t)) {
    return (
      `**Demo mode — project starter idea**\n\n**Idea: Study Buddy Matcher**\n- **Stack:** React + Node/Express + SQLite\n- **Core features:** match students by course + availability, group chat, shared pomodoro rooms\n- **Stretch goals:** ML-based match scoring, campus map view\n\n` +
      `Run the **Project Studio** to generate a full brief — architecture, folder structure, steps and testing guidance.`
    );
  }
  if (/\b(resume|cv|ats)\b/.test(t)) {
    return (
      `**Demo mode — quick resume tips**\n\n- Lead every bullet with a strong verb and end with a measurable result\n- Mirror keywords from the job description exactly (ATS matching)\n- One page, clean single-column layout, no text in images\n\n` +
      `Use the **Resume Builder** and **ATS Checker** under Career Center for a full guided pass.`
    );
  }
  if (/\b(interview)\b/.test(t)) {
    return (
      `**Demo mode — interview prep starter**\n\nTry answering these out loud:\n1. Tell me about a project you're proud of — what was your specific contribution?\n2. Describe a time you disagreed with a teammate. What happened?\n3. Walk me through how you'd debug a feature that broke in production.\n\n` +
      `Use the **Interview Coach** for role-specific timed practice with feedback.`
    );
  }
  if (/\b(quiz|test)\b/.test(t)) {
    return (
      `**Demo mode — sample questions are available in the Quiz Center.**\n\nGo to Quiz Center, enter a topic (e.g. "OS scheduling algorithms"), pick difficulty and question count, and generate a practice test with scoring and explanations.`
    );
  }
  if (/\b(summar)\b/.test(t)) {
    return (
      `**Demo mode — summarizing is available in the Notes tool.**\n\nUpload or paste text in **Notes & PDF Summarizer** to extract key points, definitions and revision notes. (Demo mode uses extractive summarization — the first sentences of longest paragraphs are prioritized.)`
    );
  }
  return (
    `**Demo mode**\n\nI'm StudentVerse Copilot, running in demo mode without an AI provider key, so my answers are built from local templates.\n\n` +
    `Here's what I can do once an AI key is configured (and roughly what the demo covers today):\n\n- **Explain topics simply** — structure starter is shown for "explain" questions\n- **Create study plans** — skeleton plan for schedule asks\n- **Help build projects** — starter idea for project asks\n- **Improve your resume / prepare interviews** — quick tips\n\nTry asking: *"explain photosynthesis simply"*, *"create my study plan"*, or open any tool from the sidebar.`
  );
}

/** Extractive fallback summarizer used in demo mode by the Notes tool. */
export function demoSummarize(text: string): { summary: string; keyPoints: string[]; definitions: string[] } {
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const sentences = paragraphs
    .join(" ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 40);
  const scored = sentences
    .map((s) => ({ s, score: (s.match(/\b(is|are|means|refers to|defined as|important|because|key|result)\b/gi) || []).length + Math.min(s.length / 120, 3) }))
    .sort((a, b) => b.score - a.score);
  const summary = scored.slice(0, 3).map((x) => x.s).join(" ") || text.slice(0, 300);
  const keyPoints = scored.slice(0, 6).map((x) => x.s.replace(/\s+/g, " ").slice(0, 180));
  const defRe = /\b([A-Z][\w-]{3,})\s+(is|are|refers to|means|can be defined as)\b/g;
  const definitions: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = defRe.exec(text)) && definitions.length < 6) {
    definitions.push(text.slice(m.index, m.index + 160).replace(/\s+/g, " "));
  }
  return { summary, keyPoints, definitions };
}

export function demoQuiz(topic: string, count: number, difficulty: string): Array<{
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}> {
  const safeTopic = topic.trim() || "the topic";
  const topics = [
    `What is the most important concept to understand first when studying ${safeTopic}?`,
    `Which strategy is most effective for learning ${safeTopic} at ${difficulty.toLowerCase()} level?`,
    `How would you explain ${safeTopic} to a beginner in one sentence?`,
  ];

  return Array.from({ length: Math.max(3, Math.min(count, 10)) }, (_, index) => {
    const question = topics[index % topics.length];
    const answerPool = [
      "Focus on the underlying concept before memorizing details.",
      "Practice by applying the idea to a real example or problem.",
      "Map the concept to a simple analogy and review it often.",
      "Use retrieval practice and explain the idea aloud without notes.",
    ];

    const options = [
      answerPool[(index + 0) % answerPool.length],
      answerPool[(index + 1) % answerPool.length],
      answerPool[(index + 2) % answerPool.length],
      answerPool[(index + 3) % answerPool.length],
    ];

    const correctIndex = 0;
    return {
      question,
      options,
      correctIndex,
      explanation: `For ${safeTopic}, the strongest approach is to start with the fundamental idea, then connect it to practice questions or real examples. This helps build long-term understanding at a ${difficulty.toLowerCase()} level.`,
    };
  });
}

export function demoProject(
  domain: string,
  level: string,
  language: string,
  complexity: string
): {
  title: string;
  description: string;
  features: string[];
  architecture: string[];
  steps: string[];
  folder: string;
  testing: string;
  tech: string[];
} {
  const cleanDomain = domain.trim() || "student productivity";
  const title = `${cleanDomain.split(" ").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ")} ${complexity} Studio`;
  const description = `A ${level.toLowerCase()}-level ${complexity.toLowerCase()} project built for ${cleanDomain} using ${language}. The app focuses on user value, simple interaction flows, and a clean technical structure.`;

  return {
    title,
    description,
    features: [
      "Guided onboarding and clear user flows",
      "Data-driven insights and dashboard summaries",
      "Progress tracking with save/export actions",
      "Responsive UI with accessible interactions",
    ],
    architecture: [
      "Client UI built around a single app shell and reusable components",
      "Domain logic isolated behind clear service or state boundaries",
      "Local persistence for demo data and saved project outputs",
      "Simple API layer or static backend proxy for AI-backed expansion",
    ],
    steps: [
      "Define the user problem and the minimum viable workflow",
      "Set up the app skeleton and the main modules",
      "Add state management and persistence for student data",
      "Create the reporting, export and dashboard experiences",
      "Test the flow with realistic usage and polish UX details",
    ],
    folder: "src/\n  app/\n  components/\n  modules/\n  services/\n  data/",
    testing: "Validate the end-to-end flow, cover edge cases around empty states, and verify that saved data and exports behave consistently.",
    tech: [language, "React", "TypeScript", "Vite", "Local storage"],
  };
}

export function demoReport(projectTitle: string): string {
  return `# ${projectTitle}\n\n## Problem\nBuild a useful app that helps students stay focused and organized without overwhelming them.\n\n## Solution\nThis project creates a focused experience that combines planning, progress tracking, and user-friendly visual feedback.\n\n## Impact\n- Improves clarity for users engaged in learning or project work\n- Makes progress easy to review and share\n- Gives a clear foundation for future feature expansion\n\n## Next steps\n1. Validate core user flows with real interview or usability feedback\n2. Add analytics or recommendations\n3. Improve resilience around saved data and export actions\n`;
}
