// ResumeExtractor.jsx
import React, { useState } from "react";

export default function ResumeExtractor({ onDataExtracted }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleExtract = async () => {
    if (!file) return alert("Please upload a file!");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:5000/extract-resume", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      console.log("Extracted Data:", data);
      setExtractedData(data);
      if (onDataExtracted) onDataExtracted(data);

    } catch (err) {
      console.error(err);
      alert("Failed to extract resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept=".pdf,.jpg,.png,.jpeg" onChange={handleFileChange} />
      <button onClick={handleExtract} disabled={loading}>
        {loading ? "Extracting..." : "Extract Resume Data"}
      </button>
      {extractedData && <pre>{JSON.stringify(extractedData, null, 2)}</pre>}
    </div>
  );
}
