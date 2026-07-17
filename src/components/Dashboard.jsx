import { Briefcase, Send, TrendingUp, Target, Sparkles, CircleCheck, ArrowRight, Clock } from "lucide-react";

export default function Dashboard({ user, profile }) {
  const openedJobsCount = profile?.openedJobsCount ?? 0;
  const appliedJobsCount = profile?.appliedJobsCount ?? 0;
  const conversionRate =
    openedJobsCount > 0 ? Math.round((appliedJobsCount / openedJobsCount) * 100) : 0;
  const hasSummary = Boolean(profile?.resumeSummary);
  const firstName = profile?.fullName?.split(" ")[0] || "there";

  return (
    <div className="px-8 py-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="font-display text-3xl text-ink tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="text-ink-dim text-sm mt-1.5">
            Here's where your job search stands today.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-line bg-surface text-xs text-ink-dim">
          <Clock size={13} />
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
        </div>
      </div>

      {/* Pipeline */}
      <div className="bg-surface border border-line rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-medium uppercase tracking-wide text-ink-dim">
            Application Pipeline
          </h2>
          <span className="text-xs text-ink-dim">
            {conversionRate}% conversion
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <Briefcase size={19} className="text-indigo-600" />
            </div>
            <div>
              <p className="font-display text-2xl text-ink leading-none">{openedJobsCount}</p>
              <p className="text-xs text-ink-dim mt-1">Jobs opened</p>
            </div>
          </div>

          <ArrowRight size={16} className="text-line shrink-0" />

          <div className="flex-1 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Send size={17} className="text-emerald-600" />
            </div>
            <div>
              <p className="font-display text-2xl text-ink leading-none">{appliedJobsCount}</p>
              <p className="text-xs text-ink-dim mt-1">Applications sent</p>
            </div>
          </div>

          <div className="hidden md:flex flex-1 items-center gap-4 pl-4 border-l border-line">
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Target size={17} className="text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-base text-ink leading-tight truncate">
                {profile?.targetedRole || "Not set"}
              </p>
              <p className="text-xs text-ink-dim mt-1">Target role</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Resume Summary */}
        <div className="lg:col-span-2 bg-surface border border-line rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Sparkles size={14} className="text-indigo-600" />
              </div>
              <h2 className="font-display text-lg text-ink">AI Resume Summary</h2>
            </div>
            <span
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
                hasSummary
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              <CircleCheck size={12} />
              {hasSummary ? "Ready" : "Pending"}
            </span>
          </div>
          <p className="text-ink-dim text-sm whitespace-pre-wrap leading-relaxed">
            {profile?.resumeSummary ||
              "Upload your resume to generate an AI-powered summary of your experience, skills, and strengths."}
          </p>
        </div>

        {/* Side column */}
        <div className="flex flex-col gap-6">
          <div className="bg-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} />
              <h2 className="font-display text-base">Next Best Action</h2>
            </div>
            <p className="text-sm text-indigo-100 leading-relaxed mb-4">
              Once your resume is matched against live job listings, we'll tell
              you exactly whether to apply, optimize, or close a skill gap.
            </p>
            <button className="w-full text-sm font-medium bg-white text-indigo-700 rounded-xl py-2.5 hover:bg-indigo-50 transition-colors">
              View opportunities
            </button>
          </div>

          <div className="bg-surface border border-line rounded-2xl p-6">
            <p className="text-ink-dim text-xs uppercase tracking-wide mb-2">
              Profile strength
            </p>
            <p className="font-display text-2xl text-ink">
              {hasSummary ? "Good" : "Incomplete"}
            </p>
            <p className="text-xs text-ink-dim mt-1">
              {hasSummary
                ? "Your profile is ready for matching."
                : "Add a resume to unlock matching."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}