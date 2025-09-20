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
  const [ghToken, setGhToken] = useState("");
  const [githubLoading, setGithubLoading] = useState(false);
  const [ghError, setGhError] = useState("");
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
    setGhError("");
    setPortfolio(null);
    try {
      const headers = ghToken ? { Authorization: `Bearer ${ghToken}` } : {};

      // Profile
      const profileRes = await fetch(`https://api.github.com/users/${username}`, { headers });
      if (!profileRes.ok) {
        const rate = profileRes.headers.get('x-ratelimit-remaining');
        const reset = profileRes.headers.get('x-ratelimit-reset');
        throw new Error(`Profile fetch failed (${profileRes.status}). Rate left: ${rate ?? 'n/a'}${reset ? `, resets at ${new Date(+reset*1000).toLocaleTimeString()}` : ''}`);
      }
      const profileRaw = await profileRes.json();

      // Repos (first 100, sorted by updated)
      const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers });
      if (!reposRes.ok) {
        const rate = reposRes.headers.get('x-ratelimit-remaining');
        const reset = reposRes.headers.get('x-ratelimit-reset');
        throw new Error(`Repos fetch failed (${reposRes.status}). Rate left: ${rate ?? 'n/a'}${reset ? `, resets at ${new Date(+reset*1000).toLocaleTimeString()}` : ''}`);
      }
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
      setGhError(error.message || String(error));
      setPortfolio({ error: String(error) });
    } finally {
      setGithubLoading(false);
    }
  };

  // Step 3: Consolidate and send to Gemini (with strict schema)
  const handleConsolidate = async () => {
    setConsolidateLoading(true);
    setFinalJson(null);
    try {
      const GenAI = await loadGenAILibrary();
      const ai = new GenAI({ apiKey: API_KEY });
      const schema = `You are to return ONE JSON object ONLY (no markdown, no prose). Use EXACT keys and casing below. Normalize any synonyms from inputs into this schema. Use null for missing scalar fields and [] for empty lists.

Schema:
{
  "contact_information": {
    "name": string,
    "email": string|null,
    "phone": string|null,
    "linkedin_url": string|null,
    "github_url": string|null
  },
  "summary": string|null,
  "education": [ { "institution": string, "degree": string|null, "years": string|null, "cgpa": string|null } ],
  "experience": [ { "company": string, "role": string|null, "start_date": string|null, "end_date": string|null, "duration": string|null, "location": string|null, "responsibilities": string[] } ],
  "projects": [ { "title": string, "description": string|null, "technologies": string[], "live_demo": string|null, "github_link": string|null } ],
  "github_projects": [ { "title": string, "description": string|null, "tech_stack": string|null, "stars": number, "forks": number, "repo_link": string|null } ],
  "technical_skills": { "languages": string[], "frameworks_libraries": string[], "databases": string[], "authentication_apis": string[], "dev_tools": string[], "ai_cv_tools": string[] },
  "certificates": [ { "title": string, "date": string|null, "description": string|null } ],
  "achievements": string[],
  "github_profile_overview": { "username": string|null, "profile_pic": string|null, "followers": number, "following": number, "public_repos": number, "github_url": string|null }
}`;
      const prompt = `${schema}\n\nResume:\n${resumeRaw}\n\nGitHub:\n${JSON.stringify(portfolio, null, 2)}`;
      const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
      const text = response.text;
      const parsed = safeParsePortfolio(text);
      const normalized = normalizePortfolio(parsed);
      const pretty = JSON.stringify(normalized, null, 2);
      setFinalJson(pretty);
      // Try to post to preview if already loaded
      tryPostToPreview(pretty);
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

  // Normalization: map any variant keys to strict schema used by templates
  function normalizePortfolio(input) {
    if (!input || typeof input !== 'object') return null;

    const ci = input.contact_information || input.contactInfo || input.personal_info || input.personal || {};
    const gpo = input.github_profile_overview || {};

    const normalizeProjects = () => {
      const a = Array.isArray(input.projects) ? input.projects.map(p => ({
        title: p.title || p.name || null,
        description: p.description ?? null,
        technologies: Array.isArray(p.technologies) ? p.technologies : (p.tech_stack ? [p.tech_stack] : []),
        live_demo: p.live_demo ?? null,
        github_link: p.github_link || p.repoLink || p.repo_link || null,
        stars: Number(p.stars || 0),
        forks: Number(p.forks || 0),
      })) : [];
      const b = Array.isArray(input.github_projects) ? input.github_projects.map(p => ({
        title: p.title || p.name || null,
        description: p.description ?? null,
        technologies: p.technologies || (p.tech_stack ? [p.tech_stack] : []),
        live_demo: null,
        github_link: p.repo_link || p.github_link || null,
        stars: Number(p.stars || 0),
        forks: Number(p.forks || 0),
      })) : [];
      return [...a, ...b];
    };

    const out = {
      contact_information: {
        name: ci.name || ci.username || null,
        email: ci.email || null,
        phone: ci.phone || null,
        linkedin_url: ci.linkedin_url || ci.linkedin || null,
        github_url: ci.github_url || (ci.github && ci.github.profile_url) || null,
      },
      summary: input.summary ?? ci.bio ?? null,
      education: Array.isArray(input.education) ? input.education.map(e => ({
        institution: e.institution || null,
        degree: e.degree ?? null,
        years: e.years ?? null,
        cgpa: e.cgpa ?? null,
      })) : [],
      experience: Array.isArray(input.experience) ? input.experience.map(ex => ({
        company: ex.company || null,
        role: ex.role || ex.title || null,
        start_date: ex.start_date ?? null,
        end_date: ex.end_date ?? null,
        duration: ex.duration ?? null,
        location: ex.location ?? null,
        responsibilities: Array.isArray(ex.responsibilities) ? ex.responsibilities : [],
      })) : [],
      projects: (Array.isArray(input.projects) ? input.projects.map(p => ({
        title: p.title || p.name || null,
        description: p.description ?? null,
        technologies: Array.isArray(p.technologies) ? p.technologies : (p.tech_stack ? [p.tech_stack] : []),
        live_demo: p.live_demo ?? null,
        github_link: p.github_link || p.repoLink || p.repo_link || null,
        stars: Number(p.stars || 0),
        forks: Number(p.forks || 0),
      })) : []),
      github_projects: Array.isArray(input.github_projects) ? input.github_projects.map(p => ({
        title: p.title || p.name || null,
        description: p.description ?? null,
        tech_stack: p.tech_stack || (Array.isArray(p.technologies) ? p.technologies.join(', ') : null),
        stars: Number(p.stars || 0),
        forks: Number(p.forks || 0),
        repo_link: p.repo_link || p.github_link || null,
      })) : [],
      technical_skills: {
        languages: (input.technical_skills && Array.isArray(input.technical_skills.languages)) ? input.technical_skills.languages : [],
        frameworks_libraries: (input.technical_skills && Array.isArray(input.technical_skills.frameworks_libraries)) ? input.technical_skills.frameworks_libraries : [],
        databases: (input.technical_skills && Array.isArray(input.technical_skills.databases)) ? input.technical_skills.databases : [],
        authentication_apis: (input.technical_skills && Array.isArray(input.technical_skills.authentication_apis)) ? input.technical_skills.authentication_apis : [],
        dev_tools: (input.technical_skills && Array.isArray(input.technical_skills.dev_tools)) ? input.technical_skills.dev_tools : [],
        ai_cv_tools: (input.technical_skills && Array.isArray(input.technical_skills.ai_cv_tools)) ? input.technical_skills.ai_cv_tools : [],
      },
      certificates: Array.isArray(input.certificates || input.certifications) ? (input.certificates || input.certifications).map(c => ({
        title: c.title || c.name || null,
        date: c.date ?? null,
        description: c.description || c.details || null,
      })) : [],
      achievements: Array.isArray(input.achievements) ? input.achievements : [],
      github_profile_overview: {
        username: gpo.username ?? null,
        profile_pic: gpo.profile_pic || (ci.github && ci.github.profile_pic) || null,
        followers: Number(gpo.followers ?? 0),
        following: Number(gpo.following ?? 0),
        public_repos: Number(gpo.public_repos ?? 0),
        github_url: gpo.github_url || (ci.github_url ?? null),
      },
    };

    return out;
  }

  function tryPostToPreview(currentFinal) {
    const data = safeParsePortfolio(currentFinal ?? finalJson);
    const frame = previewRef.current;
    if (!data || !frame) return;

    // Deduplicate projects on the fly (title+repo)
    try {
      const seen = new Set();
      const uniq = [];
      const all = [
        ...((data.projects||[]).map(p=>({
          title: p.title||'', repo: p.github_link||p.repo||p.repo_link||'', ...p
        }))),
        ...((data.github_projects||[]).map(p=>({
          title: p.title||'', repo: p.repo_link||p.github_link||'', ...p
        })))
      ];
      all.forEach(p => {
        const key = (p.title||'').toLowerCase().trim() + '|' + (p.repo||'').toLowerCase().trim();
        if (!seen.has(key)) { seen.add(key); uniq.push(p); }
      });
      // Keep unique list in projects; keep github_projects as is for reference
      data.projects = uniq.map(({repo, ...rest}) => ({ ...rest, github_link: rest.github_link || repo || null }));
    } catch {}

    // Post message to the iframe. Templates should be same-origin under /public.
    frame.contentWindow?.postMessage({ type: 'APPLY_PORTFOLIO', payload: data }, window.location.origin);
  }

  // Open selected template as a full page and pass data via localStorage
  function openFullPage() {
    const data = safeParsePortfolio(finalJson);
    if (!data) return;
    try {
      localStorage.setItem('PORTFOLIO_DATA', JSON.stringify(data));
      // open the selected template
      window.open(templateSrc, '_blank');
    } catch {}
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
            <input
              id="gh-token"
              type="password"
              value={ghToken}
              onChange={(e) => setGhToken(e.target.value)}
              placeholder="Optional: GitHub token (to avoid rate limits)"
              className="px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors duration-200 text-gray-900 min-w-[320px]"
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

          {ghError && (
            <div className="mt-3 text-sm text-red-600">{ghError}</div>
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

        {/* Step 4 - Full Width Preview */}
        <div className="mt-10">
          <div className="w-[100vw] relative left-1/2 right-1/2 -translate-x-1/2 bg-gradient-to-br from-violet-50 to-indigo-50">
            <div className="mx-auto max-w-7xl px-6 py-10">
              <div className="backdrop-blur-xl bg-white/30 border border-white/40 shadow-xl rounded-2xl p-6">
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="text-sm text-gray-800">Template</label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-white/50 bg-white/50 text-gray-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 outline-none transition-colors duration-200"
                  >
                    <option value="template1">Template 1</option>
                    <option value="template2">Template 2</option>
                    <option value="template3">Template 3</option>
                  </select>

                  <button
                    onClick={() => tryPostToPreview()}
                    disabled={!finalJson}
                    className={`px-4 py-2 rounded-lg text-white font-medium transition-colors duration-200 ${
                      !finalJson ? 'bg-violet-300 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-700'
                    }`}
                    type="button"
                  >
                    Apply Data
                  </button>

                  <button
                    onClick={() => openFullPage()}
                    disabled={!finalJson}
                    className={`px-4 py-2 rounded-lg text-violet-700 font-medium border transition-colors duration-200 ${
                      !finalJson ? 'bg-white/50 border-violet-200 cursor-not-allowed' : 'bg-white/70 border-violet-300 hover:bg-white'
                    }`}
                    type="button"
                  >
                    Open Full Page
                  </button>
                </div>
              </div>

              <div className="mt-6 rounded-2xl overflow-hidden border border-white/40 bg-white/40 backdrop-blur-xl shadow-2xl">
                <iframe
                  ref={previewRef}
                  title="Portfolio Preview"
                  src={templateSrc}
                  className="w-full h-[820px] bg-transparent"
                  onLoad={() => tryPostToPreview()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
