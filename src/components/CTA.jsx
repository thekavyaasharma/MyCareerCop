import Reveal from "./Reveal";
import MagneticButton from "./MagneticButton";

export default function CTA({ onOpenAuth }) {
  return (
    <section className="max-w-[1200px] mx-auto px-6 py-20 md:py-28">
      <Reveal>
        <div className="relative overflow-hidden text-center bg-surface border border-line rounded-3xl px-6 py-16 md:py-20">
          <div
            className="glow-blob w-[380px] h-[380px] bg-scan/10 -top-32 -right-24"
            aria-hidden="true"
          />
          <h2 className="relative font-display text-3xl md:text-4xl text-ink max-w-xl mx-auto">
            Ready to Improve Your Job Search?
          </h2>
          <p className="relative text-ink-dim mt-5 max-w-lg mx-auto leading-relaxed">
            Upload your resume once and let myCareerCop help you discover
            better opportunities, strengthen your applications, and prepare
            for your next career move.
          </p>
          <div className="relative flex flex-wrap items-center justify-center gap-4 mt-9">
            <MagneticButton onClick={() => onOpenAuth("signup")} className="btn-primary">
              Create Free Account
            </MagneticButton>
            <MagneticButton onClick={() => onOpenAuth("login")} className="btn-ghost">
              Log In
            </MagneticButton>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
