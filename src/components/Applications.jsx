import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { Briefcase, MapPin, ExternalLink, Send, AlertCircle } from "lucide-react";
import { db } from "../firebase";

export default function Applications({ user }) {
  const [state, setState] = useState("loading"); // loading | ready | empty | error
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    async function load() {
      setState("loading");
      try {
        const snap = await getDoc(doc(db, "applications", user.uid));
        if (!snap.exists() || !snap.data().jobs?.length) {
          setState("empty");
          return;
        }
        // Most recent first.
        const sorted = [...snap.data().jobs].sort(
          (a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)
        );
        setApplications(sorted);
        setState("ready");
      } catch (err) {
        console.error("Failed to load applications:", err);
        setState("error");
      }
    }

    load();
  }, [user?.uid]);

  return (
    <div className="px-8 py-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-ink tracking-tight">Applications</h1>
        <p className="text-ink-dim text-sm mt-1.5">
          Every job you've marked as applied \u2014 kept permanently, even after it rotates
          out of today's matches.
        </p>
      </div>

      {state === "loading" && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-surface border border-line rounded-2xl p-5 h-20 animate-pulse"
            />
          ))}
        </div>
      )}

      {state === "error" && (
        <div className="bg-surface border border-line rounded-2xl p-8 text-center">
          <AlertCircle size={22} className="mx-auto text-red-500 mb-3" />
          <p className="text-sm text-ink-dim">
            Couldn't load your applications. Try refreshing the page.
          </p>
        </div>
      )}

      {state === "empty" && (
        <div className="bg-surface border border-line rounded-2xl p-8 text-center">
          <Send size={22} className="mx-auto text-indigo-400 mb-3" />
          <h2 className="font-display text-lg text-ink mb-1.5">No applications yet</h2>
          <p className="text-sm text-ink-dim">
            Head to Opportunities and mark a job as applied \u2014 it'll show up here
            permanently.
          </p>
        </div>
      )}

      {state === "ready" && (
        <div className="space-y-3">
          {applications.map((job, i) => (
            <div
              key={`${job.jobId}-${i}`}
              className="bg-surface border border-line rounded-2xl p-5 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <h3 className="font-display text-base text-ink truncate">{job.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-ink-dim">
                  <span className="flex items-center gap-1">
                    <Briefcase size={12} /> {job.company}
                  </span>
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {job.location}
                    </span>
                  )}
                  <span>
                    Applied{" "}
                    {new Date(job.appliedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {typeof job.score === "number" && (
                  <span className="text-xs font-mono text-ink-dim">{job.score}/100</span>
                )}
                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    View <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
