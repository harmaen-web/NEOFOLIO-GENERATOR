// import React, { useMemo, useRef, useState, useEffect } from "react";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
// import { Toaster } from "react-hot-toast";
// import LandingPage from "./LandingPage";
// import PortfolioDownloader from "./components/PortfolioDownloader";
// import { GoogleGenAI } from "@google/genai";

// const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// const ai = new GoogleGenAI({
//   apiKey: API_KEY,
// });

// // ----- Inline UI Components -----
// function Header() {
//   return (
//     <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200">
//       <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
//         <div className="text-2xl font-extrabold tracking-tight text-black select-none">
//           Portfolio Generator
//         </div>
//       </div>
//     </header>
//   );
// }

// function Hero() {
//   return (
//     <section className="relative">
//       <div className="mx-auto max-w-5xl px-6 pt-16 pb-10">
//         <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-black">
//           Build Your Professional Portfolio in Seconds.
//         </h1>
//         <p className="mt-5 text-lg md:text-xl text-gray-700 max-w-3xl">
//           Upload your LinkedIn resume as PDF, connect your GitHub, and let AI generate a structured JSON portfolio for you.
//         </p>
//       </div>
//     </section>
//   );
// }

// function StepCard({ number, title, children }) {
//   return (
//     <section className="bg-white border border-gray-200 rounded-xl shadow-md p-8">
//       <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-black mb-4">
//         <span className="text-gray-500 mr-2">{number}.</span> {title}
//       </h3>
//       {children}
//     </section>
//   );
// }

// function ProgressBar({ label, color = "from-indigo-600 to-indigo-400" }) {
//   return (
//     <div className="w-full bg-gray-100 rounded-md overflow-hidden h-[18px] relative">
//       <div className={`w-full h-full bg-gradient-to-r ${color} animate-[progressBarAnim_1.2s_linear_infinite]`} />
//       <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-sm font-bold">{label}</span>
//       <style>{`
//         @keyframes progressBarAnim {
//           0% { background-position: 0 0; }
//           100% { background-position: 200px 0; }
//         }
//       `}</style>
//     </div>
//   );
// }

// function Footer() {
//   return (
//     <footer className="border-t border-gray-200 mt-16">
//       <div className="mx-auto max-w-5xl px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
//         <div>
//           <h4 className="font-semibold text-gray-900 mb-3">Social</h4>
//           <ul className="space-y-2 text-gray-600 text-sm">
//             <li><a className="hover:underline" href="#">Twitter</a></li>
//             <li><a className="hover:underline" href="#">GitHub</a></li>
//             <li><a className="hover:underline" href="#">LinkedIn</a></li>
//           </ul>
//         </div>
//         <div>
//           <h4 className="font-semibold text-gray-900 mb-3">Explore</h4>
//           <ul className="space-y-2 text-gray-600 text-sm">
//             <li><a className="hover:underline" href="#">Documentation</a></li>
//             <li><a className="hover:underline" href="#">Pricing</a></li>
//             <li><a className="hover:underline" href="#">Blog</a></li>
//           </ul>
//         </div>
//         <div>
//           <h4 className="font-semibold text-gray-900 mb-3">Legal</h4>
//           <ul className="space-y-2 text-gray-600 text-sm">
//             <li><a className="hover:underline" href="#">Privacy</a></li>
//             <li><a className="hover:underline" href="#">Terms</a></li>
//             <li><a className="hover:underline" href="#">Security</a></li>
//           </ul>
//         </div>
//       </div>
//       <div className="mx-auto max-w-5xl px-6 pb-10 flex items-center justify-between text-sm text-gray-600">
//         <span>© 2025 Portfolio Generator</span>
//         <a href="#top" className="hover:underline">Back to top</a>
//       </div>
//     </footer>
//   );
// }

// // ----- Google GenAI loader -----
// // const genaiUrl = "https://aistudiocdn.com/@google/genai@^1.20.0";
// // let GoogleGenAI = null;
// // const loadGenAILibrary = async () => {
// //   if (!GoogleGenAI) {
// //     const module = await import(/* @vite-ignore */ genaiUrl);
// //     GoogleGenAI = module.GoogleGenAI;
// //   }
// //   return GoogleGenAI;
// // };
//  // Configure your Gemini API key through VITE_GEMINI_API_KEY in .env.local.

// // Helper: convert ArrayBuffer to base64
// function arrayBufferToBase64(buffer) {
//   let binary = "";
//   let bytes = new Uint8Array(buffer);
//   let len = bytes.byteLength;
//   for (let i = 0; i < len; i++) {
//     binary += String.fromCharCode(bytes[i]);
//   }
//   return window.btoa(binary);
// }

// function AppContent() {
//   // Landing page state
//   const [showLanding, setShowLanding] = useState(true);
  
//   // Resume states
//   const [file, setFile] = useState(null);
//   const [resumeLoading, setResumeLoading] = useState(false);
//   const [resumeRaw, setResumeRaw] = useState("");
//   // GitHub states
//   const [username, setUsername] = useState("");
//   const [ghToken, setGhToken] = useState("");
//   const [githubLoading, setGithubLoading] = useState(false);
//   const [ghError, setGhError] = useState("");
//   const [portfolio, setPortfolio] = useState(null);
//   // Consolidation states
//   const [consolidateLoading, setConsolidateLoading] = useState(false);
//   const [finalJson, setFinalJson] = useState(null);
//   // Template/Preview state (Step 4)
//   const [selectedTemplate, setSelectedTemplate] = useState("template1");
//   const [previewStatus, setPreviewStatus] = useState("idle"); // idle, loading, success, error
//   const previewRef = useRef(null);
//   // Full-page overlay preview state and ref
//   // You can customize this to use a different icon/text or move placement later
//   const [showFullPagePreview, setShowFullPagePreview] = useState(false);
//   const fullPreviewRef = useRef(null);
//   const templateSrc = useMemo(() => `/template/${selectedTemplate}.html`, [selectedTemplate]);

//   // Drag & Drop (Step 1)
//   const [isDragging, setIsDragging] = useState(false);
//   const inputRef = useRef(null);
//   const fileLabel = useMemo(() => (file ? file.name : "Choose file"), [file]);

//   const validMime = (f) => {
//     const okTypes = [
//       "application/pdf",
//       "image/png",
//       "image/jpg",
//       "image/jpeg",
//       "image/bmp",
//       "image/gif",
//       "image/webp",
//     ];
//     if (okTypes.includes(f.type)) return true;
//     const name = f.name?.toLowerCase() || "";
//     return /(\.pdf|\.png|\.jpe?g|\.bmp|\.gif|\.webp)$/.test(name);
//   };

//   const onDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragging(false);
//     const files = e.dataTransfer?.files;
//     if (!files || files.length === 0) return;
//     const f = files[0];
//     if (!validMime(f)) {
//       alert("Unsupported file. Please drop a PDF or image.");
//       return;
//     }
//     setFile(f);
//   };
//   const onDragOver = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     e.dataTransfer.dropEffect = "copy";
//     setIsDragging(true);
//   };
//   const onDragLeave = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragging(false);
//   };
//   const onClickDropzone = () => inputRef.current?.click();
//   const onChangeFile = (e) => {
//     const f = e.target.files?.[0];
//     if (!f) return;
//     if (!validMime(f)) {
//       alert("Unsupported file. Please choose a PDF or image.");
//       return;
//     }
//     setFile(f);
//   };

//   const dropzoneClasses = `rounded-xl border-2 border-dashed transition-colors duration-200 px-6 py-10 bg-white text-center cursor-pointer select-none ${
//     isDragging ? "border-violet-600 bg-violet-50" : "border-gray-300 hover:border-violet-400"
//   }`;
//   const dropzoneHint = file ? "File ready. You can re-drop or choose another file." : "Drag & drop your resume here, or click to browse";

//   // Step 1: Resume upload & extraction
//   const handleExtractResume = async () => {
//     setResumeLoading(true);
//     setResumeRaw("");
//     try {
//       if (!file) {
//         throw new Error("No file selected. Please upload a resume file first.");
//       }

//       // Validate file size (max 10MB)
//       const maxSize = 10 * 1024 * 1024; // 10MB
//       if (file.size > maxSize) {
//         throw new Error("File size too large. Please upload a file smaller than 10MB.");
//       }

//       // const GenAI = await loadGenAILibrary();
//       // if (!GenAI) {
//       //   throw new Error("Failed to load AI library. Please check your internet connection.");
//       // }

//       // const ai = new GenAI({ apiKey: API_KEY });
//       let contents = [];
      
//       const ext = file.name.split(".").pop().toLowerCase();
//       const buffer = await file.arrayBuffer();
      
//       if (ext === "pdf") {
//         contents = [
//           { inlineData: { mimeType: "application/pdf", data: arrayBufferToBase64(buffer) } },
//           { text: "Extract and return only the raw text from this resume. Focus on extracting contact information, work experience, education, skills, and projects." },
//         ];
//       } else if (["png", "jpg", "jpeg", "bmp", "gif", "webp"].includes(ext)) {
//         contents = [
//           { inlineData: { mimeType: `image/${ext === "jpg" ? "jpeg" : ext}`, data: arrayBufferToBase64(buffer) } },
//           { text: "Extract and return only the raw text from this resume image. Focus on extracting contact information, work experience, education, skills, and projects." },
//         ];
//       } else {
//         throw new Error("Unsupported file type. Please upload a PDF or image file (PNG, JPG, JPEG, BMP, GIF, WEBP).");
//       }

//       const response = await ai.models.generateContent({model: "gemini-2.5-flash", contents });
      
//       if (!response || !response.text) {
//         throw new Error("No text extracted from the resume. Please try with a clearer image or different file.");
//       }

//       setResumeRaw(response.text);
//     } catch (error) {
//       console.error('Resume extraction error:', error);
//       setResumeRaw(`Error: ${error.message}`);
//     } finally {
//       setResumeLoading(false);
//     }
//   };

//   // Step 2: GitHub fetch
//   const handleFetchGitHub = async () => {
//     if (!username.trim()) {
//       setGhError("Please enter a valid GitHub username.");
//       return;
//     }

//     setGithubLoading(true);
//     setGhError("");
//     setPortfolio(null);
    
//     try {
//       const headers = ghToken ? { Authorization: `Bearer ${ghToken}` } : {};

//       // Profile
//       const profileRes = await fetch(`https://api.github.com/users/${username}`, { headers });
//       if (!profileRes.ok) {
//         if (profileRes.status === 404) {
//           throw new Error(`GitHub user "${username}" not found. Please check the username and try again.`);
//         } else if (profileRes.status === 403) {
//           const rateLimit = profileRes.headers.get('x-ratelimit-remaining');
//           const resetTime = profileRes.headers.get('x-ratelimit-reset');
//           if (rateLimit === '0') {
//             const resetDate = new Date(parseInt(resetTime) * 1000);
//             throw new Error(`GitHub API rate limit exceeded. Please try again after ${resetDate.toLocaleTimeString()}, or add a GitHub token to increase limits.`);
//           }
//           throw new Error("Access forbidden. Please check your GitHub token or try again later.");
//         } else if (profileRes.status === 401) {
//           throw new Error("Invalid GitHub token. Please check your token or remove it to use public access.");
//         } else {
//           throw new Error(`GitHub API error (${profileRes.status}). Please try again later.`);
//         }
//       }
//       const profileRaw = await profileRes.json();

//       // Repos (first 100, sorted by updated)
//       const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers });
//       if (!reposRes.ok) {
//         if (reposRes.status === 403) {
//           const rateLimit = reposRes.headers.get('x-ratelimit-remaining');
//           if (rateLimit === '0') {
//             throw new Error("GitHub API rate limit exceeded for repositories. Please try again later or add a GitHub token.");
//           }
//         }
//         throw new Error(`Failed to fetch repositories (${reposRes.status}). Please try again later.`);
//       }
//       const reposRaw = await reposRes.json();

//       const profileData = {
//         name: profileRaw.name ?? null,
//         username: profileRaw.login ?? null,
//         profilePic: profileRaw.avatar_url ?? null,
//         bio: profileRaw.bio ?? null,
//         location: profileRaw.location ?? null,
//         githubUrl: profileRaw.html_url ?? null,
//         website: profileRaw.blog || null,
//         followers: profileRaw.followers ?? 0,
//         following: profileRaw.following ?? 0,
//         publicRepos: profileRaw.public_repos ?? 0,
//       };
      
//       const projects = Array.isArray(reposRaw)
//         ? reposRaw.map((repo) => ({
//             title: repo.name ?? null,
//             description: repo.description ?? null,
//             techStack: repo.language ?? null,
//             stars: repo.stargazers_count ?? 0,
//             forks: repo.forks_count ?? 0,
//             repoLink: repo.html_url ?? null,
//           }))
//         : [];
        
//       const structuredData = { personal: profileData, projects };
//       setPortfolio(structuredData);
//     } catch (error) {
//       console.error('GitHub fetch error:', error);
//       setGhError(error.message || String(error));
//       setPortfolio({ error: String(error) });
//     } finally {
//       setGithubLoading(false);
//     }
//   };

//   // Step 3: Consolidate and send to Gemini (with strict schema)
//   const handleConsolidate = async () => {
//     setConsolidateLoading(true);
//     setFinalJson(null);
    
//     try {
//       // Validate inputs
//       if (!resumeRaw || resumeRaw.trim() === '') {
//         throw new Error("No resume data available. Please extract your resume first.");
//       }
      
//       if (!portfolio || portfolio.error) {
//         throw new Error("No GitHub data available. Please fetch your GitHub profile first.");
//       }

//       const GenAI = await loadGenAILibrary();
//       if (!GenAI) {
//         throw new Error("Failed to load AI library. Please check your internet connection.");
//       }

//       const ai = new GenAI({ apiKey: API_KEY });
//       const schema = `You are to return ONE JSON object ONLY (no markdown, no prose). Use EXACT keys and casing below. Normalize any synonyms from inputs into this schema. Use null for missing scalar fields and [] for empty lists.

// Schema:
// {
//   "contact_information": {
//     "name": string,
//     "email": string|null,
//     "phone": string|null,
//     "linkedin_url": string|null,
//     "github_url": string|null
//   },
//   "summary": string|null,
//   "education": [ { "institution": string, "degree": string|null, "years": string|null, "cgpa": string|null } ],
//   "experience": [ { "company": string, "role": string|null, "start_date": string|null, "end_date": string|null, "duration": string|null, "location": string|null, "responsibilities": string[] } ],
//   "projects": [ { "title": string, "description": string|null, "technologies": string[], "live_demo": string|null, "github_link": string|null } ],
//   "github_projects": [ { "title": string, "description": string|null, "tech_stack": string|null, "stars": number, "forks": number, "repo_link": string|null } ],
//   "technical_skills": { "languages": string[], "frameworks_libraries": string[], "databases": string[], "authentication_apis": string[], "dev_tools": string[], "ai_cv_tools": string[] },
//   "certificates": [ { "title": string, "date": string|null, "description": string|null } ],
//   "achievements": string[],
//   "github_profile_overview": { "username": string|null, "profile_pic": string|null, "followers": number, "following": number, "public_repos": number, "github_url": string|null }
// }`;
//       const prompt = `${schema}\n\nResume:\n${resumeRaw}\n\nGitHub:\n${JSON.stringify(portfolio, null, 2)}`;
//       const response = await ai.models.generateContent({model: "gemini-2.5-flash", contents: prompt });
      
//       if (!response || !response.text) {
//         throw new Error("No response from AI. Please try again.");
//       }
      
//       const text = response.text;
//       const parsed = safeParsePortfolio(text);
      
//       if (!parsed) {
//         throw new Error("Failed to parse AI response. The response may not be valid JSON.");
//       }
      
//       const normalized = normalizePortfolio(parsed);
      
//       // Validate the normalized data
//       const validationResult = validatePortfolioSchema(normalized);
//       if (!validationResult.isValid) {
//         console.warn('Schema validation warnings:', validationResult.warnings);
//         // Continue with warnings, but log them
//       }
      
//       const pretty = JSON.stringify(normalized, null, 2);
//       setFinalJson(pretty);
//       // Try to post to preview if already loaded
//       tryPostToPreview(pretty);
//     } catch (error) {
//       console.error('Consolidation error:', error);
//       setFinalJson(`Error: ${error.message}`);
//     } finally {
//       setConsolidateLoading(false);
//     }
//   };

//   // Validation function for portfolio schema
//   function validatePortfolioSchema(data) {
//     const warnings = [];
//     let isValid = true;

//     if (!data || typeof data !== 'object') {
//       return { isValid: false, warnings: ['Data is not a valid object'] };
//     }

//     // Check required top-level fields
//     const requiredFields = [
//       'contact_information', 'summary', 'education', 'experience', 
//       'projects', 'github_projects', 'technical_skills', 'certificates', 
//       'achievements', 'github_profile_overview'
//     ];

//     requiredFields.forEach(field => {
//       if (!(field in data)) {
//         warnings.push(`Missing required field: ${field}`);
//         isValid = false;
//       }
//     });

//     // Validate contact_information structure
//     if (data.contact_information && typeof data.contact_information === 'object') {
//       const ci = data.contact_information;
//       if (!ci.name) warnings.push('contact_information.name is missing');
//     } else if (data.contact_information) {
//       warnings.push('contact_information should be an object');
//       isValid = false;
//     }

//     // Validate arrays
//     const arrayFields = ['education', 'experience', 'projects', 'github_projects', 'certificates', 'achievements'];
//     arrayFields.forEach(field => {
//       if (data[field] && !Array.isArray(data[field])) {
//         warnings.push(`${field} should be an array`);
//         isValid = false;
//       }
//     });

//     // Validate technical_skills structure
//     if (data.technical_skills && typeof data.technical_skills === 'object') {
//       const skillCategories = ['languages', 'frameworks_libraries', 'databases', 'authentication_apis', 'dev_tools', 'ai_cv_tools'];
//       skillCategories.forEach(category => {
//         if (data.technical_skills[category] && !Array.isArray(data.technical_skills[category])) {
//           warnings.push(`technical_skills.${category} should be an array`);
//           isValid = false;
//         }
//       });
//     } else if (data.technical_skills) {
//       warnings.push('technical_skills should be an object');
//       isValid = false;
//     }

//     return { isValid, warnings };
//   }

//   // Step 4 helpers: safely parse JSON from model and post to iframe template
//   function safeParsePortfolio(maybeJson) {
//     if (!maybeJson) return null;
//     try {
//       return typeof maybeJson === 'string' ? JSON.parse(maybeJson) : maybeJson;
//     } catch (_) {
//       // Attempt to extract JSON block from fenced code or text
//       const match = String(maybeJson).match(/```json[\s\S]*?```|\{[\s\S]*\}$/);
//       if (match) {
//         const cleaned = match[0].replace(/```json|```/g, "");
//         try { return JSON.parse(cleaned); } catch {}
//       }
//       return null;
//     }
//   }

//   // Normalization: map any variant keys to strict schema used by templates
//   function normalizePortfolio(input) {
//     if (!input || typeof input !== 'object') return null;

//     const ci = input.contact_information || input.contactInfo || input.personal_info || input.personal || {};
//     const gpo = input.github_profile_overview || {};

//     const normalizeProjects = () => {
//       const a = Array.isArray(input.projects) ? input.projects.map(p => ({
//         title: p.title || p.name || null,
//         description: p.description ?? null,
//         technologies: Array.isArray(p.technologies) ? p.technologies : (p.tech_stack ? [p.tech_stack] : []),
//         live_demo: p.live_demo ?? null,
//         github_link: p.github_link || p.repoLink || p.repo_link || null,
//         stars: Number(p.stars || 0),
//         forks: Number(p.forks || 0),
//       })) : [];
//       const b = Array.isArray(input.github_projects) ? input.github_projects.map(p => ({
//         title: p.title || p.name || null,
//         description: p.description ?? null,
//         technologies: p.technologies || (p.tech_stack ? [p.tech_stack] : []),
//         live_demo: null,
//         github_link: p.repo_link || p.github_link || null,
//         stars: Number(p.stars || 0),
//         forks: Number(p.forks || 0),
//       })) : [];
//       return [...a, ...b];
//     };

//     const out = {
//       contact_information: {
//         name: ci.name || ci.username || null,
//         email: ci.email || null,
//         phone: ci.phone || null,
//         linkedin_url: ci.linkedin_url || ci.linkedin || null,
//         github_url: ci.github_url || (ci.github && ci.github.profile_url) || null,
//       },
//       summary: input.summary ?? ci.bio ?? null,
//       education: Array.isArray(input.education) ? input.education.map(e => ({
//         institution: e.institution || null,
//         degree: e.degree ?? null,
//         years: e.years ?? null,
//         cgpa: e.cgpa ?? null,
//       })) : [],
//       experience: Array.isArray(input.experience) ? input.experience.map(ex => ({
//         company: ex.company || null,
//         role: ex.role || ex.title || null,
//         start_date: ex.start_date ?? null,
//         end_date: ex.end_date ?? null,
//         duration: ex.duration ?? null,
//         location: ex.location ?? null,
//         responsibilities: Array.isArray(ex.responsibilities) ? ex.responsibilities : [],
//       })) : [],
//       projects: (Array.isArray(input.projects) ? input.projects.map(p => ({
//         title: p.title || p.name || null,
//         description: p.description ?? null,
//         technologies: Array.isArray(p.technologies) ? p.technologies : (p.tech_stack ? [p.tech_stack] : []),
//         live_demo: p.live_demo ?? null,
//         github_link: p.github_link || p.repoLink || p.repo_link || null,
//         stars: Number(p.stars || 0),
//         forks: Number(p.forks || 0),
//       })) : []),
//       github_projects: Array.isArray(input.github_projects) ? input.github_projects.map(p => ({
//         title: p.title || p.name || null,
//         description: p.description ?? null,
//         tech_stack: p.tech_stack || (Array.isArray(p.technologies) ? p.technologies.join(', ') : null),
//         stars: Number(p.stars || 0),
//         forks: Number(p.forks || 0),
//         repo_link: p.repo_link || p.github_link || null,
//       })) : [],
//       technical_skills: {
//         languages: (input.technical_skills && Array.isArray(input.technical_skills.languages)) ? input.technical_skills.languages : [],
//         frameworks_libraries: (input.technical_skills && Array.isArray(input.technical_skills.frameworks_libraries)) ? input.technical_skills.frameworks_libraries : [],
//         databases: (input.technical_skills && Array.isArray(input.technical_skills.databases)) ? input.technical_skills.databases : [],
//         authentication_apis: (input.technical_skills && Array.isArray(input.technical_skills.authentication_apis)) ? input.technical_skills.authentication_apis : [],
//         dev_tools: (input.technical_skills && Array.isArray(input.technical_skills.dev_tools)) ? input.technical_skills.dev_tools : [],
//         ai_cv_tools: (input.technical_skills && Array.isArray(input.technical_skills.ai_cv_tools)) ? input.technical_skills.ai_cv_tools : [],
//       },
//       certificates: Array.isArray(input.certificates || input.certifications) ? (input.certificates || input.certifications).map(c => ({
//         title: c.title || c.name || null,
//         date: c.date ?? null,
//         description: c.description || c.details || null,
//       })) : [],
//       achievements: Array.isArray(input.achievements) ? input.achievements : [],
//       github_profile_overview: {
//         username: gpo.username ?? null,
//         profile_pic: gpo.profile_pic || (ci.github && ci.github.profile_pic) || null,
//         followers: Number(gpo.followers ?? 0),
//         following: Number(gpo.following ?? 0),
//         public_repos: Number(gpo.public_repos ?? 0),
//         github_url: gpo.github_url || (ci.github_url ?? null),
//       },
//     };

//     return out;
//   }

//   // Send data to either the inline preview or the full-page overlay preview
//   // You can pass a specific frame ref (e.g., fullPreviewRef) to target a different iframe
//   function tryPostToPreview(currentFinal, targetRef = previewRef) {
//     const data = safeParsePortfolio(currentFinal ?? finalJson);
//     const frame = targetRef.current;
    
//     if (!data) {
//       console.warn('No valid data to send to preview');
//       setPreviewStatus('error');
//       return;
//     }
    
//     if (!frame) {
//       console.warn('Preview iframe not ready');
//       setPreviewStatus('error');
//       return;
//     }

//     setPreviewStatus('loading');

//     // Validate data before sending
//     const validation = validatePortfolioSchema(data);
//     if (!validation.isValid) {
//       console.warn('Data validation failed:', validation.warnings);
//     }

//     // Deduplicate projects on the fly (title+repo)
//     try {
//       const seen = new Set();
//       const uniq = [];
//       const all = [
//         ...((data.projects||[]).map(p=>({
//           title: p.title||'', repo: p.github_link||p.repo||p.repo_link||'', ...p
//         }))),
//         ...((data.github_projects||[]).map(p=>({
//           title: p.title||'', repo: p.repo_link||p.github_link||'', ...p
//         })))
//       ];
//       all.forEach(p => {
//         const key = (p.title||'').toLowerCase().trim() + '|' + (p.repo||'').toLowerCase().trim();
//         if (!seen.has(key)) { seen.add(key); uniq.push(p); }
//       });
//       // Keep unique list in projects; keep github_projects as is for reference
//       data.projects = uniq.map(({repo, ...rest}) => ({ ...rest, github_link: rest.github_link || repo || null }));
//     } catch (error) {
//       console.error('Error deduplicating projects:', error);
//     }

//     // Post message to the iframe. Templates should be same-origin under /public.
//     try {
//       frame.contentWindow?.postMessage({ type: 'APPLY_PORTFOLIO', payload: data }, window.location.origin);
//       console.log('Portfolio data sent to preview successfully');
//       setPreviewStatus('success');
//     } catch (error) {
//       console.error('Error sending data to preview:', error);
//       setPreviewStatus('error');
//     }
//   }

//   // Open selected template in an in-app full-page overlay (no browser tab, no reload)
//   // You can later swap the icon/text by editing the Back button inside the overlay section
//   function openFullPage() {
//     setShowFullPagePreview(true);

//     // Ensure data is applied to the overlay iframe after it loads
//     // If already loaded, try sending immediately as well
//     setTimeout(() => tryPostToPreview(undefined, fullPreviewRef), 0);
//   }

//   // Listen for templates requesting data (optional future use)
//   React.useEffect(() => {
//     const onMessage = (e) => {
//       if (e.origin !== window.location.origin) return;
//       if (e.data === 'REQUEST_PORTFOLIO') {
//         tryPostToPreview();
//       }
//     };
//     window.addEventListener('message', onMessage);
//     return () => window.removeEventListener('message', onMessage);
//   }, []);

//   const copyFinalJson = async () => {
//     try {
//       await navigator.clipboard.writeText(String(finalJson ?? ""));
//     } catch {}
//   };


//   // Handle landing page transition
//   const handleGetStarted = () => {
//     setShowLanding(false);
//   };

//   // Show landing page first
//   if (showLanding) {
//     return <LandingPage onGetStarted={handleGetStarted} />;
//   }

//   // Temporary: Show Google Auth Test (remove this after testing)
//   // Uncomment the next line to test Google OAuth
//   // return <GoogleAuthTest />;

//   return (
//     <div id="top" className="min-h-screen bg-white text-[#111]">
//       {/* Light grid background */}
//       <div
//         aria-hidden
//         className="fixed inset-0 -z-10"
//         style={{
//           backgroundImage:
//             "linear-gradient(to right, rgba(17,17,17,.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,17,17,.06) 1px, transparent 1px)",
//           backgroundSize: "24px 24px",
//           backgroundPosition: "top left",
//         }}
//       />

//       <Header />
//       <Hero />

//       <div className="mx-auto max-w-5xl px-6 space-y-10 pb-16">
//         {/* Step 1 */}
//         <StepCard number="1" title="Upload your LinkedIn resume as PDF">
//           <label className="block text-sm font-medium text-gray-800 mb-3">Resume file</label>

//           {/* Drop zone */}
//           <div
//             className={dropzoneClasses}
//             onDrop={onDrop}
//             onDragOver={onDragOver}
//             onDragLeave={onDragLeave}
//             onClick={onClickDropzone}
//             role="button"
//             aria-label="File dropzone"
//             tabIndex={0}
//             onKeyDown={(e) => {
//               if (e.key === "Enter" || e.key === " ") {
//                 e.preventDefault();
//                 onClickDropzone();
//               }
//             }}
//           >
//             <input
//               ref={inputRef}
//               type="file"
//               accept=".pdf,image/*"
//               className="hidden"
//               onChange={onChangeFile}
//             />
//             <div className="flex flex-col items-center gap-2">
//               <div className="text-sm text-gray-600">{dropzoneHint}</div>
//               <div className="text-sm text-gray-900 font-medium">{fileLabel}</div>
//             </div>
//           </div>

//           <div className="flex items-center gap-4 flex-wrap mt-4">
//             <button
//               onClick={handleExtractResume}
//               disabled={!file || resumeLoading}
//               className={`px-5 py-3 rounded-lg text-white font-medium transition-colors duration-200 ${
//                 !file || resumeLoading ? "bg-violet-300 cursor-not-allowed" : "bg-violet-600 hover:bg-violet-700"
//               }`}
//               type="button"
//             >
//               {resumeLoading ? "Extracting..." : "Extract Resume"}
//             </button>
//           </div>

//           {resumeLoading && (
//             <div className="mt-4">
//               <ProgressBar label="Extracting resume..." color="from-violet-600 to-violet-400" />
//             </div>
//           )}

//           {resumeRaw && (
//             <div className="mt-4">
//               <SyntaxHighlighter language="markdown" style={oneLight} customStyle={{ borderRadius: 12, padding: 16, border: "1px solid #e5e7eb" }}>
//                 {String(resumeRaw)}
//               </SyntaxHighlighter>
//             </div>
//           )}
//         </StepCard>

//         {/* Step 2 */}
//         <StepCard number="2" title="Connect Your GitHub">
//           <label className="block text-sm font-medium text-gray-800 mb-2" htmlFor="gh-username">
//             Enter your GitHub username
//           </label>
//           <div className="flex items-center gap-3 flex-wrap">
//             <input
//               id="gh-username"
//               type="text"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               placeholder="e.g., torvalds"
//               className="px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors duration-200 text-gray-900"
//             />
//             <input
//               id="gh-token"
//               type="password"
//               value={ghToken}
//               onChange={(e) => setGhToken(e.target.value)}
//               placeholder="Optional: GitHub token (to avoid rate limits)"
//               className="px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors duration-200 text-gray-900 min-w-[320px]"
//             />
//             <button
//               onClick={handleFetchGitHub}
//               disabled={!username || githubLoading}
//               className={`px-5 py-3 rounded-lg text-white font-medium transition-colors duration-200 ${
//                 !username || githubLoading ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
//               }`}
//               type="button"
//             >
//               {githubLoading ? "Fetching..." : "Fetch GitHub Data"}
//             </button>
//           </div>

//           {githubLoading && (
//             <div className="mt-4">
//               <ProgressBar label="Fetching GitHub data..." color="from-indigo-600 to-indigo-400" />
//             </div>
//           )}

//           {ghError && (
//             <div className="mt-3 text-sm text-red-600">{ghError}</div>
//           )}

//           {portfolio && (
//             <div className="mt-4">
//               <SyntaxHighlighter language="json" style={oneLight} customStyle={{ borderRadius: 12, padding: 16, border: "1px solid #e5e7eb" }}>
//                 {JSON.stringify(portfolio, null, 2)}
//               </SyntaxHighlighter>
//             </div>
//           )}
//         </StepCard>

//         {/* Step 3 */}
//         <StepCard number="3" title="Generate Your Consolidated JSON">
//           <button
//             onClick={handleConsolidate}
//             disabled={consolidateLoading || !resumeRaw || !portfolio}
//             className={`px-6 py-3 rounded-lg text-black font-semibold transition-colors duration-200 ${
//               consolidateLoading || !resumeRaw || !portfolio ? "bg-gray-300 cursor-not-allowed" : "bg-lime-300 hover:bg-lime-400"
//             }`}
//             type="button"
//           >
//             {consolidateLoading ? "Processing..." : "Get JSON"}
//           </button>

//           {consolidateLoading && (
//             <div className="mt-4">
//               <ProgressBar label="Consolidating data..." color="from-lime-400 to-lime-300" />
//             </div>
//           )}

//           {finalJson && (
//             <div className="mt-4">
//               <div className="flex items-center justify-between mb-2">
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm text-gray-600">Consolidated Portfolio JSON</span>
//                   {(() => {
//                     try {
//                       const parsed = JSON.parse(finalJson);
//                       const validation = validatePortfolioSchema(parsed);
//                       return validation.isValid ? (
//                         <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">✓ Valid</span>
//                       ) : (
//                         <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">⚠ Has Issues</span>
//                       );
//                     } catch {
//                       return <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">✗ Invalid JSON</span>;
//                     }
//                   })()}
//                 </div>
//                 <button onClick={copyFinalJson} className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 transition-colors duration-200" type="button">
//                   Copy to Clipboard
//                 </button>
//               </div>
//               <SyntaxHighlighter language="json" style={oneLight} customStyle={{ borderRadius: 12, padding: 16, border: "1px solid #e5e7eb", maxHeight: "400px", overflow: "auto" }}>
//                 {String(finalJson)}
//               </SyntaxHighlighter>
//             </div>
//           )}
//         </StepCard>

//         {/* Step 4 - Full Width Preview */}
//         <div className="mt-10">
//           <div className="w-[100vw] relative left-1/2 right-1/2 -translate-x-1/2 bg-gradient-to-br from-violet-50 to-indigo-50">
//             <div className="mx-auto max-w-7xl px-6 py-10">
//               <div className="backdrop-blur-xl bg-white/30 border border-white/40 shadow-xl rounded-2xl p-6">
//                 <div className="flex items-center gap-3 flex-wrap">
//                   <label className="text-sm text-gray-800">Template</label>
//                   <select
//                     value={selectedTemplate}
//                     onChange={(e) => setSelectedTemplate(e.target.value)}
//                     className="px-3 py-2 rounded-lg border border-white/50 bg-white/50 text-gray-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 outline-none transition-colors duration-200"
//                   >
//                     <option value="template1">Template 1</option>
//                     <option value="template2">Template 2</option>
//                     <option value="template3">Template 3</option>
//                   </select>

//                   <button
//                     onClick={() => tryPostToPreview()}
//                     disabled={!finalJson || previewStatus === 'loading'}
//                     className={`px-4 py-2 rounded-lg text-white font-medium transition-colors duration-200 flex items-center gap-2 ${
//                       !finalJson || previewStatus === 'loading' ? 'bg-violet-300 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-700'
//                     }`}
//                     type="button"
//                   >
//                     {previewStatus === 'loading' ? (
//                       <>
//                         <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
//                         <span>Applying...</span>
//                       </>
//                     ) : (
//                       <>
//                         {previewStatus === 'success' && <span className="text-green-200">✓</span>}
//                         {previewStatus === 'error' && <span className="text-red-200">✗</span>}
//                         <span>Apply Data</span>
//                       </>
//                     )}
//                   </button>

//                   <button
//                     onClick={() => openFullPage()}
//                     disabled={!finalJson}
//                     className={`px-4 py-2 rounded-lg text-violet-700 font-medium border transition-colors duration-200 ${
//                       !finalJson ? 'bg-white/50 border-violet-200 cursor-not-allowed' : 'bg-white/70 border-violet-300 hover:bg-white'
//                     }`}
//                     type="button"
//                   >
//                     Open Full Page
//                   </button>
//                 </div>
//               </div>

//               {/* Keep the apply-area toolbar minimal; place Download button BELOW the inline preview for consistency */}
//               <div className="mt-6 rounded-2xl overflow-hidden border border-white/40 bg-white/40 backdrop-blur-xl shadow-2xl">
//                 <iframe
//                   ref={previewRef}
//                   title="Portfolio Preview"
//                   src={templateSrc}
//                   className="w-full h-[820px] bg-transparent"
//                   onLoad={() => tryPostToPreview()}
//                 />
//               </div>

//               {/* Download button mirrored here, just below the preview */}
//               {finalJson && (
//                 <div className="mt-4">
//                   {/* You can move this container to reposition the download button below/next to the Open Full Page button */}
//                   <PortfolioDownloader 
//                     portfolioData={(() => {
//                       try {
//                         return finalJson ? JSON.parse(finalJson) : null;
//                       } catch {
//                         return null;
//                       }
//                     })()}
//                     templateName={selectedTemplate}
//                     className="max-w-md"
//                   />
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Portfolio Download Section */}
//         {finalJson && (
//           <div className="mt-10">
//             <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
//               <div className="text-center mb-6">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 Your Portfolio is Ready!</h2>
//                 <p className="text-gray-600">Download your portfolio files and deploy them live on the web</p>
//               </div>
              
//               <PortfolioDownloader 
//                 portfolioData={(() => {
//                   try {
//                     return finalJson ? JSON.parse(finalJson) : null;
//                   } catch {
//                     return null;
//                   }
//                 })()}
//                 templateName={selectedTemplate}
//                 className="max-w-md mx-auto"
//               />
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Full-page overlay preview without reload */}
//       {showFullPagePreview && (
//         <div className="fixed inset-0 z-[100] bg-white flex flex-col">
//           {/* Top bar with Back button and optional Download */}
//           <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-200 bg-white sticky top-0">
//             {/* Minimal back control - customize icon/text later */}
//             <button
//               type="button"
//               onClick={() => setShowFullPagePreview(false)}
//               className="inline-flex items-center gap-2 text-gray-800 hover:text-gray-900 px-2 py-1 rounded"
//               aria-label="Back"
//             >
//               {/* You can swap this text for an icon component, e.g., ← or a Lucide icon */}
//               <span className="text-base sm:text-lg">←</span>
//               <span className="text-sm sm:text-base font-medium">Back</span>
//             </button>

//             {/* Optional Download button in full-page view — same behavior as Apply Data */}
//             {finalJson && (
//               <div className="ml-auto">
//                 {/* Move this block if you want a different placement */}
//                 <PortfolioDownloader 
//                   portfolioData={(() => {
//                     try { return finalJson ? JSON.parse(finalJson) : null; } catch { return null; }
//                   })()}
//                   templateName={selectedTemplate}
//                   className=""
//                 />
//               </div>
//             )}
//           </div>

//           {/* Full-page iframe */}
//           <div className="flex-1 min-h-0">
//             <iframe
//               ref={fullPreviewRef}
//               title="Portfolio Preview (Full Page)"
//               src={templateSrc}
//               className="w-full h-full"
//               onLoad={() => tryPostToPreview(undefined, fullPreviewRef)}
//             />
//           </div>
//         </div>
//       )}

//       <Footer />
//     </div>
//   );
// }

// export default function App() {
//   return (
//     <>
//       <AppContent />
//       <Toaster
//         position="top-right"
//         toastOptions={{
//           duration: 4000,
//           style: {
//             background: '#363636',
//             color: '#fff',
//           },
//           success: {
//             duration: 3000,
//             iconTheme: {
//               primary: '#4ade80',
//               secondary: '#fff',
//             },
//           },
//           error: {
//             duration: 5000,
//             iconTheme: {
//               primary: '#ef4444',
//               secondary: '#fff',
//             },
//           },
//         }}
//       />
//     </>
//   );
// }



//from the start 
import React, { useState, useRef, useMemo, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Toaster } from "react-hot-toast";

import LandingPage from "./LandingPage";
import PortfolioDownloader from "./components/PortfolioDownloader";

// ----------------------
// Gemini Configuration
// ----------------------

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;
// Both models accept the PDF and image resume inputs used below. The lighter
// fallback keeps the workflow available during temporary capacity spikes.
const GEMINI_MODELS = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
const MAX_RETRIES_PER_MODEL = 3;
const EDITABLE_SECTIONS = [
  ["summary", "About"],
  ["education", "Education"],
  ["experience", "Experience"],
  ["projects", "Projects"],
  ["technical_skills", "Skills"],
  ["certifications", "Certifications"],
  ["achievements", "Achievements"],
];

const DEFAULT_TEMPLATE_SETTINGS = {
  theme: "light",
  fontSize: 16,
  spacing: 32,
  radius: 16,
  recruiterMode: false,
};

function ensureGeminiConfigured() {
  if (!ai) {
    throw new Error(
      "Gemini is not configured. Add VITE_GEMINI_API_KEY to .env.local and restart the app."
    );
  }
}

function isTemporaryGeminiError(error) {
  const status = error?.status ?? error?.error?.status;
  const code = error?.code ?? error?.error?.code;
  return status === "UNAVAILABLE" || code === 503 || /\b503\b|high demand|temporar/i.test(error?.message ?? "");
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function generateWithFallback(request) {
  ensureGeminiConfigured();

  for (const model of GEMINI_MODELS) {
    for (let attempt = 0; attempt < MAX_RETRIES_PER_MODEL; attempt += 1) {
      try {
        return await ai.models.generateContent({ ...request, model });
      } catch (error) {
        if (!isTemporaryGeminiError(error)) throw error;

        if (attempt < MAX_RETRIES_PER_MODEL - 1) {
          // Exponential backoff with a small jitter avoids retry bursts.
          await wait(800 * 2 ** attempt + Math.floor(Math.random() * 400));
        }
      }
    }
  }

  throw new Error(
    "Gemini is temporarily busy. We retried both available models; please try again in a minute."
  );
}

// ----------------------
// Helper Functions
// ----------------------

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);

  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });

  return window.btoa(binary);
}

// ============================
// Header
// ============================

function Header() {
  return (
    <header className="sticky top-0 z-30 bg-white border-b">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Portfolio Generator
        </h1>
      </div>
    </header>
  );
}

// ============================
// Hero
// ============================

function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-14">
      <h2 className="text-5xl font-extrabold">
        Build Your Professional Portfolio
      </h2>

      <p className="mt-5 text-gray-600 text-lg max-w-3xl">
        Upload your resume, connect GitHub and let Gemini generate your
        complete portfolio JSON automatically.
      </p>
    </section>
  );
}

// ============================
// Progress Bar
// ============================

function ProgressBar({ label }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
      <div className="bg-violet-600 h-4 w-full animate-pulse"></div>

      <p className="text-center text-sm mt-2">
        {label}
      </p>
    </div>
  );
}

// ============================
// Step Card
// ============================

function StepCard({ number, title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-md border p-8">
      <h2 className="text-2xl font-bold mb-5">
        {number}. {title}
      </h2>

      {children}
    </div>
  );
}

// ============================
// Footer
// ============================

function Footer() {
  return (
    <footer className="border-t mt-20 py-8 text-center text-gray-500">
      © 2026 Portfolio Generator
    </footer>
  );
}

function AppContent() {

  // Landing Page
  const [showLanding, setShowLanding] = useState(true);

  // Resume
  const [file, setFile] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeRaw, setResumeRaw] = useState("");

  // GitHub
  const [username, setUsername] = useState("");
  const [ghToken, setGhToken] = useState("");
  const [githubLoading, setGithubLoading] = useState(false);
  const [ghError, setGhError] = useState("");
  const [portfolio, setPortfolio] = useState(null);

  // Final JSON
  const [consolidateLoading, setConsolidateLoading] = useState(false);
  const [finalJson, setFinalJson] = useState("");

  // Template
  const [selectedTemplate, setSelectedTemplate] = useState("template1");
  const [templateSettings, setTemplateSettings] = useState(DEFAULT_TEMPLATE_SETTINGS);
  const [sectionOrder, setSectionOrder] = useState(EDITABLE_SECTIONS.map(([key]) => key));
  const [draggedSection, setDraggedSection] = useState(null);

  // Preview
  const previewRef = useRef(null);
  const fullPreviewRef = useRef(null);

  const [showFullPagePreview, setShowFullPagePreview] = useState(false);

  const templateSrc = useMemo(
    () => `/template/${selectedTemplate}.html`,
    [selectedTemplate]
  );

  // File Upload
  const inputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);

  const fileLabel = useMemo(
    () => (file ? file.name : "Choose Resume"),
    [file]
  );

    const validMime = (file) => {

    const allowed = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp"
    ];

    if (allowed.includes(file.type)) return true;

    return /\.(pdf|png|jpg|jpeg|webp)$/i.test(file.name);
  };

  const onChangeFile = (e) => {

    const f = e.target.files?.[0];

    if (!f) return;

    if (!validMime(f)) {
      alert("Please upload PDF or Image");
      return;
    }

    setFile(f);

  };

    const onDrop = (e) => {

    e.preventDefault();

    const f = e.dataTransfer.files[0];

    if (!f) return;

    if (!validMime(f)) {
      alert("Invalid File");
      return;
    }

    setFile(f);
    setIsDragging(false);

  };

  const onDragOver = (e) => {

    e.preventDefault();
    setIsDragging(true);

  };

  const onDragLeave = () => {

    setIsDragging(false);

  };

  const onClickDropzone = () => {

    inputRef.current.click();

  };
  // ===================================
// STEP 1 - Extract Resume
// ===================================

const handleExtractResume = async () => {

  setResumeLoading(true);
  setResumeRaw("");

  try {

    ensureGeminiConfigured();

    if (!file) {
      throw new Error("Please upload a resume.");
    }

    const ext = file.name.split(".").pop().toLowerCase();

    const buffer = await file.arrayBuffer();

    let contents = [];

    if (ext === "pdf") {

      contents = [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: arrayBufferToBase64(buffer),
          },
        },
        {
          text:
            "Extract all resume text exactly. Return only plain text. Do not summarize.",
        },
      ];

    } else {

      contents = [
        {
          inlineData: {
            mimeType: file.type,
            data: arrayBufferToBase64(buffer),
          },
        },
        {
          text:
            "Read this resume image carefully and extract all text exactly. Return only plain text.",
        },
      ];

    }

    const response = await generateWithFallback({ contents });

    const text =
      response.text ||
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "";

    if (!text) {
      throw new Error("Nothing extracted from resume.");
    }

    setResumeRaw(text);

  } catch (err) {

    console.error(err);

    setResumeRaw("Error : " + err.message);

  } finally {

    setResumeLoading(false);

  }

};

// ===================================
// STEP 2 - Fetch GitHub
// ===================================

const handleFetchGitHub = async () => {

  if (!username.trim()) {
    setGhError("Please enter a GitHub username.");
    return;
  }

  setGithubLoading(true);
  setGhError("");

  try {

    const headers = ghToken
      ? {
          Authorization: `Bearer ${ghToken}`,
        }
      : {};

    // ---------------------
    // Fetch Profile
    // ---------------------

    const profileRes = await fetch(
      `https://api.github.com/users/${username}`,
      { headers }
    );

    if (!profileRes.ok) {
      throw new Error("GitHub user not found.");
    }

    const profile = await profileRes.json();

    // ---------------------
    // Fetch Repositories
    // ---------------------

    const repoRes = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
      { headers }
    );

    if (!repoRes.ok) {
      throw new Error("Unable to fetch repositories.");
    }

    const repos = await repoRes.json();

    const githubData = {

      personal: {

        username: profile.login,
        name: profile.name,
        bio: profile.bio,
        avatar: profile.avatar_url,
        followers: profile.followers,
        following: profile.following,
        publicRepos: profile.public_repos,
        githubUrl: profile.html_url,
        location: profile.location,
        website: profile.blog

      },

      projects: repos.map(repo => ({

        title: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        repo: repo.html_url,
        homepage: repo.homepage

      }))

    };

    setPortfolio(githubData);

  } catch (err) {

    console.error(err);

    setGhError(err.message);

  } finally {

    setGithubLoading(false);

  }

};

// ===================================
// STEP 3 - Generate Portfolio JSON
// ===================================

const handleConsolidate = async () => {

  setConsolidateLoading(true);
  setFinalJson("");

  try {

    ensureGeminiConfigured();

    if (!resumeRaw) {
      throw new Error("Extract the resume first.");
    }

    if (!portfolio) {
      throw new Error("Fetch GitHub profile first.");
    }

    const prompt = `
You are an expert resume parser.

Combine the resume and GitHub profile into ONE JSON object.

Return ONLY valid JSON.

Schema:

{
  "contact_information": {
    "name":"",
    "email":"",
    "phone":"",
    "linkedin_url":"",
    "github_url":""
  },

  "summary":"",

  "education":[],

  "experience":[],

  "projects":[],

  "technical_skills":{

      "languages":[],
      "frameworks_libraries":[],
      "databases":[],
      "tools":[]

  },

  "certificates":[],

  "achievements":[],

  "github_profile":{}

}

Resume:

${resumeRaw}

GitHub:

${JSON.stringify(portfolio, null, 2)}

`;

    const response = await generateWithFallback({ contents: prompt });

    const text =
      response.text ||
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "";

    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    // Remove markdown if Gemini returns ```json
    const clean = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(clean);

    setFinalJson(JSON.stringify(parsed, null, 2));

  } catch (err) {

    console.error(err);

    setFinalJson("Error: " + err.message);

  } finally {

    setConsolidateLoading(false);

  }

};

// ===================================
// Helper Functions
// ===================================

function safeParsePortfolio(data) {
  if (!data) return null;

  try {
    if (typeof data === "object") return data;

    let text = String(data)
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(text);
  } catch {
    return null;
  }
}

function tryPostToPreview(targetRef = previewRef) {
  const data = safeParsePortfolio(finalJson);

  const frame = targetRef.current;

  if (!frame) return;

  if (data) {
    frame.contentWindow?.postMessage(
      {
        type: "APPLY_PORTFOLIO",
        payload: data,
      },
      window.location.origin
    );
  }

  frame.contentWindow?.postMessage(
    {
      type: "APPLY_TEMPLATE_SETTINGS",
      payload: { settings: templateSettings, sectionOrder },
    },
    window.location.origin
  );
}

function openFullPage() {
  setShowFullPagePreview(true);

  setTimeout(() => {
    tryPostToPreview(fullPreviewRef);
  }, 300);
}

const copyFinalJson = async () => {
  if (!finalJson) return;

  await navigator.clipboard.writeText(finalJson);
};

const handleGetStarted = () => {
  setShowLanding(false);
};

useEffect(() => {
  tryPostToPreview();
// Template controls deliberately trigger a preview refresh whenever they change.
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [templateSettings, sectionOrder]);

useEffect(() => {
  const listener = (event) => {
    if (event.origin !== window.location.origin) return;

    if (event.data === "REQUEST_PORTFOLIO") {
      tryPostToPreview();
    }
  };

  window.addEventListener("message", listener);

  return () => {
    window.removeEventListener("message", listener);
  };
// `tryPostToPreview` is recreated as form state changes; registering once avoids
// repeatedly attaching the window listener while it continues to read current state.
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// Landing Page

if (showLanding) {
  return <LandingPage onGetStarted={handleGetStarted} />;
}

return (
  <div className="min-h-screen bg-white">

    <Header />

    <Hero />

    <div className="max-w-6xl mx-auto px-6 space-y-10 pb-20">

      {/* ========================= */}
      {/* STEP 1 */}
      {/* ========================= */}

      <StepCard
        number="1"
        title="Upload Resume"
      >

        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={onClickDropzone}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition
          ${
            isDragging
              ? "border-violet-600 bg-violet-50"
              : "border-gray-300"
          }`}
        >

          <input
            ref={inputRef}
            hidden
            type="file"
            accept=".pdf,image/*"
            onChange={onChangeFile}
          />

          <h3 className="text-xl font-semibold">

            Drag & Drop Resume

          </h3>

          <p className="text-gray-500 mt-2">

            or click to browse

          </p>

          <p className="mt-4 font-semibold">

            {fileLabel}

          </p>

        </div>

        <button
          onClick={handleExtractResume}
          disabled={!file || resumeLoading}
          className="mt-6 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg"
        >

          {resumeLoading
            ? "Extracting..."
            : "Extract Resume"}

        </button>
                {

          resumeLoading && (

            <div className="mt-5">

              <ProgressBar
                label="Extracting Resume..."
              />

            </div>

          )

        }

        {

          resumeRaw && (

            <div className="mt-6">

              <SyntaxHighlighter
                language="text"
                style={oneLight}
              >

                {resumeRaw}

              </SyntaxHighlighter>

            </div>

          )

        }

      </StepCard>
      {/* ========================= */}
{/* STEP 2 */}
{/* ========================= */}

<StepCard
  number="2"
  title="Connect GitHub"
>

  <div className="space-y-4">

    <input
      type="text"
      placeholder="GitHub Username"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      className="w-full border rounded-lg p-3"
    />

    <input
      type="password"
      placeholder="GitHub Token (Optional)"
      value={ghToken}
      onChange={(e) => setGhToken(e.target.value)}
      className="w-full border rounded-lg p-3"
    />

    <button
      onClick={handleFetchGitHub}
      disabled={githubLoading}
      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg"
    >

      {

        githubLoading

        ? "Fetching..."

        : "Fetch GitHub Data"

      }

    </button>

  </div>
  {

  githubLoading && (

    <div className="mt-5">

      <ProgressBar
        label="Fetching GitHub..."
      />

    </div>

  )

}

{

  ghError && (

    <div className="mt-5 text-red-600">

      {ghError}

    </div>

  )

}

{

  portfolio && (

    <div className="mt-6">

      <SyntaxHighlighter
        language="json"
        style={oneLight}
      >

        {JSON.stringify(portfolio, null, 2)}

      </SyntaxHighlighter>

    </div>

  )

}

</StepCard>
{/* ========================= */}
{/* STEP 3 */}
{/* ========================= */}

<StepCard
  number="3"
  title="Generate Portfolio JSON"
>

  <button
    onClick={handleConsolidate}
    disabled={consolidateLoading}
    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
  >

    {

      consolidateLoading

      ? "Generating..."

      : "Generate JSON"

    }

  </button>
  {

  consolidateLoading && (

    <div className="mt-5">

      <ProgressBar
        label="Generating Portfolio..."
      />

    </div>

  )

}

{

  finalJson && (

    <div className="mt-6">

      <div className="flex justify-end mb-3">

        <button
          onClick={copyFinalJson}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >

          Copy JSON

        </button>

      </div>

      <SyntaxHighlighter
        language="json"
        style={oneLight}
      >

        {finalJson}

      </SyntaxHighlighter>

    </div>

  )

}

</StepCard>

{/* ========================= */}
{/* STEP 4 */}
{/* ========================= */}

<StepCard
  number="4"
  title="Portfolio Preview"
>

  <div className="flex items-center gap-4 mb-6">

    <label className="font-medium">

      Select Template

    </label>

    <select

      value={selectedTemplate}

      onChange={(e) => setSelectedTemplate(e.target.value)}

      className="border rounded-lg p-2"

    >

      <option value="template1">Template 1</option>

      <option value="template2">Template 2</option>

      <option value="template3">Template 3</option>

    </select>

    <button

      onClick={tryPostToPreview}

      className="bg-violet-600 text-white px-5 py-2 rounded-lg"

    >

      Apply Data

    </button>

    <button

      onClick={openFullPage}

      className="bg-gray-800 text-white px-5 py-2 rounded-lg"

    >

      Open Full Page

    </button>

  </div>

  <div className="mb-6 rounded-xl border bg-slate-50 p-4">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 className="font-semibold text-slate-900">Template editor</h3>
        <p className="text-sm text-slate-600">Customize the live preview and drag sections into the order you want.</p>
      </div>
      <button
        onClick={() => { setTemplateSettings(DEFAULT_TEMPLATE_SETTINGS); setSectionOrder(EDITABLE_SECTIONS.map(([key]) => key)); }}
        className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-slate-100"
      >
        Reset editor
      </button>
    </div>

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <label className="text-sm font-medium">Theme
        <select value={templateSettings.theme} onChange={(event) => setTemplateSettings((current) => ({ ...current, theme: event.target.value }))} className="mt-1 w-full rounded border bg-white p-2">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
      <label className="text-sm font-medium">Font size: {templateSettings.fontSize}px
        <input type="range" min="14" max="20" value={templateSettings.fontSize} onChange={(event) => setTemplateSettings((current) => ({ ...current, fontSize: Number(event.target.value) }))} className="mt-2 w-full" />
      </label>
      <label className="text-sm font-medium">Spacing: {templateSettings.spacing}px
        <input type="range" min="16" max="56" step="4" value={templateSettings.spacing} onChange={(event) => setTemplateSettings((current) => ({ ...current, spacing: Number(event.target.value) }))} className="mt-2 w-full" />
      </label>
      <label className="text-sm font-medium">Corner radius: {templateSettings.radius}px
        <input type="range" min="0" max="28" step="2" value={templateSettings.radius} onChange={(event) => setTemplateSettings((current) => ({ ...current, radius: Number(event.target.value) }))} className="mt-2 w-full" />
      </label>
      <label className="flex cursor-pointer items-center gap-2 rounded-lg border bg-white p-3 text-sm font-medium">
        <input type="checkbox" checked={templateSettings.recruiterMode} onChange={(event) => setTemplateSettings((current) => ({ ...current, recruiterMode: event.target.checked }))} />
        Recruiter mode
      </label>
    </div>

    <div className="mt-5">
      <p className="mb-2 text-sm font-medium">Section order</p>
      <div className="flex flex-wrap gap-2">
        {sectionOrder.map((key) => {
          const label = EDITABLE_SECTIONS.find(([sectionKey]) => sectionKey === key)?.[1] || key;
          return (
            <button
              key={key}
              draggable
              onDragStart={() => setDraggedSection(key)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (!draggedSection || draggedSection === key) return;
                setSectionOrder((current) => {
                  const next = current.filter((item) => item !== draggedSection);
                  next.splice(next.indexOf(key), 0, draggedSection);
                  return next;
                });
                setDraggedSection(null);
              }}
              className="cursor-grab rounded-lg border border-dashed bg-white px-3 py-2 text-sm text-slate-700 active:cursor-grabbing"
              title="Drag to reorder this section"
            >
              ⠿ {label}
            </button>
          );
        })}
      </div>
    </div>
  </div>
  <iframe

  ref={previewRef}

  title="Portfolio Preview"

  src={templateSrc}

  className="w-full h-[800px] border rounded-xl"

  onLoad={tryPostToPreview}

/>

{

  finalJson && (

    <div className="mt-6">

      <PortfolioDownloader

        portfolioData={safeParsePortfolio(finalJson)}

        templateName={selectedTemplate}

      />

    </div>

  )

}

</StepCard>
    </div>

    {

      showFullPagePreview && (

        <div className="fixed inset-0 bg-white z-50">

          <div className="flex justify-between items-center p-4 border-b">

            <button

              onClick={() => setShowFullPagePreview(false)}

              className="px-4 py-2 bg-gray-200 rounded"

            >

              ← Back

            </button>

          </div>

          <iframe

            ref={fullPreviewRef}

            src={templateSrc}

            className="w-full h-[95vh]"

            onLoad={() => tryPostToPreview(fullPreviewRef)}

          />

        </div>

      )

    }

    <Footer />

  </div>

);

}
export default function App() {

  return (

    <>

      <AppContent />

      <Toaster />

    </>

  );

}

