import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ResumeExtractor from './ResumeExtractor.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ResumeExtractor />
  </StrictMode>,
)
