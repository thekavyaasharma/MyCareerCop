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
    const idx = jobs.findIndex((j) => j.jobId === jobId);

    if (idx === -1) {
      return res.status(404).json({ error: "Job not found in today's opportunities." });
    }

    // Idempotent: only counts the first time this job is opened.
    if (jobs[idx].opened) {
      return res.status(200).json({ alreadyOpened: true });
    }

    jobs[idx] = {
      ...jobs[idx],
      opened: true,
      openedAt: new Date().toISOString(),
    };

    await oppRef.update({ jobs });
    await db
      .collection("users")
      .doc(uid)
      .update({ openedJobsCount: FieldValue.increment(1) });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("mark-opened error:", err);
    return res.status(500).json({ error: "Failed to record job open." });
  }
}