import React, { useMemo, useRef, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

// ----- Inline UI Components -----
function Header() {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
        <div className="text-2xl font-extrabold tracking-tight text-black select-none">
          Portfolio Generator
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-lg border border-black text-black bg-white hover:bg-gray-50 transition-colors duration-200" type="button">
            Log In
          </button>
          <button className="px-4 py-2 rounded-lg bg-lime-300 text-black font-medium hover:bg-lime-400 transition-colors duration-200" type="button">
            Sign Up
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-5xl px-6 pt-16 pb-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-black">
          Build Your Professional Portfolio in Seconds.
        </h1>
        <p className="mt-5 text-lg md:text-xl text-gray-700 max-w-3xl">
          Upload your resume, connect your GitHub, and let AI generate a structured JSON portfolio for you.
        </p>
      </div>
    </section>
  );
}

function StepCard({ number, title, children }) {
  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-md p-8">
      <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-black mb-4">
        <span className="text-gray-500 mr-2">{number}.</span> {title}
      </h3>
      {children}
    </section>
  );
}

function ProgressBar({ label, color = "from-indigo-600 to-indigo-400" }) {
  return (
    <div className="w-full bg-gray-100 rounded-md overflow-hidden h-[18px] relative">
      <div className={`w-full h-full bg-gradient-to-r ${color} animate-[progressBarAnim_1.2s_linear_infinite]`} />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-sm font-bold">{label}</span>
      <style>{`
        @keyframes progressBarAnim {
          0% { background-position: 0 0; }
          100% { background-position: 200px 0; }
        }
      `}</style>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-16">
      <div className="mx-auto max-w-5xl px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Social</h4>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li><a className="hover:underline" href="#">Twitter</a></li>
            <li><a className="hover:underline" href="#">GitHub</a></li>
            <li><a className="hover:underline" href="#">LinkedIn</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Explore</h4>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li><a className="hover:underline" href="#">Documentation</a></li>
            <li><a className="hover:underline" href="#">Pricing</a></li>
            <li><a className="hover:underline" href="#">Blog</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Legal</h4>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li><a className="hover:underline" href="#">Privacy</a></li>
            <li><a className="hover:underline" href="#">Terms</a></li>
            <li><a className="hover:underline" href="#">Security</a></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-6 pb-10 flex items-center justify-between text-sm text-gray-600">
        <span>© 2025 Portfolio Generator</span>
        <a href="#top" className="hover:underline">Back to top</a>
      </div>
    </footer>
  );
}

// ----- Google GenAI loader -----
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
  let binary = "";
  let bytes = new Uint8Array(buffer);
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export default function App() {
  // Resume states
  const [file, setFile] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeRaw, setResumeRaw] = useState("");
  // GitHub states
  const [username, setUsername] = useState("");
  const [githubLoading, setGithubLoading] = useState(false);
  const [portfolio, setPortfolio] = useState(null);
  // Consolidation states
  const [consolidateLoading, setConsolidateLoading] = useState(false);
  const [finalJson, setFinalJson] = useState(null);
  // Template/Preview state (Step 4)
  const [selectedTemplate, setSelectedTemplate] = useState("template1");
  const previewRef = useRef(null);
  const templateSrc = useMemo(() => `/template/${selectedTemplate}.html`, [selectedTemplate]);

  // Drag & Drop (Step 1)
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);
  const fileLabel = useMemo(() => (file ? file.name : "Choose file"), [file]);

  const validMime = (f) => {
    const okTypes = [
      "application/pdf",
      "image/png",
      "image/jpg",
      "image/jpeg",
      "image/bmp",
      "image/gif",
      "image/webp",
    ];
    if (okTypes.includes(f.type)) return true;
    const name = f.name?.toLowerCase() || "";
    return /(\.pdf|\.png|\.jpe?g|\.bmp|\.gif|\.webp)$/.test(name);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!validMime(f)) {
      alert("Unsupported file. Please drop a PDF or image.");
      return;
    }
    setFile(f);
  };
  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const onClickDropzone = () => inputRef.current?.click();
  const onChangeFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!validMime(f)) {
      alert("Unsupported file. Please choose a PDF or image.");
      return;
    }
    setFile(f);
  };

  const dropzoneClasses = `rounded-xl border-2 border-dashed transition-colors duration-200 px-6 py-10 bg-white text-center cursor-pointer select-none ${
    isDragging ? "border-violet-600 bg-violet-50" : "border-gray-300 hover:border-violet-400"
  }`;
  const dropzoneHint = file ? "File ready. You can re-drop or choose another file." : "Drag & drop your resume here, or click to browse";

  // Step 1: Resume upload & extraction
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
            { inlineData: { mimeType: "application/pdf", data: arrayBufferToBase64(buffer) } },
            { text: "Extract and return only the raw text from this resume." },
          ];
        } else if (["png", "jpg", "jpeg", "bmp", "gif", "webp"].includes(ext)) {
          contents = [
            { inlineData: { mimeType: `image/${ext === "jpg" ? "jpeg" : ext}`, data: arrayBufferToBase64(buffer) } },
            { text: "Extract and return only the raw text from this resume." },
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
      const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents });
      setResumeRaw(response.text);
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
        ? reposRaw.map((repo) => ({
            title: repo.name ?? null,
            description: repo.description ?? null,
            techStack: repo.language ?? null,
            stars: repo.stargazers_count ?? 0,
            forks: repo.forks_count ?? 0,
            repoLink: repo.html_url ?? null,
          }))
        : [];
      const structuredData = { personal: profileData, projects };
      setPortfolio(structuredData);
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
      const prompt = `Given the following resume text and GitHub profile data, extract and return only the most useful information in a single JSON object.\n\nResume:\n${resumeRaw}\n\nGitHub:\n${JSON.stringify(portfolio, null, 2)}`;
      const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
      const text = response.text;
      setFinalJson(text);
      // Try to post to preview if already loaded
      tryPostToPreview(text);
    } catch (error) {
      setFinalJson(`Error: ${error.message}`);
    } finally {
      setConsolidateLoading(false);
    }
  };

  // Step 4 helpers: safely parse JSON from model and post to iframe template
  function safeParsePortfolio(maybeJson) {
    if (!maybeJson) return null;
    try {
      return typeof maybeJson === 'string' ? JSON.parse(maybeJson) : maybeJson;
    } catch (_) {
      // Attempt to extract JSON block from fenced code or text
      const match = String(maybeJson).match(/```json[\s\S]*?```|\{[\s\S]*\}$/);
      if (match) {
        const cleaned = match[0].replace(/```json|```/g, "");
        try { return JSON.parse(cleaned); } catch {}
      }
      return null;
    }
  }

  function tryPostToPreview(currentFinal) {
    const data = safeParsePortfolio(currentFinal ?? finalJson);
    const frame = previewRef.current;
    if (!data || !frame) return;
    // Post message to the iframe. Templates should be same-origin under /public.
    frame.contentWindow?.postMessage({ type: 'APPLY_PORTFOLIO', payload: data }, window.location.origin);
  }

  // Listen for templates requesting data (optional future use)
  React.useEffect(() => {
    const onMessage = (e) => {
      if (e.origin !== window.location.origin) return;
      if (e.data === 'REQUEST_PORTFOLIO') {
        tryPostToPreview();
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const copyFinalJson = async () => {
    try {
      await navigator.clipboard.writeText(String(finalJson ?? ""));
    } catch {}
  };

  return (
    <div id="top" className="min-h-screen bg-white text-[#111]">
      {/* Light grid background */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(17,17,17,.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,17,17,.06) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          backgroundPosition: "top left",
        }}
      />

      <Header />
      <Hero />

      <div className="mx-auto max-w-5xl px-6 space-y-10 pb-16">
        {/* Step 1 */}
        <StepCard number="1" title="Upload Your Resume">
          <label className="block text-sm font-medium text-gray-800 mb-3">Resume file</label>

          {/* Drop zone */}
          <div
            className={dropzoneClasses}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={onClickDropzone}
            role="button"
            aria-label="File dropzone"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClickDropzone();
              }
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={onChangeFile}
            />
            <div className="flex flex-col items-center gap-2">
              <div className="text-sm text-gray-600">{dropzoneHint}</div>
              <div className="text-sm text-gray-900 font-medium">{fileLabel}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap mt-4">
            <button
              onClick={handleExtractResume}
              disabled={!file || resumeLoading}
              className={`px-5 py-3 rounded-lg text-white font-medium transition-colors duration-200 ${
                !file || resumeLoading ? "bg-violet-300 cursor-not-allowed" : "bg-violet-600 hover:bg-violet-700"
              }`}
              type="button"
            >
              {resumeLoading ? "Extracting..." : "Extract Resume"}
            </button>
          </div>

          {resumeLoading && (
            <div className="mt-4">
              <ProgressBar label="Extracting resume..." color="from-violet-600 to-violet-400" />
            </div>
          )}

          {resumeRaw && (
            <div className="mt-4">
              <SyntaxHighlighter language="markdown" style={oneLight} customStyle={{ borderRadius: 12, padding: 16, border: "1px solid #e5e7eb" }}>
                {String(resumeRaw)}
              </SyntaxHighlighter>
            </div>
          )}
        </StepCard>

        {/* Step 2 */}
        <StepCard number="2" title="Connect Your GitHub">
          <label className="block text-sm font-medium text-gray-800 mb-2" htmlFor="gh-username">
            Enter your GitHub username
          </label>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              id="gh-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., torvalds"
              className="px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors duration-200 text-gray-900"
            />
            <button
              onClick={handleFetchGitHub}
              disabled={!username || githubLoading}
              className={`px-5 py-3 rounded-lg text-white font-medium transition-colors duration-200 ${
                !username || githubLoading ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
              type="button"
            >
              {githubLoading ? "Fetching..." : "Fetch GitHub Data"}
            </button>
          </div>

          {githubLoading && (
            <div className="mt-4">
              <ProgressBar label="Fetching GitHub data..." color="from-indigo-600 to-indigo-400" />
            </div>
          )}

          {portfolio && (
            <div className="mt-4">
              <SyntaxHighlighter language="json" style={oneLight} customStyle={{ borderRadius: 12, padding: 16, border: "1px solid #e5e7eb" }}>
                {JSON.stringify(portfolio, null, 2)}
              </SyntaxHighlighter>
            </div>
          )}
        </StepCard>

        {/* Step 3 */}
        <StepCard number="3" title="Generate Your Consolidated JSON">
          <button
            onClick={handleConsolidate}
            disabled={consolidateLoading || !resumeRaw || !portfolio}
            className={`px-6 py-3 rounded-lg text-black font-semibold transition-colors duration-200 ${
              consolidateLoading || !resumeRaw || !portfolio ? "bg-gray-300 cursor-not-allowed" : "bg-lime-300 hover:bg-lime-400"
            }`}
            type="button"
          >
            {consolidateLoading ? "Processing..." : "Get JSON"}
          </button>

          {consolidateLoading && (
            <div className="mt-4">
              <ProgressBar label="Consolidating data..." color="from-lime-400 to-lime-300" />
            </div>
          )}

          {finalJson && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Result</span>
                <button onClick={copyFinalJson} className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 transition-colors duration-200" type="button">
                  Copy to Clipboard
                </button>
              </div>
              <SyntaxHighlighter language="json" style={oneLight} customStyle={{ borderRadius: 12, padding: 16, border: "1px solid #e5e7eb" }}>
                {String(finalJson)}
              </SyntaxHighlighter>
            </div>
          )}
        </StepCard>

        {/* Step 4 */}
        <StepCard number="4" title="Choose a Template & Preview Portfolio">
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-sm text-gray-700">Template</label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 outline-none transition-colors duration-200 text-gray-900"
            >
              <option value="template1">Template 1</option>
              <option value="template2">Template 2</option>
              <option value="template3">Template 3</option>
            </select>

            <button
              onClick={() => tryPostToPreview()}
              disabled={!finalJson}
              className={`px-4 py-2 rounded-lg text-white font-medium transition-colors duration-200 ${
                !finalJson ? 'bg-gray-300 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-700'
              }`}
              type="button"
            >
              Apply Data
            </button>
          </div>

          <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden">
            <iframe
              ref={previewRef}
              title="Portfolio Preview"
              src={templateSrc}
              className="w-full h-[720px] bg-white"
              onLoad={() => tryPostToPreview()}
            />
          </div>
        </StepCard>
      </div>

      <Footer />
    </div>
  );
}
