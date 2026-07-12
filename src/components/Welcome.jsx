import Reveal from "./Reveal";

export default function Welcome() {
  return (
    <section className="max-w-[820px] mx-auto px-6 py-20 md:py-28 text-center">
      <Reveal>
        <h2 className="font-display text-3xl md:text-4xl text-ink">
          Welcome to MyCareerCop!
        </h2>
      </Reveal>
      
      <Reveal delay={180}>
        <p className="text-ink-dim text-lg mt-4 leading-relaxed">
          MyCareerCop helps you understand how well your resume matches real
          job opportunities. Instead of guessing, you receive an ATS
          compatibility score, resume improvement suggestions, and
          personalized skill gap insights — all in one place.
        </p>
      </Reveal>
      <Reveal delay={260}>
        <p className="text-ink mt-6 font-medium">
          Our goal is simple: help you apply with more confidence and better
          preparation.
        </p>
      </Reveal>
    </section>
  );
}
