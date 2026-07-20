import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

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

// Wipes cached job matches + skill roadmap so the next visit to
// Opportunities triggers a fresh fetch/score cycle against the new role,
// instead of showing stale matches for up to 24 hours.
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

  try {
    await Promise.all([
      db.collection("opportunities").doc(uid).delete(),
      db.collection("skillup").doc(uid).delete(),
    ]);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("invalidate-opportunities error:", err);
    return res.status(500).json({ error: "Failed to refresh your matches. Please try again." });
  }
}