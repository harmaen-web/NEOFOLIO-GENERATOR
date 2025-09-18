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


// Helper: convert ArrayBuffer to base64
function arrayBufferToBase64(buffer) {
  let binary = '';
  let bytes = new Uint8Array(buffer);
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

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
    try {
      const GenAI = await loadGenAILibrary();
      const ai = new GenAI({ apiKey: API_KEY });
      let contents = [];
      if (file) {
        const ext = file.name.split(".").pop().toLowerCase();
        const buffer = await file.arrayBuffer();
        if (ext === "pdf") {
          contents = [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: arrayBufferToBase64(buffer)
              }
            },
            {
              text: "Extract this resume into structured JSON with keys: name, email, phone, education, experience, skills."
            }
          ];
        } else if (["png", "jpg", "jpeg", "bmp", "gif", "webp"].includes(ext)) {
          contents = [
            {
              inlineData: {
                mimeType: `image/${ext === "jpg" ? "jpeg" : ext}`,
                data: arrayBufferToBase64(buffer)
              }
            },
            {
              text: "Extract this resume into structured JSON with keys: name, email, phone, education, experience, skills."
            }
          ];
        } else {
          setResult("Unsupported file type for direct vision extraction.");
          setLoading(false);
          return;
        }
      } else if (resumeText) {
        contents = resumeText;
      } else {
        setResult("No input provided.");
        setLoading(false);
        return;
      }
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents
      });
      setResult(response.text);
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
