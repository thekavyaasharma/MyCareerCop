import { useEffect, useState, useCallback } from "react";
import {
  Briefcase,
  MapPin,
  ExternalLink,
  Mail,
  Wrench,
  GraduationCap,
  RefreshCw,
  AlertCircle,
  CircleCheck,
} from "lucide-react";
import { auth } from "../firebase";
import ScoreReadout from "./ScoreReadout";

async function authFetch(url, options = {}) {
  const token = await auth.currentUser.getIdToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

function ActionPanel({ job, onOpen }) {
  if (job.action === "apply_now") {
    return (
      <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-100 p-4">
        <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium mb-1.5">
          <Mail size={15} />
          Near-perfect match — apply now
        </div>
        <p className="text-xs text-emerald-700/80 mb-3">
          We've emailed you an alert for this one. Don't wait on this.
        </p>
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onOpen}
            className="inline-flex items-center gap-1.5 text-sm font-medium bg-emerald-600 text-white rounded-lg px-3.5 py-2 hover:bg-emerald-700 transition-colors"
          >
            Apply on employer site <ExternalLink size={13} />
          </a>
        )}
      </div>
    );
  }

  if (job.action === "resume_fix") {
    return (
      <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 p-4">
        <div className="flex items-center gap-2 text-amber-700 text-sm font-medium mb-2">
          <Wrench size={15} />
          Strong match — polish your resume first
        </div>
        <ul className="space-y-1.5">
          {job.resumeSuggestions?.map((s, i) => (
            <li key={i} className="text-xs text-amber-800/90 leading-relaxed flex gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              {s}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // skill_gap
  return (
    <div className="mt-4 rounded-xl bg-indigo-50 border border-indigo-100 p-4">
      <div className="flex items-center gap-2 text-indigo-700 text-sm font-medium mb-2">
        <GraduationCap size={15} />
        Skill gap — here's what to learn
      </div>
      {job.missingSkills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {job.missingSkills.slice(0, 5).map((skill, i) => (
            <span
              key={i}
              className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
      <a
        href="/skillup"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 hover:text-indigo-800"
      >
        View your full roadmap in SkillUp →
      </a>
    </div>
  );
}

function JobCard({ job, onMarkApplied, onMarkOpened }) {
  return (
    <div className="bg-surface border border-line rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <h3 className="font-display text-lg text-ink truncate">{job.title}</h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-ink-dim">
            <span className="flex items-center gap-1">
              <Briefcase size={12} /> {job.company}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {job.location}
            </span>
            {job.url && job.action !== "apply_now" && (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onMarkOpened(job.jobId)}
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
              >
                <ExternalLink size={12} /> View posting
              </a>
            )}
          </div>
        </div>
        <ScoreReadout target={job.score} label="ATS" />
      </div>

      {job.matchedSkills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {job.matchedSkills.slice(0, 6).map((skill, i) => (
            <span
              key={i}
              className="text-[11px] px-2 py-0.5 rounded-full bg-ink/[0.05] text-ink-dim"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <ActionPanel job={job} onOpen={() => onMarkOpened(job.jobId)} />

      <div className="mt-4 pt-4 border-t border-line flex justify-end">
        {job.applied ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg px-3 py-1.5">
            <CircleCheck size={13} /> Applied
          </span>
        ) : (
          <button
            onClick={() => onMarkApplied(job.jobId)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-dim border border-line rounded-lg px-3 py-1.5 hover:text-ink hover:border-ink/30 transition-colors"
          >
            <CircleCheck size={13} /> Mark as applied
          </button>
        )}
      </div>
    </div>
  );
}

export default function Opportunities({ profile }) {
  const [state, setState] = useState("loading"); // loading | ready | error | incomplete
  const [jobs, setJobs] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const load = useCallback(async () => {
    if (!profile?.targetedRole || !profile?.resumeSummary) {
      setState("incomplete");
      return;
    }
    setState("loading");
    try {
      const data = await authFetch("/api/opportunities");
      setJobs(data.jobs || []);
      setState("ready");
    } catch (err) {
      setErrorMsg(err.message);
      setState("error");
    }
  }, [profile?.targetedRole, profile?.resumeSummary]);

  useEffect(() => {
    load();
  }, [load]);

  async function markApplied(jobId) {
    // Optimistic update so the button flips instantly.
    setJobs((prev) => prev.map((j) => (j.jobId === jobId ? { ...j, applied: true } : j)));
    try {
      await authFetch("/api/mark-applied", {
        method: "POST",
        body: JSON.stringify({ jobId }),
      });
    } catch (err) {
      console.error("Failed to mark job as applied:", err);
      // Roll back on failure so the UI doesn't lie.
      setJobs((prev) => prev.map((j) => (j.jobId === jobId ? { ...j, applied: false } : j)));
    }
  }

  function markOpened(jobId) {
    // Fire-and-forget: the link is already navigating to a new tab,
    // so this must never block or delay that.
    setJobs((prev) => prev.map((j) => (j.jobId === jobId ? { ...j, opened: true } : j)));
    authFetch("/api/mark-opened", {
      method: "POST",
      body: JSON.stringify({ jobId }),
    }).catch((err) => console.error("Failed to record job open:", err));
  }

  if (state === "incomplete") {
    return (
      <div className="px-8 py-10 max-w-6xl mx-auto">
        <div className="bg-surface border border-line rounded-2xl p-8 text-center">
          <AlertCircle size={22} className="mx-auto text-amber-500 mb-3" />
          <h2 className="font-display text-lg text-ink mb-1.5">
            Complete your profile first
          </h2>
          <p className="text-sm text-ink-dim">
            We need your target role and resume summary before we can match you to jobs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-10 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-ink tracking-tight">Opportunities</h1>
          <p className="text-ink-dim text-sm mt-1.5">
            Matched daily against{" "}
            <span className="text-ink font-medium">{profile?.targetedRole}</span>
          </p>
        </div>
        {state === "ready" && (
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-xs text-ink-dim hover:text-ink transition-colors"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        )}
      </div>

      {state === "loading" && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-surface border border-line rounded-2xl p-6 h-32 animate-pulse"
            />
          ))}
        </div>
      )}

      {state === "error" && (
        <div className="bg-surface border border-line rounded-2xl p-8 text-center">
          <AlertCircle size={22} className="mx-auto text-red-500 mb-3" />
          <p className="text-sm text-ink-dim mb-4">{errorMsg}</p>
          <button
            onClick={load}
            className="text-sm font-medium bg-indigo-600 text-white rounded-xl px-4 py-2 hover:bg-indigo-700 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {state === "ready" && jobs.length === 0 && (
        <div className="bg-surface border border-line rounded-2xl p-8 text-center">
          <p className="text-sm text-ink-dim">
            No matching jobs found today for "{profile?.targetedRole}". Check back tomorrow.
          </p>
        </div>
      )}

      {state === "ready" && jobs.length > 0 && (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard
              key={job.jobId}
              job={job}
              onMarkApplied={markApplied}
              onMarkOpened={markOpened}
            />
          ))}
        </div>
      )}
    </div>
  );
}