import Reveal from "./Reveal";

const POINTS = [
  "AI-powered resume analysis",
  "ATS compatibility insights",
  "Personalized resume optimization",
  "Skill gap recommendations",
  "Real job listings",
  "Clean and simple experience",
  "Secure resume storage",
  "Built for continuous improvement",
];

export default function WhyChoose() {
  return (
    <section className="relative overflow-hidden border-y border-line">
      <div
        className="glow-blob w-[500px] h-[500px] bg-signal/10 -bottom-56 left-1/2 -translate-x-1/2"
        aria-hidden="true"
      />
      <div className="relative max-w-[1200px] mx-auto px-6 py-20 md:py-28">
        <Reveal>
          <h2 className="font-display text-3xl md:text-4xl text-center text-ink max-w-xl mx-auto">
            Designed to Help You Apply Smarter
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5 mt-14 max-w-3xl mx-auto">
          {POINTS.map((p, i) => (
            <Reveal key={p} delay={i * 60}>
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-signal shrink-0" />
                <span className="text-ink-dim text-sm">{p}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
