import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { GraduationCap, BookOpen, Briefcase, AlertCircle } from "lucide-react";
import { db } from "../firebase";

export default function SkillUp({ user }) {
  const [state, setState] = useState("loading"); // loading | ready | empty | error
  const [roadmap, setRoadmap] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    async function load() {
      setState("loading");
      try {
        const snap = await getDoc(doc(db, "skillup", user.uid));
        if (!snap.exists() || !snap.data().roadmap?.length) {
          setState("empty");
          return;
        }
        setRoadmap(snap.data().roadmap);
        setState("ready");
      } catch (err) {
        console.error("Failed to load skill roadmap:", err);
        setState("error");
      }
    }

    load();
  }, [user?.uid]);

  return (
    <div className="px-8 py-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-ink tracking-tight">SkillUp</h1>
        <p className="text-ink-dim text-sm mt-1.5">
          Targeted upskilling based on the roles you're closest to landing.
        </p>
      </div>

      {state === "loading" && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-surface border border-line rounded-2xl p-6 h-24 animate-pulse"
            />
          ))}
        </div>
      )}

      {state === "error" && (
        <div className="bg-surface border border-line rounded-2xl p-8 text-center">
          <AlertCircle size={22} className="mx-auto text-red-500 mb-3" />
          <p className="text-sm text-ink-dim">
            Couldn't load your roadmap. Try refreshing the page.
          </p>
        </div>
      )}

      {state === "empty" && (
        <div className="bg-surface border border-line rounded-2xl p-8 text-center">
          <GraduationCap size={22} className="mx-auto text-indigo-400 mb-3" />
          <h2 className="font-display text-lg text-ink mb-1.5">No roadmap yet</h2>
          <p className="text-sm text-ink-dim">
            Visit the Opportunities tab first — we'll build your skill roadmap from any jobs
            that are a partial match.
          </p>
        </div>
      )}

      {state === "ready" && (
        <div className="space-y-4">
          {roadmap.map((item, i) => (
            <div key={i} className="bg-surface border border-line rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="font-display text-lg text-ink">{item.skill}</h3>
                <span className="flex items-center gap-1 text-[11px] text-ink-dim shrink-0 mt-1">
                  <Briefcase size={11} /> {item.jobTitle}
                </span>
              </div>
              <p className="text-sm text-ink-dim leading-relaxed mb-3">{item.why}</p>
              {item.resources?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.resources.map((r, j) => (
                    <span
                      key={j}
                      className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700"
                    >
                      <BookOpen size={11} /> {r}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}