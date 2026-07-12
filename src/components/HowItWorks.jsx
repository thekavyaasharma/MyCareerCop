import Reveal from "./Reveal";

const STEPS = [
  { n: "01", title: "Create your free account", desc: "Sign up in under a minute — no credit card required." },
  { n: "02", title: "Upload your resume", desc: "PDF or DOCX. MyCareerCop reads and structures it automatically." },
  { n: "03", title: "Let the AI analyze", desc: "We compare your profile against relevant, real job opportunities." },
  { n: "04", title: "Review & apply", desc: "Check your ATS score, optimize your resume, explore skill gaps, and apply with confidence." },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-[1200px] mx-auto px-6 py-20 md:py-28">
      <Reveal>
        <h2 className="font-display text-3xl md:text-4xl text-center text-ink">
          Get Started in Four Simple Steps
        </h2>
      </Reveal>

      <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
        <div
          className="hidden lg:block absolute top-6 left-[12%] right-[12%] h-px bg-line"
          aria-hidden="true"
        />
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 100}>
            <div className="relative bg-surface border border-line rounded-2xl p-6 h-full">
              <span className="font-mono text-xs text-scan tracking-widest">
                STEP_{s.n}
              </span>
              <h3 className="font-medium text-ink mt-4">{s.title}</h3>
              <p className="text-ink-dim text-sm mt-2 leading-relaxed">{s.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
