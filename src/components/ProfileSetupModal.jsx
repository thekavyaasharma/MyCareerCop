import { useEffect, useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { extractResumeText } from "../lib/resumeParser";
import MagneticButton from "./MagneticButton";

const CURRENT_YEAR = new Date().getFullYear();
const PASSING_YEARS = Array.from({ length: 12 }, (_, i) => CURRENT_YEAR + 4 - i);

const DEGREES = [
  "B.Tech", "B.E.", "BCA", "B.Sc", "BBA", "B.Com",
  "M.Tech", "M.E.", "MCA", "M.Sc", "MBA", "Other",
];

const PROFESSIONS = ["Student", "Fresher", "Working Professional"];

// Grouped, constrained list of roles. Adding a role here is the ONLY way
// it becomes selectable — keeps Adzuna search queries clean and valid.
const TARGETED_ROLE_GROUPS = {
  "Software & Engineering": [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Mobile App Developer",
    "DevOps Engineer",
    "Site Reliability Engineer",
    "QA / Test Engineer",
    "Cloud Engineer",
    "Cybersecurity Analyst",
    "Embedded Systems Engineer",
  ],
  "Data & AI": [
    "Data Analyst",
    "Data Engineer",
    "Data Scientist",
    "Machine Learning Engineer",
    "Business Intelligence Analyst",
  ],
  "Core Engineering": [
    "Mechanical Engineer",
    "Civil Engineer",
    "Electrical Engineer",
    "Electronics Engineer",
    "Chemical Engineer",
  ],
  "Business & Finance": [
    "Business Analyst",
    "Financial Analyst",
    "Accountant",
    "Product Manager",
    "Operations Manager",
    "Management Trainee",
    "Sales Executive",
    "HR Executive",
  ],
  "Design & Marketing": [
    "UI/UX Designer",
    "Graphic Designer",
    "Content Writer",
    "Digital Marketing Specialist",
  ],
};

const STAGE_LABELS = {
  extracting: "Reading your resume…",
  summarizing: "Analyzing your resume with AI…",
  saving: "Saving your profile…",
};

export default function ProfileSetupModal({ onClose, onComplete }) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState("idle");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: auth.currentUser?.displayName || "",
    university: "",
    branch: "",
    degree: "",
    passingYear: "",
    cgpa: "",
    profession: "",
    targetedRole: "",
  });

  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = "";
    };
  }, []);

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validateStep1() {
    const {
      fullName, university, branch, degree,
      passingYear, cgpa, profession, targetedRole,
    } = form;

    if (!fullName.trim()) return "Enter your full name.";
    if (!university.trim()) return "Enter your university/college name.";
    if (!branch.trim()) return "Enter your branch/specialization.";
    if (!degree) return "Select your degree.";
    if (!passingYear) return "Select your passing year.";
    if (!cgpa || Number(cgpa) < 0 || Number(cgpa) > 10)
      return "Enter a valid CGPA between 0 and 10.";
    if (!profession) return "Select your current profession.";
    if (!targetedRole) return "Select a targeted role.";
    return "";
  }

  function handleNext(e) {
    e.preventDefault();
    const err = validateStep1();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setStep(2);
  }

  function handleResumeChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isValidType = /\.(pdf|docx)$/i.test(file.name);
    if (!isValidType) {
      setError("Please upload a PDF or DOCX file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Resume must be under 5MB.");
      return;
    }
    setError("");
    setResumeFile(file);
  }

  async function handleFinish() {
    if (!resumeFile) {
      setError("Please upload your resume to continue.");
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      setError("You're not signed in. Please log in again.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      setStage("extracting");
      const resumeText = await extractResumeText(resumeFile);

      setStage("summarizing");
      const idToken = await user.getIdToken();
      const res = await fetch("/api/generate-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ resumeText }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to analyze your resume. Please try again.");
      }

      const { summary } = await res.json();

      setStage("saving");
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email,
          fullName: form.fullName.trim(),
          university: form.university.trim(),
          branch: form.branch.trim(),
          degree: form.degree,
          passingYear: Number(form.passingYear),
          cgpa: Number(form.cgpa),
          profession: form.profession,
          targetedRole: form.targetedRole,
          resumeFileName: resumeFile.name,
          resumeSummary: summary,
          profileComplete: true,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      onComplete?.();
      onClose?.();
    } catch (err) {
      console.error("Profile setup error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
      setStage("idle");
    }
  }

  const inputClass =
    "w-full bg-void border border-line rounded-lg px-4 py-2.5 text-sm text-ink placeholder:text-ink-dim focus:outline-none focus:border-signal/60";

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full max-w-md bg-surface border border-line rounded-2xl p-7 transition-all duration-300 ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <button
          onClick={onClose}
          data-cursor-hover
          aria-label="Close"
          disabled={submitting}
          className="absolute top-4 right-4 text-ink-dim hover:text-ink transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-ink-dim">Step {step} of 2</span>
          <div className="flex-1 h-1 bg-line rounded-full overflow-hidden ml-2">
            <div
              className="h-full bg-signal transition-all duration-300"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>
        </div>

        <h3 className="font-display text-2xl text-ink mt-3">
          {step === 1 ? "Complete your profile" : "Upload your resume"}
        </h3>
        <p className="text-ink-dim text-sm mt-2">
          {step === 1
            ? "This helps our AI match you with the right roles."
            : "We'll extract and summarize it \u2014 the file itself is never stored."}
        </p>

        {error && (
          <div className="mt-4 text-sm text-signal bg-signal-dim border border-signal/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {step === 1 && (
          <form className="mt-6 space-y-3" onSubmit={handleNext}>
            <input
              type="text"
              placeholder="Full name"
              value={form.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="University / College name"
              value={form.university}
              onChange={(e) => updateField("university", e.target.value)}
              className={inputClass}
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                value={form.degree}
                onChange={(e) => updateField("degree", e.target.value)}
                className={inputClass}
              >
                <option value="" disabled>Degree</option>
                {DEGREES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Branch (e.g. CSE)"
                value={form.branch}
                onChange={(e) => updateField("branch", e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <select
                value={form.passingYear}
                onChange={(e) => updateField("passingYear", e.target.value)}
                className={inputClass}
              >
                <option value="" disabled>Passing year</option>
                {PASSING_YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                placeholder="CGPA"
                value={form.cgpa}
                onChange={(e) => updateField("cgpa", e.target.value)}
                className={inputClass}
              />
            </div>

            <select
              value={form.profession}
              onChange={(e) => updateField("profession", e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>Current profession</option>
              {PROFESSIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <select
              value={form.targetedRole}
              onChange={(e) => updateField("targetedRole", e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>Targeted role</option>
              {Object.entries(TARGETED_ROLE_GROUPS).map(([group, roles]) => (
                <optgroup key={group} label={group}>
                  {roles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className="text-xs text-ink-dim -mt-1">
              One role only \u2014 this is what our AI searches for on your behalf.
            </p>

            <MagneticButton
              type="submit"
              className="btn-primary w-full justify-center mt-2"
            >
              Next
            </MagneticButton>
          </form>
        )}

        {step === 2 && (
          <div className="mt-6 space-y-4">
            <label
              htmlFor="resume-upload"
              data-cursor-hover
              className="flex flex-col items-center justify-center gap-2 border border-dashed border-line rounded-xl px-4 py-10 cursor-pointer hover:border-signal/60 transition-colors text-center"
            >
              <span className="text-ink text-sm font-medium">
                {resumeFile ? resumeFile.name : "Click to upload your resume"}
              </span>
              <span className="text-ink-dim text-xs">PDF or DOCX, up to 5MB</span>
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.docx"
                onChange={handleResumeChange}
                className="hidden"
                disabled={submitting}
              />
            </label>

            {submitting && stage !== "idle" && (
              <div className="flex items-center gap-2 text-sm text-scan">
                <span className="h-1.5 w-1.5 rounded-full bg-scan animate-pulse" />
                {STAGE_LABELS[stage]}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                data-cursor-hover
                onClick={() => setStep(1)}
                disabled={submitting}
                className="btn-ghost flex-1 justify-center text-sm disabled:opacity-60"
              >
                Back
              </button>
              <MagneticButton
                type="button"
                onClick={handleFinish}
                disabled={submitting}
                className="btn-primary flex-1 justify-center disabled:opacity-60"
              >
                {submitting ? "Please wait…" : "Finish"}
              </MagneticButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}