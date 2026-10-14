import React, { useMemo, useState } from "react";
import { Globe, Bookmark, Search, Plus, ExternalLink, AlertTriangle } from "lucide-react";
import { PageHeader } from "../../components/ui";
import { useStore } from "../../store";

/** Opportunity data structure. Each opportunity supports the full field set. */
export type Opportunity = {
  id: string;
  title: string;
  organization: string;
  type: "Internship" | "Scholarship" | "Hackathon" | "Fellowship" | "Workshop" | "Program" | "Custom";
  description: string;
  eligibility: string;
  requiredSkills: string[];
  location: string;
  workMode: "On-site" | "Remote" | "Hybrid";
  deadline: string;
  applicationUrl: string;
  sourceUrl: string;
  sourceName: string;
  isVerified: boolean;
  isDemo: boolean;
  lastVerifiedAt: string | null;
};

/** Status label colors per deadline proximity. */
const STATUS_LABELS = {
  upcoming: "Upcoming",
  open: "Open",
  closingSoon: "Closing soon",
  expired: "Expired",
};
const STATUS_COLORS = {
  upcoming: "text-gray-400",
  open: "text-teal-600",
  closingSoon: "text-[#facc15]",
  expired: "text-rose-500",
};

/** Format an opportunity's deadline status based on the current date. */
function opportunityStatus(deadline: string): "upcoming" | "open" | "closingSoon" | "expired" {
  const d = new Date(deadline);
  const now = new Date();
  const diffDays = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return "expired";
  if (diffDays <= 7) return "closingSoon";
  if (diffDays <= 30) return "open";
  return "upcoming";
}

/** Render a status badge for an opportunity's deadline. */
function StatusBadge({ deadline }: { deadline: string }) {
  const status = opportunityStatus(deadline);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border ${STATUS_COLORS[status]} border-${status}-200`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

/** Open the opportunity details view. */
function openDetails(op: Opportunity) {
  // Build a detailed summary string from the opportunity data
  const lines: string[] = [];
  lines.push(`<strong>${op.title}</strong> — ${op.organization}`);
  lines.push(`<strong>Type:</strong> ${op.type}`);
  lines.push(`<strong>Description:</strong> ${op.description}`);
  lines.push(`<strong>Eligibility:</strong> ${op.eligibility}`);
  lines.push(`<strong>Required skills:</strong> ${op.requiredSkills.join(", ")}`);
  lines.push(`<strong>Location:</strong> ${op.location}`);
  lines.push(`<strong>Work mode:</strong> ${op.workMode}`);
  lines.push(`<strong>Deadline:</strong> ${op.deadline}`);
  if (op.applicationUrl && op.applicationUrl.trim()) {
    lines.push(`<strong>Apply:</strong> <a href="${op.applicationUrl}" target="_blank" rel="noopener noreferrer">${op.applicationUrl}</a>`);
  } else {
    lines.push("<strong>Apply:</strong> Not provided");
  }
  if (op.sourceUrl && op.sourceUrl.trim()) {
    lines.push(`<strong>Source:</strong> ${op.sourceName || "Unknown"} (${op.sourceUrl})`);
  } else {
    lines.push("<strong>Source:</strong> Not provided");
  }
  if (op.lastVerifiedAt) {
    lines.push(`<strong>Last verified:</strong> ${op.lastVerifiedAt}`);
  } else {
    lines.push("<strong>Last verified:</strong> Not provided");
  }

  // Render as a modal or push to history; for now show an alert with the details
  const detailsHtml = `
    <div class="p-6 space-y-4 max-w-xl">
      ${lines.map((l) => `<p class="text-sm">${l}</p>`).join("")}
    </div>
  `;
  alert(detailsHtml);
}

/** Safely open a URL in a new tab with noreferrer/noopener. */
function openApplyUrl(url: string | undefined) {
  if (!url) {
    alert("No application URL is available for this opportunity.");
    return;
  }
  // Reject javascript: and other unsafe schemes
  if (!/^https?:\/\//i.test(url)) {
    alert("The application link is not a valid URL. Please use http:// or https://.");
    return;
  }
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (win) {
    // Browser popup blocker may have intervened; notify the user
    if (!win.opener) {
      alert("Pop-up blocked. Please allow pop-ups for this site to view the application.");
    }
  } else {
    alert("Could not open the application link. Please try again or visit the site directly.");
  }
}

const TYPES = ["All", "Internship", "Scholarship", "Hackathon", "Fellowship", "Workshop", "Program", "Custom"];

const SAMPLE: Opportunity[] = [
  {
    id: "s1",
    title: "Summer Research Internship",
    organization: "University Physics Department",
    type: "Internship",
    description: "Research internship working with faculty on cutting-edge physics research.",
    eligibility: "Undergraduate standing; completed intro physics; GPA 3.0+.",
    requiredSkills: ["Laboratory techniques", "Data analysis", "Scientific writing"],
    location: "University campus",
    workMode: "On-site",
    deadline: "2026-11-30",
    applicationUrl: "",
    sourceUrl: "",
    sourceName: "University official",
    isVerified: false,
    isDemo: true,
    lastVerifiedAt: null,
  },
  {
    id: "s2",
    title: "Campus Hackathon: City Sustainability",
    organization: "Student Hackathon Collective",
    type: "Hackathon",
    description: "24-hour hackathon focused on sustainable city solutions.",
    eligibility: "Any major; interest in sustainability or coding.",
    requiredSkills: ["Teamwork", "Problem-solving", "Basic coding"],
    location: "On campus + online",
    workMode: "Hybrid",
    deadline: "2026-10-28",
    applicationUrl: "",
    sourceUrl: "",
    sourceName: "Hackathon organizers",
    isVerified: false,
    isDemo: true,
    lastVerifiedAt: null,
  },
  {
    id: "s3",
    title: "Merit-cum-Means Scholarship",
    organization: "National Education Trust",
    type: "Scholarship",
    description: "Merit-cum-means based scholarship for undergraduate students.",
    eligibility: "Undergraduate standing; family income below threshold; GPA 3.5+.",
    requiredSkills: ["Academic excellence", "leadership", "Community service"],
    location: "National",
    workMode: "Remote",
    deadline: "2026-12-15",
    applicationUrl: "",
    sourceUrl: "",
    sourceName: "National trust",
    isVerified: false,
    isDemo: true,
    lastVerifiedAt: null,
  },
  {
    id: "s4",
    title: "Open-source Contributing Program",
    organization: "Linux Foundation",
    type: "Program",
    description: "Contribute to open-source projects with mentorship from maintainers.",
    eligibility: "Basic Git knowledge; passion for open source.",
    requiredSkills: ["Git", "Command line", "Language-specific skills"],
    location: "Remote",
    workMode: "Remote",
    deadline: "2026-11-10",
    applicationUrl: "",
    sourceUrl: "",
    sourceName: "Linux Foundation",
    isVerified: false,
    isDemo: true,
    lastVerifiedAt: null,
  },
  {
    id: "s5",
    title: "Campus Product Manager Fellowship",
    organization: "Business School Club",
    type: "Internship",
    description: "Fellowship involving product strategy and roadmap planning for campus initiatives.",
    eligibility: "Business or CS major; prior coursework or experience in product management.",
    requiredSkills: ["Product strategy", "Stakeholder communication", "Analytics"],
    location: "Remote",
    workMode: "Remote",
    deadline: "2026-11-05",
    applicationUrl: "",
    sourceUrl: "",
    sourceName: "Business School Club",
    isVerified: false,
    isDemo: true,
    lastVerifiedAt: null,
  },
  {
    id: "s6",
    title: "Tech Workshop: Intro to Cloud",
    organization: "Cloud Academy",
    type: "Workshop",
    description: "Introductory workshop on cloud computing fundamentals and services.",
    eligibility: "Basic networking knowledge; familiarity with Linux helpful.",
    requiredSkills: ["Cloud concepts", "Linux basics", "API awareness"],
    location: "Online",
    workMode: "Remote",
    deadline: "2026-10-25",
    applicationUrl: "",
    sourceUrl: "",
    sourceName: "Cloud Academy",
    isVerified: false,
    isDemo: true,
    lastVerifiedAt: null,
  },
];

export default function Opportunities() {
  const { getVal, setVal, logEvent } = useStore();
  const custom = getVal<Opportunity[]>("customOpps", []);
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const [sort, setSort] = useState<"deadlineAsc" | "deadlineDesc" | "alphabetic">("deadlineAsc");
  const [form, setForm] = useState<{
    title: string;
    deadline: string;
    organization: string;
    applicationUrl: string;
  }>({
    title: "",
    deadline: "",
    organization: "",
    applicationUrl: "",
  });

  const all = useMemo(() => [...custom, ...SAMPLE], [custom]);

  // Apply filters and sorting
  const list = useMemo(() => {
    return all.filter((o) => {
      // Type filter
      if (type !== "All" && o.type !== type) return false;
      // Search query matches title or organization
      const lowerQ = q.toLowerCase();
      if (
        !lowerQ.includes(o.title.toLowerCase()) &&
        !lowerQ.includes(o.organization.toLowerCase())
      )
        return false;
      // Filter out expired opportunities
      if (opportunityStatus(o.deadline) === "expired") return false;
      return true;
    }).sort((a, b) => {
      // Sort by deadline
      if (sort === "deadlineAsc") {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      } else if (sort === "deadlineDesc") {
        return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });
  }, [all, q, type, sort]);

  function toggleSave(id: string) {
    const next = saved.includes(id) ? saved.filter((s) => s !== id) : [...saved, id];
    setVal("savedOpps", next);
    logEvent("task", saved.includes(id) ? "Removed saved opportunity" : "Saved an opportunity");
  }

  function addCustom() {
    if (form.title.trim().length < 3 || !form.deadline) return;
    const next = [
      {
        id: crypto.randomUUID(),
        type: "Custom",
        ...form,
        title: form.title.trim(),
        isDemo: true,
        isVerified: false,
        lastVerifiedAt: null,
      },
      ...custom,
    ];
    setVal("customOpps", next);
    logEvent("task", "Added a new opportunity");
    setForm({ title: "", deadline: "", organization: "", applicationUrl: "" });
  }

  const saved = useMemo(() => {
    // Re-read from store each render to pick up any changes
    return getVal<string[]>("savedOpps", []);
  }, [getVal]);

  // Helper: safely open a URL in a new tab, with noreferrer/noopener
  function openApplyUrl(url: string | undefined) {
    if (!url) {
      alert("No application URL is available for this opportunity.");
      return;
    }
    // Reject javascript: and other unsafe schemes
    if (!/^https?:\/\//i.test(url)) {
      alert("The application link is not a valid URL. Please use http:// or https://.");
      return;
    }
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (win) {
      // Browser popup blocker may have intervened; notify the user
      if (!win.opener) {
        alert("Pop-up blocked. Please allow pop-ups for this site to view the application.");
      }
    } else {
      alert("Could not open the application link. Please try again or visit the site directly.");
    }
  }

  return (
    <div>
      <PageHeader icon={Globe} title="Opportunity Portal" subtitle="Internships, scholarships, hackathons and events — searchable and saveable." />

      {/* Status explanation */}
      <div className="glass rounded-xl p-3 mb-4 flex items-start gap-2.5 text-sm">
        <p className="text-secondary leading-relaxed">
          <span className="text-teal-600 font-medium">Real opportunities</span> have verified application links and source URLs. <span className="text-secondary">Sample listings are placeholders for demo purposes.</span>
        </p>
      </div>

      {/* Filter controls */}
      <div className="card mb-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="field !pl-9"
            placeholder="Search opportunities…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select className="field w-36" value={type} onChange={(e) => setType(e.target.value)} aria-label="Opportunity type filter">
          {TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select className="field w-36" value={sort} onChange={(e) => setSort(e.target.value as any)} aria-label="Sort by">
          <option key="deadlineAsc" value="deadlineAsc">Sort by nearest deadline</option>
          <option key="deadlineDesc" value="deadlineDesc">Sort by farthest deadline</option>
          <option key="alphabetic" value="alphabetic">Alphabetical</option>
        </select>
      </div>

      {/* Opportunity list with clickable cards */}
      <div className="grid md:grid-cols-2 gap-3">
        {list.map((o) => (
          <div
            key={o.id}
            className="card !p-4 flex items-start gap-3 cursor-pointer"
            onClick={() => openDetails(o)}
          >
            {/* Prevent bookmark click from triggering details */}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm">{o.title}</h3>
                {(o as { custom?: boolean }).custom && <span className="chip !text-[9px]">Added by you</span>}
                {o.isDemo && (
                  <span className="text-xs font-medium ml-auto">Demo Data</span>
                )}
              </div>
              <p className="text-xs text-secondary mt-1.5">
                {o.type} · {o.location} · deadline <span className="text-cyan font-semibold">{o.deadline}</span>{o.isDemo && <span className="text-[10px] ml-2 bg-gray-200/50 text-gray-400 rounded px-1 py-0.5">Demo</span>}
              </p>
              <p className="text-xs text-secondary mt-1.5">{o.description}</p>
              {/* Apply Now button - only for non-demo opportunities with a valid URL */}
              {!o.isDemo && o.applicationUrl && o.applicationUrl.trim() ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // prevent card click
                    openApplyUrl(o.applicationUrl);
                  }}
                  className="mt-2 text-xs font-medium text-cyan underline hover:text-teal-600"
                  aria-label="Apply now"
                >
                  Apply Now
                </button>
              ) : (
                o.isDemo ? (
                  <button
                    disabled
                    className="mt-2 text-xs opacity-40 cursor-not-allowed"
                    aria-label="Apply not available – demo data"
                  >
                    Apply Now
                  </button>
                ) : (
                  <button
                    disabled
                    className="mt-2 text-xs opacity-40 cursor-not-allowed"
                    aria-label="Apply not available – no application URL"
                  >
                    Apply Now
                  </button>
                )
              )}
            </div>
            <div>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // prevent card click from firing when bookmark is clicked
                  toggleSave(o.id);
                }}
                aria-label="Save opportunity"
                className="shrink-0 absolute right-2 top-2"
              >
                <Bookmark
                  className={`w-5 h-5 transition ${saved.includes(o.id) ? "text-teal fill-teal" : "text-muted hover:text-cyan"}`}
                />
              </button>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="text-sm text-secondary">No listings match your filters.</p>}
      </div>

      {/* Add real opportunity */}
      <div className="card mt-5">
        <h2 className="font-bold text-sm mb-3 inline-flex items-center gap-2"><Plus className="w-4 h-4 text-teal" /> Add a real opportunity you found</h2>
        <div className="grid sm:grid-cols-4 gap-2.5">
          <input
            className="field sm:col-span-2"
            placeholder="Title (e.g. Google Summer of Code)"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <input
            className="field"
            type="date"
            value={form.deadline}
            onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
          />
          <input
            className="field"
            placeholder="Organization / provider"
            value={form.organization}
            onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
          />
          <input
            className="field sm:col-span-3"
            placeholder="Official link (https://…)"
            value={form.applicationUrl}
            onChange={(e) => setForm((f) => ({ ...f, applicationUrl: e.target.value }))}
          />
          <button className="btn-primary text-sm justify-center" onClick={addCustom} disabled={form.title.trim().length < 3 || !form.deadline}>
            Save
          </button>
        </div>
        {saved.length > 0 && <p className="text-xs text-secondary mt-3">{saved.length} saved · visible with the bookmark icon on listings above.</p>}
      </div>
    </div>
  );
}