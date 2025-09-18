import React, { useState } from 'react';
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

function App() {
  // Step states
  const [step, setStep] = useState(1);
  // Resume states
  const [file, setFile] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [resumeRaw, setResumeRaw] = useState("");
  // GitHub states
  const [username, setUsername] = useState("");
  const [githubLoading, setGithubLoading] = useState(false);
  const [portfolio, setPortfolio] = useState(null);
  // Consolidation states
  const [consolidateLoading, setConsolidateLoading] = useState(false);
  const [finalJson, setFinalJson] = useState(null);

  // Step 1: Resume upload & extraction
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResumeText("");
    setResumeRaw("");
    setStep(1);
    setFinalJson(null);
  };

  const handleExtractResume = async () => {
    setResumeLoading(true);
    setResumeRaw("");
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
              text: "Extract and return only the raw text from this resume."
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
              text: "Extract and return only the raw text from this resume."
            }
          ];
        } else {
          setResumeRaw("Unsupported file type for direct vision extraction.");
          setResumeLoading(false);
          return;
        }
      } else {
        setResumeRaw("No file uploaded.");
        setResumeLoading(false);
        return;
      }
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents
      });
      setResumeRaw(response.text);
      setStep(2);
    } catch (error) {
      setResumeRaw(`Error: ${error.message}`);
    } finally {
      setResumeLoading(false);
    }
  };

  // Step 2: GitHub fetch
  const handleFetchGitHub = async () => {
    if (!username) return alert("Enter a GitHub username!");
    setGithubLoading(true);
    setPortfolio(null);
    try {
      const profileRes = await fetch(`https://api.github.com/users/${username}`);
      const profileRaw = await profileRes.json();
      const reposRes = await fetch(`https://api.github.com/users/${username}/repos`);
      const reposRaw = await reposRes.json();
      const profileData = {
        name: profileRaw.name ?? null,
        username: profileRaw.login ?? null,
        profilePic: profileRaw.avatar_url ?? null,
        bio: profileRaw.bio ?? null,
        location: profileRaw.location ?? null,
        githubUrl: profileRaw.html_url ?? null,
        website: profileRaw.blog || null,
        followers: profileRaw.followers ?? 0,
        following: profileRaw.following ?? 0,
        publicRepos: profileRaw.public_repos ?? 0,
      };
      const projects = Array.isArray(reposRaw)
        ? reposRaw.map(repo => ({
            title: repo.name ?? null,
            description: repo.description ?? null,
            techStack: repo.language ?? null,
            stars: repo.stargazers_count ?? 0,
            forks: repo.forks_count ?? 0,
            repoLink: repo.html_url ?? null,
          }))
        : [];
      const structuredData = {
        personal: profileData,
        projects,
      };
      setPortfolio(structuredData);
      setStep(3);
    } catch (error) {
      setPortfolio({ error: error.message });
    } finally {
      setGithubLoading(false);
    }
  };

  // Step 3: Consolidate and send to Gemini
  const handleConsolidate = async () => {
    setConsolidateLoading(true);
    setFinalJson(null);
    try {
      const GenAI = await loadGenAILibrary();
      const ai = new GenAI({ apiKey: API_KEY });
      // Compose prompt with both resume and GitHub data
      const prompt = `Given the following resume text and GitHub profile data, extract and return only the most useful information in a single JSON object.\n\nResume:\n${resumeRaw}\n\nGitHub:\n${JSON.stringify(portfolio, null, 2)}`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      setFinalJson(response.text);
    } catch (error) {
      setFinalJson(`Error: ${error.message}`);
    } finally {
      setConsolidateLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Portfolio Generator</h2>
      {/* Step 1: Resume Upload */}
      <div style={{ marginBottom: '2rem', background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
        <h3>Step 1: Upload your resume</h3>
        <input type="file" accept=".pdf,image/*" onChange={handleFileChange} style={{ marginBottom: '1rem' }} />
        <button onClick={handleExtractResume} disabled={!file || resumeLoading} style={{ marginLeft: '1rem', padding: '8px 16px', background: '#6200ea', color: 'white', border: 'none', borderRadius: '4px', cursor: resumeLoading ? 'not-allowed' : 'pointer' }}>
          {resumeLoading ? 'Extracting...' : 'Extract Resume'}
        </button>
        {resumeLoading && <div style={{ marginTop: '1rem' }}><ProgressBar label="Extracting resume..." /></div>}
        {resumeRaw && <pre style={{ marginTop: '1rem', background: '#f9f9f9', padding: '1rem', borderRadius: '4px', border: '1px solid #eee', whiteSpace: 'pre-wrap' }}>{resumeRaw}</pre>}
      </div>

      {/* Step 2: GitHub Username */}
      {step >= 2 && (
        <div style={{ marginBottom: '2rem', background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
          <h3>Step 2: Enter your GitHub username</h3>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="GitHub username" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', marginRight: '1rem' }} />
          <button onClick={handleFetchGitHub} disabled={!username || githubLoading} style={{ padding: '8px 16px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: githubLoading ? 'not-allowed' : 'pointer' }}>
            {githubLoading ? 'Fetching...' : 'Fetch GitHub Data'}
          </button>
          {githubLoading && <div style={{ marginTop: '1rem' }}><ProgressBar label="Fetching GitHub data..." /></div>}
          {portfolio && (
            <div style={{ marginTop: '1rem' }}>
              <pre style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '4px', border: '1px solid #eee', whiteSpace: 'pre-wrap' }}>{JSON.stringify(portfolio, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Consolidate and send to LLM */}
      {step === 3 && portfolio && resumeRaw && (
        <div style={{ marginBottom: '2rem', background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
          <h3>Step 3: Consolidate and get useful JSON</h3>
          <button onClick={handleConsolidate} disabled={consolidateLoading} style={{ padding: '8px 16px', background: '#43a047', color: 'white', border: 'none', borderRadius: '4px', cursor: consolidateLoading ? 'not-allowed' : 'pointer' }}>
            {consolidateLoading ? 'Processing...' : 'Get JSON'}
          </button>
          {consolidateLoading && <div style={{ marginTop: '1rem' }}><ProgressBar label="Consolidating data..." /></div>}
          {finalJson && (
            <div style={{ marginTop: '1rem' }}>
              <pre style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '4px', border: '1px solid #eee', whiteSpace: 'pre-wrap' }}>{finalJson}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );

}

// Simple progress bar component
function ProgressBar({ label }) {
  return (
    <div style={{ width: '100%', background: '#eee', borderRadius: '4px', overflow: 'hidden', height: '18px', position: 'relative' }}>
      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #6200ea 40%, #b39ddb 100%)', animation: 'progressBarAnim 1.2s infinite linear' }} />
      <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.9rem', color: '#fff', fontWeight: 'bold' }}>{label}</span>
      <style>{`
        @keyframes progressBarAnim {
          0% { background-position: 0 0; }
          100% { background-position: 200px 0; }
        }
      `}</style>
    </div>
  );
}

export default App;
