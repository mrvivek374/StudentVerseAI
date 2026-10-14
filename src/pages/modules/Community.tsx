import React, { useState } from "react";
import { Users, MessagesSquare, Plus, MessageCircle, ShieldAlert, Trophy } from "lucide-react";
import { PageHeader, EmptyState } from "../../components/ui";
import { useStore } from "../../store";

type Group = { id: string; name: string; course: string; members: number; joined: boolean };
type Thread = { id: string; title: string; category: string; author: string; body: string; replies: string[]; at: number };

export default function Community() {
  const { user, getVal, setVal, logEvent } = useStore();
  const [groups, setGroups] = useState<Group[]>(() =>
    getVal<Group[]>("groups", [
      { id: "g1", name: "DSA Grind Club", course: "Data structures & algorithms", members: 1, joined: false },
      { id: "g2", name: "Web Dev Builders", course: "Frontend + Node", members: 1, joined: false },
      { id: "g3", name: "Calculus Support Group", course: "Engineering math", members: 1, joined: false },
    ])
  );
  const [threads, setThreads] = useState<Thread[]>(() =>
    getVal<Thread[]>("threads", [
      {
        id: "t1",
        title: "How do you stay consistent during exam season?",
        category: "Study techniques",
        author: "Demo student",
        body: "I keep failing at consistency. What actually works for you all?",
        replies: [],
        at: Date.now() - 86400000,
      },
    ])
  );
  const [tab, setTab] = useState<"threads" | "groups" | "showcase">("threads");
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [reply, setReply] = useState<Record<string, string>>({});
  const [groupName, setGroupName] = useState("");

  const persistThreads = (t: Thread[]) => {
    setThreads(t);
    setVal("threads", t);
  };
  const persistGroups = (g: Group[]) => {
    setGroups(g);
    setVal("groups", g);
  };

  function postThread() {
    if (newTitle.trim().length < 5 || newBody.trim().length < 3) return;
    persistThreads([{ id: crypto.randomUUID(), title: newTitle.trim(), category: "General", author: user?.name ?? "You", body: newBody.trim(), replies: [], at: Date.now() }, ...threads]);
    setNewTitle("");
    setNewBody("");
    logEvent("task", "Posted in community forum");
  }
  function toggleJoin(id: string) {
    const g = groups.find((x) => x.id === id)!;
    persistGroups(groups.map((x) => (x.id === id ? { ...x, joined: !x.joined, members: x.members + (x.joined ? -1 : 1) } : x)));
    if (!g.joined) logEvent("task", `Joined study group: ${g.name}`);
  }
  function createGroup() {
    if (groupName.trim().length < 3) return;
    persistGroups([...groups, { id: crypto.randomUUID(), name: groupName.trim(), course: "General", members: 1, joined: true }]);
    setGroupName("");
    logEvent("task", "Created a study group");
  }

  return (
    <div>
      <PageHeader icon={Users} title="Community Nexus" subtitle="Study groups, forum discussions and project showcases." />

      <div className="glass rounded-xl p-3 mb-4 flex items-start gap-2.5 text-sm">
        <ShieldAlert className="w-4 h-4 text-cyan mt-0.5 shrink-0" />
        <p className="text-secondary leading-relaxed">
          Demo build: the community runs locally in your browser. Connect a backend (user accounts + database) to share threads and groups with real students.
          Be kind and follow your campus guidelines — moderation tools come with the backend wiring.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {([["threads", MessagesSquare, "Forum"], ["groups", Users, "Study groups"], ["showcase", Trophy, "Showcase"]] as const).map(([id, Icon, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`pill inline-flex items-center gap-1.5 ${tab === id ? "!border-teal/60 !text-teal !bg-teal/10" : ""}`}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {tab === "threads" && (
        <>
          <div className="card mb-4">
            <h2 className="font-bold text-sm mb-3">Start a discussion</h2>
            <input className="field" placeholder="Question or topic title…" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <textarea className="field mt-2 h-20 resize-none" placeholder="Add details…" value={newBody} onChange={(e) => setNewBody(e.target.value)} />
            <button className="btn-primary text-sm mt-3" onClick={postThread} disabled={newTitle.trim().length < 5 || newBody.trim().length < 3}>Post</button>
          </div>
          <div className="space-y-3">
            {threads.map((t) => (
              <div key={t.id} className="card !p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h3 className="font-bold text-sm">{t.title}</h3>
                  <span className="chip !text-[9px]">{t.category}</span>
                </div>
                <p className="text-sm text-secondary mt-1">{t.body}</p>
                <p className="text-[11px] text-secondary mt-2">by {t.author} · {new Date(t.at).toLocaleDateString()} · {t.replies.length} replies</p>

                {t.replies.length > 0 && (
                  <div className="mt-3 space-y-2 border-l-2 border-teal/30 pl-3">
                    {t.replies.map((r, i) => <p key={i} className="text-sm">{r}</p>)}
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <input
                    className="field !py-1.5"
                    placeholder="Write a reply…"
                    value={reply[t.id] ?? ""}
                    onChange={(e) => setReply((r) => ({ ...r, [t.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const v = (reply[t.id] ?? "").trim();
                        if (v.length >= 1) {
                          persistThreads(threads.map((x) => (x.id === t.id ? { ...x, replies: [...x.replies, v] } : x)));
                          setReply((r) => ({ ...r, [t.id]: "" }));
                        }
                      }
                    }}
                  />
                  <button className="btn-primary !p-2" aria-label="Reply" onClick={() => {
                    const v = (reply[t.id] ?? "").trim();
                    if (v.length >= 1) {
                      persistThreads(threads.map((x) => (x.id === t.id ? { ...x, replies: [...x.replies, v] } : x)));
                      setReply((r) => ({ ...r, [t.id]: "" }));
                    }
                  }}>
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "groups" && (
        <>
          <div className="card mb-4 flex gap-2">
            <input className="field" placeholder="New group name (e.g. DBMS Night Owls)" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
            <button className="btn-primary text-sm inline-flex items-center gap-1.5" onClick={createGroup}><Plus className="w-4 h-4" /> Create</button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {groups.map((g) => (
              <div key={g.id} className="card !p-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm">{g.name}</h3>
                  <p className="text-xs text-secondary mt-0.5">{g.course} · {g.members} member{g.members === 1 ? "" : "s"} (local)</p>
                </div>
                <button onClick={() => toggleJoin(g.id)} className={g.joined ? "btn-ghost !py-1.5 text-xs" : "btn-primary !py-1.5 text-xs"}>
                  {g.joined ? "Leave" : "Join"}
                </button>
              </div>
            ))}
            {groups.length === 0 && <EmptyState title="No groups yet" />}
          </div>
        </>
      )}

      {tab === "showcase" && (
        <div className="card">
          <EmptyState
            title="Project showcase opens with the backend"
            hint="Once accounts + database are connected, students can publish finished projects with screenshots and links. For now, save projects in your Project Studio — exporting your report is a great showcase start."
          />
        </div>
      )}
    </div>
  );
}
