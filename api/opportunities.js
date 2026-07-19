import { GoogleGenAI, Type } from "@google/genai";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Reuse the Firebase Admin instance across warm invocations.
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- Config -----------------------------------------------------------
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;
const ADZUNA_COUNTRY = process.env.ADZUNA_COUNTRY || "in"; // e.g. "in", "us", "gb"
const MAX_JOBS = 5;

// --- Retry helper (same pattern as generate-summary.js) ---------------
async function generateWithRetry(params, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err) {
      const status = err?.status || err?.error?.code;
      const isRetryable = status === 503 || status === 429;
      const isLastAttempt = attempt === maxRetries - 1;

      console.warn(
        `Gemini attempt ${attempt + 1} failed (status ${status}). ` +
        (isRetryable && !isLastAttempt ? "Retrying..." : "Giving up.")
      );

      if (!isRetryable || isLastAttempt) throw err;

      const delayMs = 1000 * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

// --- Step 1: Fetch jobs from Adzuna ------------------------------------
async function fetchJobs(targetedRole) {
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    throw new Error("Adzuna credentials are not configured on the server.");
  }

  const url = new URL(
    `https://api.adzuna.com/v1/api/jobs/${ADZUNA_COUNTRY}/search/1`
  );
  url.searchParams.set("app_id", ADZUNA_APP_ID);
  url.searchParams.set("app_key", ADZUNA_APP_KEY);
  url.searchParams.set("what", targetedRole);
  url.searchParams.set("results_per_page", String(MAX_JOBS));
  url.searchParams.set("content-type", "application/json");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Adzuna request failed with status ${response.status}`);
  }

  const data = await response.json();
  const results = Array.isArray(data.results) ? data.results : [];

  return results.slice(0, MAX_JOBS).map((job, i) => ({
    jobId: job.id ? String(job.id) : `job-${i}`,
    title: job.title || "Untitled role",
    company: job.company?.display_name || "Unknown company",
    location: job.location?.display_name || "Not specified",
    description: job.description || "",
    url: job.redirect_url || null,
  }));
}

// --- Step 2: Score all jobs against the resume in ONE Gemini call -----
const scoringResponseSchema = {
  type: Type.OBJECT,
  properties: {
    results: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          jobId: { type: Type.STRING },
          score: { type: Type.NUMBER },
          matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          resumeSuggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description:
              "Only fill this in if score is between 90 and 95 inclusive. Otherwise return an empty array.",
          },
          skillRoadmap: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                skill: { type: Type.STRING },
                why: { type: Type.STRING },
                resources: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["skill", "why", "resources"],
            },
            description:
              "Only fill this in if score is below 90. Otherwise return an empty array.",
          },
        },
        required: [
          "jobId",
          "score",
          "matchedSkills",
          "missingSkills",
          "resumeSuggestions",
          "skillRoadmap",
        ],
      },
    },
  },
  required: ["results"],
};

async function scoreJobs(resumeSummary, jobs) {
  const jobsBlock = jobs
    .map(
      (j) =>
        `jobId: ${j.jobId}\nTitle: ${j.title}\nCompany: ${j.company}\nDescription:\n${j.description}`
    )
    .join("\n\n---\n\n");

  const prompt = `You are an ATS (Applicant Tracking System) matching engine for a job platform.

Compare the candidate's resume summary against EACH job listing below and, for every job, produce:
- score: an ATS match score from 0 to 100 (integer), based on how well the candidate's skills and experience fit the job description.
- matchedSkills: skills/requirements from the job description that the candidate already has.
- missingSkills: skills/requirements from the job description that the candidate is missing.
- resumeSuggestions: ONLY if score is between 90 and 95 (inclusive) — 3-5 concrete, specific edits the candidate could make to their resume to close the gap and raise the score. Otherwise return [].
- skillRoadmap: ONLY if score is below 90 — a short prioritized list of the most important missing skills, each with a one-sentence reason it matters for this role and 1-2 concrete learning resources (course names, certifications, or project ideas — not fake URLs). Otherwise return [].

Be honest and specific. Do not inflate scores. Base everything only on the text provided.

Candidate resume summary:
"""
${resumeSummary}
"""

Jobs to evaluate:
"""
${jobsBlock}
"""`;

  const response = await generateWithRetry({
    model: "gemini-flash-latest",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: scoringResponseSchema,
    },
  });

  const parsed = JSON.parse(response.text);
  return parsed.results || [];
}

// --- Step 3: Route by score --------------------------------------------
function classify(score) {
  if (score > 95) return "apply_now";
  if (score >= 90) return "resume_fix";
  return "skill_gap";
}

// --- Step 4: Email alert (STUB — wire up a real provider) --------------
async function sendApplyNowEmail({ toEmail, fullName, job, score }) {
  // TODO: replace with a real provider. Example using Resend:
  //
  // await fetch("https://api.resend.com/emails", {
  //   method: "POST",
  //   headers: {
  //     Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     from: "MyCareerCop <alerts@yourdomain.com>",
  //     to: toEmail,
  //     subject: `${score}% match: ${job.title} at ${job.company}`,
  //     html: `<p>Hi ${fullName},</p><p>This is a near-perfect match (${score}%). Apply now:</p><p><a href="${job.url}">${job.title} at ${job.company}</a></p>`,
  //   }),
  // });

  console.log(
    `[EMAIL STUB] Would send "apply now" alert to ${toEmail} for ${job.title} (${score}%)`
  );
}

// --- Cache freshness check ----------------------------------------------
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours, rolling

function isFreshToday(lastFetchedAt) {
  if (!lastFetchedAt) return false;
  const last = lastFetchedAt.toDate ? lastFetchedAt.toDate() : new Date(lastFetchedAt);
  const elapsed = Date.now() - last.getTime();
  return elapsed < CACHE_DURATION_MS;
}

// --- Handler --------------------------------------------------------------
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 1. Auth
  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) {
    return res.status(401).json({ error: "Missing authentication token." });
  }

  let decodedToken;
  try {
    decodedToken = await getAuth().verifyIdToken(idToken);
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ error: "Invalid or expired session. Please log in again." });
  }

  const uid = decodedToken.uid;
  const forceRefresh = req.query?.refresh === "true";

  try {
    // 2. Check cache first
    const oppRef = db.collection("opportunities").doc(uid);
    const oppSnap = await oppRef.get();

    if (!forceRefresh && oppSnap.exists) {
      const cached = oppSnap.data();
      if (isFreshToday(cached.lastFetchedAt)) {
        return res.status(200).json({ jobs: cached.jobs, cached: true });
      }
    }

    // 3. Load user profile
    const userSnap = await db.collection("users").doc(uid).get();
    if (!userSnap.exists) {
      return res.status(404).json({ error: "User profile not found." });
    }
    const user = userSnap.data();
    const { targetedRole, resumeSummary, email, fullName } = user;

    if (!targetedRole || !resumeSummary) {
      return res.status(400).json({
        error: "Profile is incomplete. Target role and resume summary are required.",
      });
    }

    // 4. Fetch jobs
    const jobs = await fetchJobs(targetedRole);
    if (jobs.length === 0) {
      await oppRef.set({ jobs: [], lastFetchedAt: new Date() });
      return res.status(200).json({ jobs: [], cached: false });
    }

    // 5. Score jobs (one Gemini call for all of them)
    const scored = await scoreJobs(resumeSummary, jobs);

    // 6. Merge scoring results back onto job objects + route by score
    const resultsById = new Map(scored.map((r) => [r.jobId, r]));
    const previousJobsById = new Map(
      (oppSnap.exists ? oppSnap.data().jobs : []).map((j) => [j.jobId, j])
    );

    const finalJobs = [];
    for (const job of jobs) {
      const scoring = resultsById.get(job.jobId);
      if (!scoring) {
        console.warn(`No scoring result for job ${job.jobId}, skipping.`);
        continue;
      }

      const action = classify(scoring.score);
      const previous = previousJobsById.get(job.jobId);

      const entry = {
        ...job,
        score: scoring.score,
        matchedSkills: scoring.matchedSkills,
        missingSkills: scoring.missingSkills,
        action,
        resumeSuggestions: action === "resume_fix" ? scoring.resumeSuggestions : [],
        skillRoadmap: action === "skill_gap" ? scoring.skillRoadmap : [],
        alertSent: previous?.alertSent || false,
        applied: previous?.applied || false,
        opened: previous?.opened || false,
      };

      // 7. Send email alert once per job (idempotent)
      if (action === "apply_now" && !entry.alertSent) {
        try {
          await sendApplyNowEmail({ toEmail: email, fullName, job, score: scoring.score });
          entry.alertSent = true;
        } catch (err) {
          console.error(`Failed to send alert email for job ${job.jobId}:`, err);
        }
      }

      finalJobs.push(entry);
    }

    // 8. Cache to Firestore
    await oppRef.set({ jobs: finalJobs, lastFetchedAt: new Date() });

    // 9. Also write the aggregated skill roadmap for the SkillUp tab
    const roadmapEntries = finalJobs
      .filter((j) => j.action === "skill_gap")
      .flatMap((j) => j.skillRoadmap.map((r) => ({ ...r, jobId: j.jobId, jobTitle: j.title })));

    await db
      .collection("skillup")
      .doc(uid)
      .set({ roadmap: roadmapEntries, updatedAt: new Date() });

    return res.status(200).json({ jobs: finalJobs, cached: false });
  } catch (err) {
    console.error("Opportunities pipeline error:", err);
    return res.status(500).json({
      error: "Failed to load opportunities. Please try again.",
    });
  }
}