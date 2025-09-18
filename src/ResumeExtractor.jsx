import React, { useState } from "react";
// Dynamically load GoogleGenAI
const genaiUrl = "https://aistudiocdn.com/@google/genai@^1.20.0";
let GoogleGenAI = null;
const loadGenAILibrary = async () => {
  if (!GoogleGenAI) {
    const module = await import(/* @vite-ignore */ genaiUrl);
    GoogleGenAI = module.GoogleGenAI;
  }
  return GoogleGenAI;
};
const API_KEY = "AIzaSyAHW-ptNdmm3hrLatlviFF0oLBGzL6-B70"; // Replace with your Gemini API key

// Helper: extract text from image using Tesseract.js
const extractTextFromImage = async (file) => {
  const Tesseract = await import("tesseract.js");
  const { data: { text } } = await Tesseract.recognize(file, "eng");
  return text;
};
// Helper: extract text from PDF using pdfjs-dist
const extractTextFromPDF = async (file) => {
  const pdfjsLib = await import("pdfjs-dist/build/pdf");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(" ") + "\n";
  }
  return text;
};
// Helper: extract text from DOCX using mammoth
const extractTextFromDocx = async (file) => {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const { value } = await mammoth.convertToHtml({ arrayBuffer });
  // Strip HTML tags
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
};

const ResumeExtractor = () => {
  const [resumeText, setResumeText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResumeText("");
    setResult("");
  };

  const handleExtract = async () => {
    setLoading(true);
    setResult("Extracting...");
    let text = resumeText;
    try {
      if (file) {
        const ext = file.name.split(".").pop().toLowerCase();
        if (["png", "jpg", "jpeg", "bmp", "gif", "webp"].includes(ext)) {
          text = await extractTextFromImage(file);
        } else if (ext === "pdf") {
          text = await extractTextFromPDF(file);
        } else if (["docx"].includes(ext)) {
          text = await extractTextFromDocx(file);
        } else {
          setResult("Unsupported file type.");
          setLoading(false);
          return;
        }
        setResumeText(text);
      }
      if (!text) {
        setResult("No text found to extract.");
        setLoading(false);
        return;
      }
      const GenAI = await loadGenAILibrary();
      const ai = new GenAI({ apiKey: API_KEY });
      const prompt = `Extract the following resume into structured JSON with keys: name, email, phone, education, experience, skills. Resume:\n${text}`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      setResult(response.text);
      // Log structured JSON to console
      console.log("Gemini Structured JSON:", response.text);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "white",
      padding: "2rem",
      borderRadius: "8px",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      maxWidth: "600px",
      margin: "2rem auto"
    }}>
      <h2>Resume Extractor (Gemini 2.5 Flash)</h2>
      <input
        type="file"
        accept=".pdf,.docx,image/*"
        onChange={handleFileChange}
        style={{ marginBottom: "1rem" }}
      />
      <textarea
        rows={10}
        style={{ width: "100%", padding: "10px", marginBottom: "1rem", borderRadius: "4px", border: "1px solid #ddd" }}
        placeholder="Paste resume text here..."
        value={resumeText}
        onChange={e => setResumeText(e.target.value)}
        disabled={!!file}
      />
      <button
        onClick={handleExtract}
        disabled={loading || (!resumeText && !file)}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#6200ea",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "1rem"
        }}
      >
        {loading ? "Extracting..." : "Extract Resume"}
      </button>
      <pre style={{
        whiteSpace: "pre-wrap",
        wordWrap: "break-word",
        backgroundColor: "#f9f9f9",
        padding: "1rem",
        borderRadius: "4px",
        border: "1px solid #eee",
        marginTop: "1rem"
      }}>
        {result || "Structured JSON will appear here..."}
      </pre>
    </div>
  );
};

export default ResumeExtractor;
