import Reveal from "./Reveal";
import Icon from "./Icon";

const AUDIENCE = [
  {
    icon: "graduate",
    title: "Students & Fresh Graduates",
    desc: "Start your career with personalized job recommendations and resume guidance.",
  },
  {
    icon: "briefcase",
    title: "Early Career Professionals",
    desc: "Find opportunities that better match your skills and improve your application quality.",
  },
  {
    icon: "repeat",
    title: "Career Switchers",
    desc: "Identify transferable skills, understand missing requirements, and prepare for your next role.",
  },
  {
    icon: "users",
    title: "Anyone Looking for Better Job Matches",
    desc: "Whether you're actively applying or exploring new opportunities, MyCareerCop helps you make informed decisions.",
  },
];

export default function Audience() {
  return (
    <section className="bg-surface/40 border-y border-line">
      <div className="max-w-[1200px] mx-auto px-6 py-20 md:py-28">
        <Reveal>
          <h2 className="font-display text-3xl md:text-4xl text-center text-ink">
            Built for Job Seekers
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
          {AUDIENCE.map((a, i) => (
            <Reveal key={a.title} delay={i * 90}>
              <div className="h-full text-center px-4">
                <div className="w-11 h-11 mx-auto rounded-full border border-line text-scan flex items-center justify-center">
                  <Icon name={a.icon} />
                </div>
                <h3 className="font-medium text-ink mt-5 text-sm">{a.title}</h3>
                <p className="text-ink-dim text-sm mt-2 leading-relaxed">{a.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
