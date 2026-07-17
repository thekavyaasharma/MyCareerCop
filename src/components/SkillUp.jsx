export default function SkillUp({ user, profile }) {
  return (
    <div className="px-6 py-10 max-w-4xl mx-auto">
      <h1 className="font-display text-3xl text-ink mb-2">SkillUp</h1>
      <p className="text-ink-dim text-sm mb-8">
        Your skill-gap analysis and learning roadmap.
      </p>
      <div className="bg-surface border border-line rounded-2xl p-6 text-ink-dim text-sm">
        Skill gap roadmap will render here.
      </div>
    </div>
  );
}