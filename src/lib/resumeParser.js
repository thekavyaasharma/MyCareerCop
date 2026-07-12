import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerSrc;

async function extractPdfText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let text = "";
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ") + "\n";
  }
  return text.trim();
}

async function extractDocxText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

/**
 * Extracts plain text from a PDF or DOCX resume file, entirely client-side.
 * Throws a user-friendly error for unsupported types or empty results.
 */
export async function extractResumeText(file) {
  const ext = file.name.split(".").pop()?.toLowerCase();

  let text = "";
  if (ext === "pdf") {
    text = await extractPdfText(file);
  } else if (ext === "docx") {
    text = await extractDocxText(file);
  } else {
    throw new Error(
      "Unsupported file type. Please upload a PDF or DOCX resume (legacy .doc files aren't supported)."
    );
  }

  if (!text || text.trim().length < 50) {
    throw new Error(
      "We couldn't read enough text from that file. If it's a scanned/image-based PDF, try a text-based export instead."
    );
  }

  return text;
}