export default function Opportunities({ user, profile }) {
  return (
    <div className="px-6 py-10 max-w-4xl mx-auto">
      <h1 className="font-display text-3xl text-ink mb-2">Opportunities</h1>
      <p className="text-ink-dim text-sm mb-8">
        Jobs matched to your profile via Adzuna, ranked by ATS score.
      </p>
      <div className="bg-surface border border-line rounded-2xl p-6 text-ink-dim text-sm">
        Job listings + ATS match scores will render here.
      </div>
    </div>
  );
}