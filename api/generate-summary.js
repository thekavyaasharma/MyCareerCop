import { GoogleGenAI } from "@google/genai";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

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

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MAX_INPUT_CHARS = 20000; // guards against oversized/abusive payloads

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 1. Verify the caller is a real, logged-in Firebase user.
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

  // 2. Validate the payload.
  const { resumeText } = req.body || {};
  if (!resumeText || typeof resumeText !== "string" || resumeText.trim().length < 50) {
    return res.status(400).json({ error: "Resume text is missing or too short." });
  }

  const trimmedText = resumeText.slice(0, MAX_INPUT_CHARS);

  // 3. Ask Gemini for a structured summary.
  const prompt = `You are analyzing a candidate's resume for a job-matching platform.
Read the resume text below and produce a clear, well-structured summary covering:
- Key skills (technical and soft skills)
- Work experience (roles, companies, durations, key achievements)
- Education
- Notable projects or certifications, if present
- A 2-3 sentence overall profile summary suitable for matching against job descriptions

Write in plain text with clear section headers. Do not invent information that isn't
present in the resume text. If a section has no information, omit it rather than guessing.

Resume text:
"""
${trimmedText}
"""`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
    });

    const summary = response.text?.trim();
    if (!summary) {
      throw new Error("Empty response from Gemini");
    }

    return res.status(200).json({ summary, uid: decodedToken.uid });
  } catch (err) {
    console.error("Gemini generation error:", err);
    return res.status(500).json({ error: "Failed to generate resume summary. Please try again." });
  }
}