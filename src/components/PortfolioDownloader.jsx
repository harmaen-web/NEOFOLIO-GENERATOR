import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ExternalLink, CheckCircle, Copy, Globe, FileText } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

const PortfolioDownloader = ({ portfolioData, templateName, className = '' }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [copiedStep, setCopiedStep] = useState(null);

  // Parse the portfolio data properly
  const parsePortfolioData = (data) => {
    try {
      // If data is a string, parse it
      if (typeof data === 'string') {
        return JSON.parse(data);
      }
      // If data is already an object, return it
      return data;
    } catch (error) {
      console.error('Error parsing portfolio data:', error);
      return {};
    }
  };

  const generatePortfolioFiles = () => {
    try {
      const userData = parsePortfolioData(portfolioData);
      
      if (!userData || typeof userData !== 'object') {
        throw new Error('Invalid portfolio data: data is not a valid object');
      }
      
      console.log('Generating portfolio files with data:', userData);
      
      // Generate the portfolio HTML using Tailwind (no separate CSS file)
      const htmlContent = generateHTMLTailwind(userData, templateName);
      const jsContent = generateJS(userData);
      const userDataJson = JSON.stringify(userData, null, 2);
      
      return {
        'index.html': htmlContent,
        'assets/main.js': jsContent,
        'assets/userData.json': userDataJson,
        '_redirects': '/* /index.html 200',
        'README.txt': generateReadme()
      };
    } catch (error) {
      console.error('Error in generatePortfolioFiles:', error);
      throw new Error(`Failed to generate portfolio files: ${error.message}`);
    }
  };

  const generateReadme = () => {
    return `Steps to Deploy Your Portfolio on Netlify:

1. Unzip the folder you downloaded.

2. Go to https://app.netlify.com/drop

3. Drag and drop the unzipped folder (it should contain index.html, assets/, etc.).

4. Wait a few seconds for deployment.

5. Netlify will give you a link like: https://your-portfolio.netlify.app

6. Share this link in your Resume, LinkedIn, or GitHub profile.

Alternative Method:
- Go to https://app.netlify.com
- Sign up/Login (free)
- Click "Add new site" → "Deploy manually"
- Drag and drop your unzipped folder
- Your portfolio will be live in seconds!

Custom Domain (Optional):
- In Site Settings → Domain → you can rename or connect your own domain
- Example: yourname.com instead of your-portfolio.netlify.app

Troubleshooting:
- If images don't load, check that all files are in the correct folders
- If the site doesn't work, make sure index.html is in the root folder
- For React Router support, the _redirects file is already included

Need Help?
- Netlify Documentation: https://docs.netlify.com/
- Support: https://www.netlify.com/support/
`;
  };

  const generateHTML = (data, template) => {
    try {
      // Extract data using the consolidated schema structure
      const contactInfo = data.contact_information || {};
      const githubProfile = data.github_profile_overview || {};
      
      const name = contactInfo.name || 'Your Name';
      const email = contactInfo.email || 'your.email@example.com';
      const phone = contactInfo.phone || '+1 (555) 123-4567';
      const linkedinUrl = contactInfo.linkedin_url || '';
      const githubUrl = contactInfo.github_url || githubProfile.github_url || '';
      
      const about = (data.summary || 'Passionate professional with expertise in modern technologies and a drive for continuous learning and innovation.').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      const picture = githubProfile.profile_pic || 'https://via.placeholder.com/150/667eea/ffffff?text=' + encodeURIComponent(name.charAt(0));
      
      // Extract skills from technical_skills structure - ensure all are arrays and filter invalid entries
      const technicalSkills = data.technical_skills || {};
      const allSkills = [
        ...(Array.isArray(technicalSkills.languages) ? technicalSkills.languages : []),
        ...(Array.isArray(technicalSkills.frameworks_libraries) ? technicalSkills.frameworks_libraries : []),
        ...(Array.isArray(technicalSkills.databases) ? technicalSkills.databases : []),
        ...(Array.isArray(technicalSkills.authentication_apis) ? technicalSkills.authentication_apis : []),
        ...(Array.isArray(technicalSkills.dev_tools) ? technicalSkills.dev_tools : []),
        ...(Array.isArray(technicalSkills.ai_cv_tools) ? technicalSkills.ai_cv_tools : [])
      ].filter(skill => skill && typeof skill === 'string');
      
      // Extract experience - ensure it's an array and filter out invalid entries
      const experience = Array.isArray(data.experience) ? data.experience.filter(exp => exp && typeof exp === 'object') : [];
      
      // Extract projects (combine regular projects and github projects) - ensure arrays and filter invalid entries
      const regularProjects = Array.isArray(data.projects) ? data.projects.filter(proj => proj && typeof proj === 'object') : [];
      const githubProjects = Array.isArray(data.github_projects) ? data.github_projects.filter(proj => proj && typeof proj === 'object') : [];
      const projects = [...regularProjects, ...githubProjects];

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} - Professional Portfolio</title>
    <meta name="description" content="Professional portfolio of ${name} - Professional">
    <meta name="keywords" content="portfolio, ${name}, professional, developer">
    <link rel="stylesheet" href="assets/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="icon" type="image/x-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>👨‍💻</text></svg>">
</head>
<body>
    <div id="portfolio">
        <header class="portfolio-header">
            <div class="container">
                <div class="header-content">
                    <div class="profile-section">
                        <img src="${picture}" alt="${name}" class="profile-image" onerror="this.src='https://via.placeholder.com/150/667eea/ffffff?text=${encodeURIComponent(name.charAt(0))}'">
                        <div class="profile-info">
                            <h1 class="name">${name}</h1>
                            <p class="title">Professional</p>
                            <p class="email">${email}</p>
                        </div>
                    </div>
                    <div class="contact-info">
                        <div class="contact-item">
                            <strong>Phone:</strong> ${phone}
                        </div>
                        ${githubUrl ? `<div class="contact-item"><strong>GitHub:</strong> <a href="${githubUrl}" target="_blank" class="text-white hover:underline">${githubUrl}</a></div>` : ''}
                        ${linkedinUrl ? `<div class="contact-item"><strong>LinkedIn:</strong> <a href="${linkedinUrl}" target="_blank" class="text-white hover:underline">${linkedinUrl}</a></div>` : ''}
                    </div>
                </div>
            </div>
        </header>

        <main class="portfolio-main">
            <div class="container">
                <section class="section">
                    <h2>About Me</h2>
                    <p>${about}</p>
                </section>

                <section class="section">
                    <h2>Skills</h2>
                    <div class="skills-grid">
                        ${allSkills.filter(skill => skill && typeof skill === 'string').map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                </section>

                <section class="section">
                    <h2>Experience</h2>
                    <div class="experience-list">
                        ${experience.filter(exp => exp && (exp.company || exp.role || exp.title)).map(exp => `
                          <div class="experience-item">
                            <h3>${exp.role || exp.title || 'Position'}</h3>
                            <p class="company">${exp.company || 'Company'}</p>
                            <p class="duration">${exp.duration || [exp.start_date, exp.end_date].filter(Boolean).join(' - ') || 'Duration'}</p>
                            ${exp.location ? `<p class="location">${exp.location}</p>` : ''}
                            ${exp.responsibilities && exp.responsibilities.length > 0 ? `
                              <ul class="responsibilities">
                                ${exp.responsibilities.filter(resp => resp && typeof resp === 'string').map(resp => `<li>${resp}</li>`).join('')}
                              </ul>
                            ` : ''}
                          </div>
                        `).join('')}
                    </div>
                </section>

                <section class="section">
                    <h2>Projects</h2>
                    <div class="projects-grid">
                        ${projects.filter(project => project && (project.title || project.name)).map(project => `
                          <div class="project-card">
                            <h3>${project.title || project.name || 'Project'}</h3>
                            <p>${project.description || 'Project description'}</p>
                            <div class="project-tech">${Array.isArray(project.technologies) ? project.technologies.filter(tech => tech && typeof tech === 'string').join(', ') : (project.tech_stack || 'Technology')}</div>
                            ${project.github_link || project.repo_link ? `<a href="${project.github_link || project.repo_link}" target="_blank" class="project-link">View Project</a>` : ''}
                            ${project.live_demo ? `<a href="${project.live_demo}" target="_blank" class="project-link">Live Demo</a>` : ''}
                            ${project.stars ? `<span class="project-stats">⭐ ${project.stars}</span>` : ''}
                            ${project.forks ? `<span class="project-stats">🍴 ${project.forks}</span>` : ''}
                          </div>
                        `).join('')}
                    </div>
                </section>

                ${data.education && Array.isArray(data.education) && data.education.length > 0 ? `
                <section class="section">
                    <h2>Education</h2>
                    <div class="education-list">
                        ${data.education.filter(edu => edu && (edu.institution || edu.degree)).map(edu => `
                          <div class="education-item">
                            <h3>${edu.degree || 'Degree'}</h3>
                            <p class="institution">${edu.institution || 'Institution'}</p>
                            <p class="duration">${edu.years || 'Duration'}</p>
                            ${edu.cgpa ? `<p class="cgpa">CGPA: ${edu.cgpa}</p>` : ''}
                          </div>
                        `).join('')}
                    </div>
                </section>
                ` : ''}
            </div>
        </main>

        <footer class="portfolio-footer">
            <div class="container">
                <p>&copy; 2024 ${name}. All rights reserved.</p>
                <p class="footer-note">Built with ❤️ using AI Portfolio Generator</p>
            </div>
        </footer>
    </div>
    <script src="assets/main.js"></script>
</body>
</html>`;
    } catch (error) {
      console.error('Error generating HTML:', error);
      throw new Error(`HTML generation failed: ${error.message}`);
    }
  };

  const generateHTMLTailwind = (data, template) => {
    try {
      const contactInfo = data.contact_information || {};
      const githubProfile = data.github_profile_overview || {};

      const name = contactInfo.name || 'Your Name';
      const email = contactInfo.email || 'your.email@example.com';
      const phone = contactInfo.phone || '+1 (555) 123-4567';
      const linkedinUrl = contactInfo.linkedin_url || '';
      const githubUrl = contactInfo.github_url || githubProfile.github_url || '';

      const about = (data.summary || 'Passionate professional with expertise in modern technologies and a drive for continuous learning and innovation.').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      const picture = githubProfile.profile_pic || 'https://via.placeholder.com/150/667eea/ffffff?text=' + encodeURIComponent(name.charAt(0));

      const technicalSkills = data.technical_skills || {};
      const allSkills = [
        ...(Array.isArray(technicalSkills.languages) ? technicalSkills.languages : []),
        ...(Array.isArray(technicalSkills.frameworks_libraries) ? technicalSkills.frameworks_libraries : []),
        ...(Array.isArray(technicalSkills.databases) ? technicalSkills.databases : []),
        ...(Array.isArray(technicalSkills.authentication_apis) ? technicalSkills.authentication_apis : []),
        ...(Array.isArray(technicalSkills.dev_tools) ? technicalSkills.dev_tools : []),
        ...(Array.isArray(technicalSkills.ai_cv_tools) ? technicalSkills.ai_cv_tools : [])
      ].filter(skill => skill && typeof skill === 'string');

      const experience = Array.isArray(data.experience) ? data.experience.filter(exp => exp && typeof exp === 'object') : [];

      const regularProjects = Array.isArray(data.projects) ? data.projects.filter(proj => proj && typeof proj === 'object') : [];
      const githubProjects = Array.isArray(data.github_projects) ? data.github_projects.filter(proj => proj && typeof proj === 'object') : [];
      const projects = [...regularProjects, ...githubProjects];

      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} - Professional Portfolio</title>
  <meta name="description" content="Professional portfolio of ${name} - Professional">
  <meta name="keywords" content="portfolio, ${name}, professional, developer">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="icon" type="image/x-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>👨‍💻</text></svg>">
</head>
<body class="font-sans text-gray-800 bg-slate-50">
  <div id="portfolio">
    <header class="bg-gradient-to-tr from-indigo-500 to-purple-600 text-white py-16">
      <div class="max-w-6xl mx-auto px-5">
        <div class="flex items-center gap-10 flex-wrap">
          <div class="flex items-center gap-5">
            <img src="${picture}" alt="${name}" class="w-28 h-28 rounded-full object-cover border-4 border-white/20" onerror="this.src='https://via.placeholder.com/150/667eea/ffffff?text=${encodeURIComponent(name.charAt(0))}'">
            <div>
              <h1 class="text-4xl font-bold mb-1">${name}</h1>
              <p class="text-lg opacity-90">Professional</p>
              <p class="text-sm opacity-80">${email}</p>
            </div>
          </div>
          <div class="ml-auto space-y-2">
            <div class="text-sm"><strong class="font-semibold">Phone:</strong> ${phone}</div>
            ${githubUrl ? `<div class="text-sm contact-item"><strong class="font-semibold">GitHub:</strong> <a href="${githubUrl}" target="_blank" class="text-white underline underline-offset-2">${githubUrl}</a></div>` : ''}
            ${linkedinUrl ? `<div class="text-sm contact-item"><strong class="font-semibold">LinkedIn:</strong> <a href="${linkedinUrl}" target="_blank" class="text-white underline underline-offset-2">${linkedinUrl}</a></div>` : ''}
          </div>
        </div>
      </div>
    </header>

    <main class="py-16">
      <div class="max-w-6xl mx-auto px-5 space-y-10">
        <section class="bg-white rounded-xl p-10 shadow-sm">
          <h2 class="text-2xl font-semibold mb-4">About Me</h2>
          <p>${about}</p>
        </section>

        <section class="bg-white rounded-xl p-10 shadow-sm">
          <h2 class="text-2xl font-semibold mb-4">Skills</h2>
          <div class="flex flex-wrap gap-2">
            ${allSkills.map(skill => `<span class="inline-block rounded-full bg-indigo-100 text-indigo-700 px-3 py-1 text-sm">${skill}</span>`).join('')}
          </div>
        </section>

        <section class="bg-white rounded-xl p-10 shadow-sm">
          <h2 class="text-2xl font-semibold mb-6">Experience</h2>
          <div class="space-y-6">
            ${experience.map(exp => `
              <div class="rounded-lg border border-slate-200 p-6">
                <h3 class="text-xl font-semibold">${exp.role || exp.title || 'Position'}</h3>
                <p class="text-slate-600">${exp.company || 'Company'}</p>
                <p class="text-sm text-slate-500">${exp.duration || [exp.start_date, exp.end_date].filter(Boolean).join(' - ') || 'Duration'}</p>
                ${exp.location ? `<p class="text-sm text-slate-500">${exp.location}</p>` : ''}
                ${exp.responsibilities && exp.responsibilities.length > 0 ? `
                  <ul class="list-disc pl-6 mt-3 space-y-1">
                    ${exp.responsibilities.filter(r => r && typeof r === 'string').map(r => `<li>${r}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </section>

        <section class="bg-white rounded-xl p-10 shadow-sm">
          <h2 class="text-2xl font-semibold mb-6">Projects</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${projects.map(project => `
              <div class="rounded-xl border border-slate-200 p-6 hover:shadow transition">
                <h3 class="text-lg font-semibold">${project.title || project.name || 'Project'}</h3>
                <p class="mt-1">${project.description || 'Project description'}</p>
                <div class="text-sm text-slate-600 mt-2">${Array.isArray(project.technologies) ? project.technologies.filter(tech => tech && typeof tech === 'string').join(', ') : (project.tech_stack || 'Technology')}</div>
                <div class="mt-3 space-x-4">
                  ${project.github_link || project.repo_link ? `<a href="${project.github_link || project.repo_link}" target="_blank" class="text-indigo-600 hover:underline font-medium">View Project</a>` : ''}
                  ${project.live_demo ? `<a href="${project.live_demo}" target="_blank" class="text-indigo-600 hover:underline font-medium">Live Demo</a>` : ''}
                </div>
                <div class="mt-2 space-x-3">
                  ${project.stars ? `<span class="inline-block text-sm text-slate-600">⭐ ${project.stars}</span>` : ''}
                  ${project.forks ? `<span class="inline-block text-sm text-slate-600">🍴 ${project.forks}</span>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        ${data.education && Array.isArray(data.education) && data.education.length > 0 ? `
        <section class="bg-white rounded-xl p-10 shadow-sm">
          <h2 class="text-2xl font-semibold mb-6">Education</h2>
          <div class="grid grid-cols-1 gap-6">
            ${data.education.filter(edu => edu && (edu.institution || edu.degree)).map(edu => `
              <div class="rounded-lg border border-slate-200 p-6">
                <h3 class="text-lg font-semibold">${edu.degree || 'Degree'}</h3>
                <p class="text-slate-600">${edu.institution || 'Institution'}</p>
                <p class="text-sm text-slate-500">${edu.years || 'Duration'}</p>
                ${edu.cgpa ? `<p class="text-sm text-slate-500">CGPA: ${edu.cgpa}</p>` : ''}
              </div>
            `).join('')}
          </div>
        </section>
        ` : ''}
      </div>
    </main>

    <footer class="py-10">
      <div class="max-w-6xl mx-auto px-5 text-center text-slate-500">
        <p>&copy; 2024 ${name}. All rights reserved.</p>
        <p class="mt-1">Built with ❤️ using AI Portfolio Generator</p>
      </div>
    </footer>
  </div>
  <script src="assets/main.js"></script>
</body>
</html>`;
    } catch (error) {
      console.error('Error generating Tailwind HTML:', error);
      throw new Error(`HTML generation failed: ${error.message}`);
    }
  };

  

  const generateJS = (data) => {
    return `// Portfolio JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio loaded successfully!');
    console.log('Portfolio data:', ${JSON.stringify(data, null, 2)});

    // Add smooth scrolling for any anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all sections for animation
    document.querySelectorAll('.section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });

    // Add loading animation for images
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        img.style.opacity = '0.7';
        img.style.transition = 'opacity 0.3s ease';
    });

    // Add click tracking for project links
    document.querySelectorAll('.project-link').forEach(link => {
        link.addEventListener('click', function() {
            console.log('Project link clicked:', this.href);
        });
    });

    // Add contact info click tracking
    document.querySelectorAll('.contact-item a').forEach(link => {
        link.addEventListener('click', function() {
            console.log('Contact link clicked:', this.href);
        });
    });
});`;
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      
      // Show loading toast
      toast.loading('Generating portfolio files...', { id: 'download' });

      console.log('Starting portfolio generation with data:', portfolioData);

      const zip = new JSZip();
      const files = generatePortfolioFiles();

      console.log('Generated files:', Object.keys(files));

      // Add files to zip
      for (const [filename, content] of Object.entries(files)) {
        zip.file(filename, content);
      }

      // Generate zip file
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Download the zip file
      const userData = parsePortfolioData(portfolioData);
      const userName = userData.contact_information?.name || userData.name || 'portfolio';
      const fileName = `${userName.replace(/[^a-zA-Z0-9]/g, '_')}_portfolio.zip`;
      
      console.log('Downloading file:', fileName);
      saveAs(content, fileName);
      
      // Show success toast
      toast.success('Portfolio downloaded successfully!', { id: 'download' });
      
      // Show deployment instructions
      setShowInstructions(true);
      
    } catch (error) {
      console.error('Error generating portfolio:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      toast.error(`Failed to generate portfolio: ${errorMessage}`, { id: 'download' });
    } finally {
      setIsDownloading(false);
    }
  };

  const copyToClipboard = (text, stepNumber) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedStep(stepNumber);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedStep(null), 2000);
    });
  };

  return (
    <div className={`portfolio-downloader ${className}`}>
      {/* Download Button */}
      <motion.button
        onClick={handleDownloadZip}
        disabled={isDownloading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-3 text-lg font-semibold"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isDownloading ? (
          <>
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
            <span>Generating Portfolio...</span>
          </>
        ) : (
          <>
            <Download className="w-6 h-6" />
            <span>Download Portfolio (.zip)</span>
          </>
        )}
      </motion.button>

      {/* Netlify Deployment Instructions */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8 p-6 border border-gray-200 rounded-xl bg-gradient-to-r from-green-50 to-blue-50"
          >
            <div className="flex items-center mb-4">
              <Globe className="w-6 h-6 text-green-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">🚀 Next Step: Deploy on Netlify</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <ol className="list-decimal pl-5 space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2">1.</span>
                    <span>Unzip <strong className="text-blue-600">portfolio.zip</strong> on your computer.</span>
                  </li>
                  
                  <li className="flex items-start">
                    <span className="mr-2">2.</span>
                    <span>Go to <a href="https://app.netlify.com/drop" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800 flex items-center">
                      Netlify Drop <ExternalLink className="w-4 h-4 ml-1" />
                    </a> (fastest method) or <a href="https://app.netlify.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">Netlify Dashboard</a>.</span>
                  </li>
                  
                  <li className="flex items-start">
                    <span className="mr-2">3.</span>
                    <span>Drag and drop the unzipped folder (should contain <code className="bg-gray-100 px-2 py-1 rounded text-sm">index.html</code>, <code className="bg-gray-100 px-2 py-1 rounded text-sm">assets/</code>, etc.) into the upload box.</span>
                  </li>
                  
                  <li className="flex items-start">
                    <span className="mr-2">4.</span>
                    <span>Wait a few seconds → Netlify gives you a live link like <code className="bg-gray-100 px-2 py-1 rounded text-sm">https://your-site.netlify.app</code>.</span>
                  </li>
                  
                  <li className="flex items-start">
                    <span className="mr-2">5.</span>
                    <span>Share this link in your Resume, LinkedIn, or GitHub profile!</span>
                  </li>
                </ol>
              </div>

              {/* Pro Tips */}
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">💡 Pro Tips:</h3>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• The <code className="bg-yellow-100 px-1 py-0.5 rounded text-xs">_redirects</code> file is included for React Router support</li>
                  <li>• All your data is embedded in the files - no external dependencies</li>
                  <li>• Custom domain: Site Settings → Domain → rename or connect your domain</li>
                  <li>• Check the <code className="bg-yellow-100 px-1 py-0.5 rounded text-xs">README.txt</code> file for detailed instructions</li>
                </ul>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => copyToClipboard('https://app.netlify.com/drop', 1)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Netlify Drop URL</span>
                  {copiedStep === 1 && <CheckCircle className="w-4 h-4 text-green-400" />}
                </button>
                
                <button
                  onClick={() => copyToClipboard('/* /index.html 200', 2)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Redirects Rule</span>
                  {copiedStep === 2 && <CheckCircle className="w-4 h-4 text-green-400" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PortfolioDownloader;