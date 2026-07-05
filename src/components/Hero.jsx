import { useRef } from "react";
import MagneticButton from "./MagneticButton";
import ScanCard from "./ScanCard";

export default function Hero({ onOpenAuth }) {
  const sectionRef = useRef(null);

  function handleMouseMove(e) {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--y", `${e.clientY - rect.top}px`);
  }

  return (
    <section
      id="top"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden"
    >
      <div className="spotlight" />
      <div
        className="glow-blob w-[420px] h-[420px] bg-signal/20 -top-40 -left-32"
        aria-hidden="true"
      />
      <div
        className="glow-blob w-[380px] h-[380px] bg-scan/10 top-10 right-0"
        aria-hidden="true"
      />

      <div className="relative max-w-[1200px] mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32 grid md:grid-cols-2 gap-14 items-center">
        <div>
          

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[1.08] mt-6 text-ink">
            Your AI Career Copilot for Smarter Job Applications
          </h1>

          <p className="text-ink-dim text-base sm:text-lg mt-6 max-w-xl leading-relaxed">
            Upload your resume once, and myCareerCop helps you discover relevant
            jobs, understand your ATS match, improve your resume when needed,
            and identify skills that can strengthen your career.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-9">
            <MagneticButton onClick={() => onOpenAuth("signup")} className="btn-primary">
              Get Started
            </MagneticButton>
            <MagneticButton onClick={() => onOpenAuth("login")} className="btn-ghost">
              Log In
            </MagneticButton>
          </div>

          
        </div>

        <div className="relative">
          <ScanCard className="max-w-md md:ml-auto" />
        </div>
      </div>
    </section>
  );
}
