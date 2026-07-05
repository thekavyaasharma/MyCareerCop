import Reveal from "./Reveal";
import Icon from "./Icon";

const FEATURES = [
  {
    icon: "upload",
    title: "Resume Parsing",
    desc: "Upload your PDF or DOCX resume once. myCareerCop automatically extracts your skills, work experience, and education into a structured candidate profile.",
  },
  {
    icon: "match",
    title: "AI Job Matching",
    desc: "We compare your profile with relevant job listings and identify opportunities that closely match your experience and career goals.",
  },
  {
    icon: "gauge",
    title: "ATS Compatibility Score",
    desc: "Understand how well your resume aligns with each job description using an AI-generated ATS match score and detailed feedback.",
  },
  {
    icon: "edit",
    title: "Resume Optimization",
    desc: "When your resume is close to a great match, myCareerCop suggests improvements by reorganizing and highlighting your existing experience — without adding false information.",
  },
  {
    icon: "target",
    title: "Skill Gap Analysis",
    desc: "Discover which important skills are missing for your target role and receive a simple roadmap to help you improve.",
  },
  {
    icon: "bell",
    title: "Job Alerts",
    desc: "Receive notifications when new matching opportunities become available so you can apply early.",
  },
];

export default function Features() {
  return (
    <section id="features" className="max-w-[1200px] mx-auto px-6 py-20 md:py-28">
      <Reveal>
        <h2 className="font-display text-3xl md:text-4xl text-center text-ink max-w-2xl mx-auto">
          Everything You Need for Smarter Job Applications
        </h2>
      </Reveal>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={i * 80}>
            <div className="h-full border border-line bg-surface rounded-2xl p-6 hover:border-white/20 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-signal-dim text-signal flex items-center justify-center">
                <Icon name={f.icon} />
              </div>
              <h3 className="font-medium text-ink mt-5">{f.title}</h3>
              <p className="text-ink-dim text-sm mt-2 leading-relaxed">{f.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
