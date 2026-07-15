export default function Dashboard({ user, profile, onLogOut }) {
  const openedJobsCount = profile?.openedJobsCount ?? 0;
  const appliedJobsCount = profile?.appliedJobsCount ?? 0;

  return (
    <div className="min-h-screen px-6 py-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-3xl text-ink">
            Welcome back, {profile?.fullName?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-ink-dim text-sm mt-1">
            Here's where your job search stands.
          </p>
        </div>
        <button
          onClick={onLogOut}
          className="text-sm text-ink-dim hover:text-ink transition-colors"
        >
          Log out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface border border-line rounded-2xl p-5">
          <p className="text-ink-dim text-xs uppercase tracking-wide">Opened Jobs</p>
          <p className="font-display text-3xl text-ink mt-2">{openedJobsCount}</p>
        </div>
        <div className="bg-surface border border-line rounded-2xl p-5">
          <p className="text-ink-dim text-xs uppercase tracking-wide">Applied Jobs</p>
          <p className="font-display text-3xl text-ink mt-2">{appliedJobsCount}</p>
        </div>
        <div className="bg-surface border border-line rounded-2xl p-5">
          <p className="text-ink-dim text-xs uppercase tracking-wide">Target Role</p>
          <p className="font-display text-lg text-ink mt-2">{profile?.targetedRole || "—"}</p>
        </div>
      </div>

      <div className="bg-surface border border-line rounded-2xl p-6">
        <h2 className="font-display text-xl text-ink mb-3">Your AI Resume Summary</h2>
        <p className="text-ink-dim text-sm whitespace-pre-wrap leading-relaxed">
          {profile?.resumeSummary || "No summary available yet."}
        </p>
      </div>
    </div>
  );
}