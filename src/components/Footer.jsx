const COLUMNS = [
  { title: "Product", links: ["Home", "Features", "How It Works"] },
  { title: "Support", links: ["Contact", "FAQ"] },
  { title: "Legal", links: ["Privacy Policy", "Terms of Service"] },
];

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="max-w-[1200px] mx-auto px-6 py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <span className="font-display text-lg text-ink">MyCareerCop</span>
          <p className="text-ink-dim text-sm mt-3 max-w-[220px] leading-relaxed">
            Your AI copilot for smarter and more confident job applications.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="font-mono text-xs tracking-widest text-ink-dim">
              {col.title.toUpperCase()}
            </h4>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    data-cursor-hover
                    className="text-sm text-ink-dim hover:text-ink transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div >
        <p className="max-w-[1200px] mx-auto px-6 py-6 text-xs text-ink-dim font-mono">
          © {new Date().getFullYear()} MyCareerCop — Built by a job seeker, for job seekers!
        </p>
      </div>
    </footer>
  );
}
