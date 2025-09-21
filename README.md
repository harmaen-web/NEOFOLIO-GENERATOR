# Portfolio Generator (React + Vite)

An AI-assisted portfolio generator. Upload a resume, fetch GitHub data, consolidate into a strict JSON schema, and preview multiple portfolio templates. You can also open a full standalone page for sharing.

## Tech Stack
- **React 19** and **Vite 7**
- **Tailwind CSS v4** with **@tailwindcss/vite**
- **Templates**: Static HTML templates styled with Tailwind
- **Syntax highlighting**: `react-syntax-highlighter`
- **PDF/image OCR (optional inputs)**: `pdfjs-dist`, `tesseract.js`
- **DOCX to text (optional inputs)**: `mammoth`
- **Icons**: `lucide-react`
- **AI**: Google GenAI Web SDK (loaded via CDN)
- **Data sources**: GitHub REST API (public)

## Requirements
- Node.js >= 18.17
- npm >= 9

## Quick Start
1. Install dependencies
   ```bash
   npm i
   ```
2. Start the dev server
   ```bash
   npm run dev
   ```
3. Open the printed local URL (typically http://localhost:5173)

## Scripts
- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint
- `npm start` — alias of `vite` for convenience

## Configuration Notes
- AI key: In `src/App.jsx`, replace the placeholder `API_KEY` value with your Gemini API key:
  ```js
  const API_KEY = "YOUR_GEMINI_API_KEY";
  ```
  The SDK is imported from a CDN: `https://aistudiocdn.com/@google/genai@^1.20.0`.

- Google OAuth: To enable Google Sign-In functionality:
  1. Go to [Google Cloud Console](https://console.developers.google.com/)
  2. Create a new project or select an existing one
  3. Enable the Google+ API
  4. Create OAuth 2.0 credentials (Web application)
  5. Add your domain to authorized origins (e.g., `http://localhost:5173` for development)
  6. Copy the Client ID and replace `YOUR_GOOGLE_CLIENT_ID` in `src/components/GoogleSignInButton.jsx`
  7. Or set the environment variable `REACT_APP_GOOGLE_CLIENT_ID` in your `.env` file

- Templates live in `public/template/` and support direct opening with data loaded from `localStorage` via the "Open Full Page" button.

## Project Structure (essentials)
```
root
├─ public/
│  └─ template/
│     ├─ template1.html
│     ├─ template2.html
│     └─ template3.html
├─ src/
│  ├─ App.jsx
│  ├─ LandingPage.jsx
│  ├─ components/
│  │  └─ GoogleSignInButton.jsx
│  ├─ utils/
│  │  └─ googleAuth.js
│  ├─ main.jsx
│  └─ index.css
├─ package.json
├─ vite.config.js
└─ README.md
```

## How It Works (high level)
1. Upload resume (PDF/Image supported) and extract text using GenAI vision when relevant.
2. Fetch GitHub profile and repositories by username.
3. Consolidate into a strict JSON schema via GenAI, then normalize/validate on the client.
4. Preview in an iframe or open as a standalone page.

## Troubleshooting
- If ports are in use, change the Vite port or stop the conflicting process.
- If icons for certain skills don’t load, the text label still renders. Add more icons in the templates’ `iconMap` if needed.
- If your AI key is invalid or missing, Step 1/3 requests will fail. Update `API_KEY` in `src/App.jsx`.

## License
MIT (adjust if needed)