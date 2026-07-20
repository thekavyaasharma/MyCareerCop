import { useEffect, useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { CircleCheck, AlertCircle, FileText, Upload } from "lucide-react";
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

const TARGETED_ROLE_GROUPS = {
  "Software & Engineering": [
    "Software Engineer", "Frontend Developer", "Backend Developer",
    "Full Stack Developer", "Mobile App Developer", "DevOps Engineer",
    "Site Reliability Engineer", "QA / Test Engineer", "Cloud Engineer",
    "Cybersecurity Analyst", "Embedded Systems Engineer",
  ],
  "Data & AI": [
    "Data Analyst", "Data Engineer", "Data Scientist",
    "Machine Learning Engineer", "Business Intelligence Analyst",
  ],
  "Core Engineering": [
    "Mechanical Engineer", "Civil Engineer", "Electrical Engineer",
    "Electronics Engineer", "Chemical Engineer",
  ],
  "Business & Finance": [
    "Business Analyst", "Financial Analyst", "Accountant",
    "Product Manager", "Operations Manager", "Management Trainee",
    "Sales Executive", "HR Executive",
  ],
  "Design & Marketing": [
    "UI/UX Designer", "Graphic Designer", "Content Writer",
    "Digital Marketing Specialist",
  ],
};

const inputClass =
  "w-full bg-void border border-line rounded-lg px-4 py-2.5 text-sm text-ink placeholder:text-ink-dim focus:outline-none focus:border-signal/60";

export default function Profile({ user, profile }) {
  const [form, setForm] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });

  const [resumeStage, setResumeStage] = useState("idle"); // idle | extracting | summarizing | saving
  const [resumeMsg, setResumeMsg] = useState({ type: "", text: "" });

  // Initialize form once the profile has loaded. Doesn't re-sync on every
  // profile change, so it won't clobber the user's in-progress edits if
  // something else (like a resume upload) updates the doc mid-edit.
  useEffect(() => {
    if (profile && !form) {
      setForm({
        fullName: profile.fullName || "",
        university: profile.university || "",
        branch: profile.branch || "",
        degree: profile.degree || "",
        passingYear: profile.passingYear ? String(profile.passingYear) : "",
        cgpa: profile.cgpa != null ? String(profile.cgpa) : "",
        profession: profile.profession || "",
        targetedRole: profile.targetedRole || "",
      });
    }
  }, [profile, form]);

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setProfileMsg({ type: "", text: "" });
  }

  function validate() {
    if (!form.fullName.trim()) return "Enter your full name.";
    if (!form.university.trim()) return "Enter your university/college name.";
    if (!form.branch.trim()) return "Enter your branch/specialization.";
    if (!form.degree) return "Select your degree.";
    if (!form.passingYear) return "Select your passing year.";
    if (!form.cgpa || Number(form.cgpa) < 0 || Number(form.cgpa) > 10)
      return "Enter a valid CGPA between 0 and 10.";
    if (!form.profession) return "Select your current profession.";
    if (!form.targetedRole) return "Select a targeted role.";
    return "";
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setProfileMsg({ type: "error", text: err });
      return;
    }

    setSavingProfile(true);
    setProfileMsg({ type: "", text: "" });
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          fullName: form.fullName.trim(),
          university: form.university.trim(),
          branch: form.branch.trim(),
          degree: form.degree,
          passingYear: Number(form.passingYear),
          cgpa: Number(form.cgpa),
          profession: form.profession,
          targetedRole: form.targetedRole,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // If the role changed, cached job matches are for the wrong role
      // now — clear them so the next Opportunities visit fetches fresh
      // instead of showing stale results for up to 24 hours.
      if (form.targetedRole !== profile?.targetedRole) {
        try {
          const idToken = await auth.currentUser.getIdToken();
          await fetch("/api/invalidate-opportunities", {
            method: "POST",
            headers: { Authorization: `Bearer ${idToken}` },
          });
        } catch (err) {
          // Non-fatal — the profile itself saved fine. Worst case, the
          // user sees stale matches until the normal 24h cache expires.
          console.error("Failed to invalidate stale opportunities:", err);
        }
      }

      setProfileMsg({ type: "success", text: "Profile updated." });
    } catch (err) {
      console.error("Failed to save profile:", err);
      setProfileMsg({ type: "error", text: "Couldn't save your changes. Please try again." });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleResumeChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isValidType = /\.(pdf|docx)$/i.test(file.name);
    if (!isValidType) {
      setResumeMsg({ type: "error", text: "Please upload a PDF or DOCX file." });
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setResumeMsg({ type: "error", text: "Resume must be under 5MB." });
      e.target.value = "";
      return;
    }

    setResumeMsg({ type: "", text: "" });

    try {
      setResumeStage("extracting");
      const resumeText = await extractResumeText(file);

      setResumeStage("summarizing");
      const idToken = await auth.currentUser.getIdToken();
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

      setResumeStage("saving");
      // Only touches resume fields — won't overwrite unsaved edits in the
      // form above, since those live in separate keys.
      await setDoc(
        doc(db, "users", user.uid),
        {
          resumeFileName: file.name,
          resumeSummary: summary,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setResumeMsg({ type: "success", text: "Resume updated and re-analyzed." });
    } catch (err) {
      console.error("Resume update error:", err);
      setResumeMsg({ type: "error", text: err.message || "Something went wrong. Please try again." });
    } finally {
      setResumeStage("idle");
      e.target.value = "";
    }
  }

  if (!form) {
    return (
      <div className="px-6 py-10 max-w-4xl mx-auto">
        <div className="bg-surface border border-line rounded-2xl p-8 text-center text-sm text-ink-dim">
          Loading your profile…
        </div>
      </div>
    );
  }

  const resumeStageLabel = {
    extracting: "Reading your resume…",
    summarizing: "Analyzing with AI…",
    saving: "Saving…",
  }[resumeStage];

  return (
    <div className="px-6 py-10 max-w-4xl mx-auto">
      <h1 className="font-display text-3xl text-ink mb-2">Profile</h1>
      <p className="text-ink-dim text-sm mb-8">
        Manage your resume, targeted role, and account details.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile details form */}
        <div className="lg:col-span-2 bg-surface border border-line rounded-2xl p-6">
          <h2 className="font-display text-lg text-ink mb-4">Personal details</h2>

          {profileMsg.text && (
            <div
              className={`mb-4 text-sm rounded-lg px-3 py-2 flex items-center gap-2 ${
                profileMsg.type === "error"
                  ? "text-signal bg-signal-dim border border-signal/30"
                  : "text-emerald-700 bg-emerald-50 border border-emerald-100"
              }`}
            >
              {profileMsg.type === "error" ? <AlertCircle size={14} /> : <CircleCheck size={14} />}
              {profileMsg.text}
            </div>
          )}

          <form className="space-y-3" onSubmit={handleSaveProfile}>
            <input
              type="text"
              placeholder="Full name"
              value={form.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              className={inputClass}
            />

            <input
              type="email"
              value={user?.email || ""}
              disabled
              className={`${inputClass} opacity-60 cursor-not-allowed`}
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

            <MagneticButton
              type="submit"
              disabled={savingProfile}
              className="btn-primary w-full justify-center mt-2 disabled:opacity-60"
            >
              {savingProfile ? "Saving…" : "Save changes"}
            </MagneticButton>
          </form>
        </div>

        {/* Resume section */}
        <div className="bg-surface border border-line rounded-2xl p-6 h-fit">
          <h2 className="font-display text-lg text-ink mb-4">Resume</h2>

          {profile?.resumeFileName && (
            <div className="flex items-center gap-2 text-sm text-ink-dim mb-4 bg-ink/[0.03] rounded-lg px-3 py-2">
              <FileText size={14} className="shrink-0" />
              <span className="truncate">{profile.resumeFileName}</span>
            </div>
          )}

          {resumeMsg.text && (
            <div
              className={`mb-4 text-sm rounded-lg px-3 py-2 flex items-center gap-2 ${
                resumeMsg.type === "error"
                  ? "text-signal bg-signal-dim border border-signal/30"
                  : "text-emerald-700 bg-emerald-50 border border-emerald-100"
              }`}
            >
              {resumeMsg.type === "error" ? <AlertCircle size={14} /> : <CircleCheck size={14} />}
              {resumeMsg.text}
            </div>
          )}

          <label
            htmlFor="resume-replace"
            data-cursor-hover
            className="flex flex-col items-center justify-center gap-2 border border-dashed border-line rounded-xl px-4 py-8 cursor-pointer hover:border-signal/60 transition-colors text-center"
          >
            <Upload size={18} className="text-ink-dim" />
            <span className="text-ink text-sm font-medium">
              {resumeStage !== "idle" ? resumeStageLabel : "Upload a new resume"}
            </span>
            <span className="text-ink-dim text-xs">PDF or DOCX, up to 5MB</span>
            <input
              id="resume-replace"
              type="file"
              accept=".pdf,.docx"
              onChange={handleResumeChange}
              className="hidden"
              disabled={resumeStage !== "idle"}
            />
          </label>

          <p className="text-xs text-ink-dim mt-3">
            Uploading a new resume regenerates your AI summary immediately \u2014 the file
            itself is never stored.
          </p>
        </div>
      </div>
    </div>
  );
}