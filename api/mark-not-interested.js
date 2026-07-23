import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

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
  const { jobId } = req.body || {};

  if (!jobId || typeof jobId !== "string") {
    return res.status(400).json({ error: "jobId is required." });
  }

  try {
    const oppRef = db.collection("opportunities").doc(uid);
    const oppSnap = await oppRef.get();

    if (!oppSnap.exists) {
      return res.status(404).json({ error: "No opportunities found for this user." });
    }

    const jobs = oppSnap.data().jobs || [];
    const filtered = jobs.filter((j) => j.jobId !== jobId);

    if (filtered.length === jobs.length) {
      return res.status(404).json({ error: "Job not found in today's opportunities." });
    }

    await oppRef.update({ jobs: filtered });

    // Remember the dismissal so this same listing doesn't get re-fetched
    // and re-scored tomorrow — Adzuna often keeps a posting active for
    // days, and nothing about "not interested" should be temporary.
    await db
      .collection("users")
      .doc(uid)
      .update({ dismissedJobIds: FieldValue.arrayUnion(jobId) });

    // The SkillUp roadmap is a separate cache, only rebuilt on the next
    // daily pipeline run — without this, a dismissed job's roadmap items
    // would keep showing there until tomorrow even though the job itself
    // is already gone from Opportunities.
    const skillupRef = db.collection("skillup").doc(uid);
    const skillupSnap = await skillupRef.get();
    if (skillupSnap.exists) {
      const roadmap = skillupSnap.data().roadmap || [];
      const filteredRoadmap = roadmap.filter((r) => r.jobId !== jobId);
      if (filteredRoadmap.length !== roadmap.length) {
        await skillupRef.update({ roadmap: filteredRoadmap });
      }
    }

    return res.status(200).json({ jobs: filtered });
  } catch (err) {
    console.error("mark-not-interested error:", err);
    return res.status(500).json({ error: "Failed to remove this job. Please try again." });
  }
}