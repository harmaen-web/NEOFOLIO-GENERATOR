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
      
      // Generate the portfolio HTML with real user data
      const htmlContent = generateHTML(userData, templateName);
      const cssContent = generateCSS();
      const jsContent = generateJS(userData);
      const userDataJson = JSON.stringify(userData, null, 2);
      
      return {
        'index.html': htmlContent,
        'assets/style.css': cssContent,
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

  const generateCSS = () => {
    return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f8fafc;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Header Styles */
.portfolio-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 60px 0;
}

.header-content {
    display: flex;
    align-items: center;
    gap: 40px;
    flex-wrap: wrap;
}

.profile-section {
    display: flex;
    align-items: center;
    gap: 20px;
}

.profile-image {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid rgba(255, 255, 255, 0.2);
}

.profile-info h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 8px;
}

.profile-info .title {
    font-size: 1.2rem;
    opacity: 0.9;
    margin-bottom: 4px;
}

.profile-info .email {
    font-size: 1rem;
    opacity: 0.8;
}

.contact-info {
    margin-left: auto;
}

.contact-item {
    margin-bottom: 8px;
    font-size: 1rem;
}

.contact-item a {
    color: white;
    text-decoration: none;
}

.contact-item a:hover {
    text-decoration: underline;
}

/* Main Content */
.portfolio-main {
    padding: 60px 0;
}

.section {
    background: white;
    margin-bottom: 40px;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.section h2 {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 24px;
    color: #2d3748;
    border-bottom: 3px solid #667eea;
    padding-bottom: 12px;
}

/* Skills */
.skills-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.skill-tag {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
}

/* Experience */
.experience-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.experience-item {
    padding: 24px;
    background: #f8fafc;
    border-radius: 8px;
    border-left: 4px solid #667eea;
}

.experience-item h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 8px;
}

.experience-item .company {
    font-weight: 500;
    color: #667eea;
    margin-bottom: 4px;
}

.experience-item .duration {
    color: #718096;
    font-size: 0.9rem;
    margin-bottom: 8px;
}

.experience-item .description {
    color: #4a5568;
    font-size: 0.95rem;
    line-height: 1.5;
}

/* Projects */
.projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
}

.project-card {
    background: #f8fafc;
    padding: 24px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    transition: transform 0.2s, box-shadow 0.2s;
}

.project-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.project-card h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 12px;
}

.project-card p {
    color: #4a5568;
    margin-bottom: 16px;
}

.project-tech {
    background: #667eea;
    color: white;
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 0.8rem;
    font-weight: 500;
    display: inline-block;
    margin-bottom: 12px;
}

.project-link {
    display: inline-block;
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
    border-bottom: 1px solid #667eea;
    transition: color 0.2s;
}

.project-link:hover {
    color: #5a67d8;
}

.project-stats {
    display: inline-block;
    margin-left: 8px;
    font-size: 0.8rem;
    color: #718096;
}

.responsibilities {
    margin-top: 8px;
    padding-left: 16px;
}

.responsibilities li {
    margin-bottom: 4px;
    color: #4a5568;
}

.location {
    color: #718096;
    font-size: 0.9rem;
    margin-bottom: 8px;
}

.cgpa {
    color: #48bb78;
    font-weight: 500;
    font-size: 0.9rem;
}

/* Education */
.education-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.education-item {
    padding: 20px;
    background: #f8fafc;
    border-radius: 8px;
    border-left: 4px solid #48bb78;
}

.education-item h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 8px;
}

.education-item .institution {
    font-weight: 500;
    color: #48bb78;
    margin-bottom: 4px;
}

.education-item .duration {
    color: #718096;
    font-size: 0.9rem;
}

/* Footer */
.portfolio-footer {
    background: #2d3748;
    color: white;
    text-align: center;
    padding: 40px 0;
}

.footer-note {
    margin-top: 8px;
    font-size: 0.9rem;
    opacity: 0.8;
}

/* Responsive */
@media (max-width: 768px) {
    .header-content {
        flex-direction: column;
        text-align: center;
    }
    
    .contact-info {
        margin-left: 0;
    }
    
    .profile-info h1 {
        font-size: 2rem;
    }
    
    .section {
        padding: 24px;
    }
    
    .projects-grid {
        grid-template-columns: 1fr;
    }
    
    .profile-image {
        width: 100px;
        height: 100px;
    }
}`;
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