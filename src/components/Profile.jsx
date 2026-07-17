export default function Profile({ user, profile }) {
  return (
    <div className="px-6 py-10 max-w-4xl mx-auto">
      <h1 className="font-display text-3xl text-ink mb-2">Profile</h1>
      <p className="text-ink-dim text-sm mb-8">
        Manage your resume, targeted role, and account details.
      </p>
      <div className="bg-surface border border-line rounded-2xl p-6 text-ink-dim text-sm">
        Editable profile form will render here.
      </div>
    </div>
  );
}