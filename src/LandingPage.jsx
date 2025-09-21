import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, SkipForward, Upload, Github, FileJson, Eye } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleGetStarted = () => {
    setShowOnboarding(true);
  };

  const handleNext = () => {
    if (currentCard < 3) {
      setCurrentCard(currentCard + 1);
    }
  };

  const handleSkip = () => {
    // Skip always takes user directly to main app
    onGetStarted();
  };

  const cards = [
    {
      icon: Upload,
      title: "Upload your LinkedIn resume as PDF",
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-3">LinkedIn Option:</h4>
            <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
              <li>Open LinkedIn and log in on a desktop browser.</li>
              <li>Go to your profile page.</li>
              <li>Click the "More" button (three dots) near your profile picture.</li>
              <li>Choose "Save to PDF" or "Download PDF".</li>
              <li>LinkedIn will download your profile as a PDF file.</li>
            </ol>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-3">Upload Option:</h4>
            <ul className="list-disc list-inside space-y-2 text-green-800 text-sm">
              <li>Drag & drop the downloaded PDF (or any resume PDF/image) into the upload box.</li>
              <li>Click <strong>Extract Resume</strong> to let AI read and summarize your experience automatically.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      icon: Github,
      title: "Connect Your GitHub",
      content: (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <ul className="list-disc list-inside space-y-2 text-gray-800 text-sm">
              <li>Enter your GitHub username (optionally a token to avoid rate limits).</li>
              <li>Click <strong>Fetch GitHub Data</strong> to import your public profile and repositories.</li>
            </ul>
          </div>
          <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
            💡 <strong>Pro tip:</strong> Adding a GitHub token helps avoid rate limits and gives access to more repository details.
          </div>
        </div>
      )
    },
    {
      icon: FileJson,
      title: "Generate Your Portfolio JSON",
      content: (
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <ul className="list-disc list-inside space-y-2 text-purple-800 text-sm">
              <li>Click <strong>Get JSON</strong> to consolidate your resume + GitHub data.</li>
              <li>AI will produce a structured JSON of your skills, projects, and experience.</li>
            </ul>
          </div>
          <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
            🤖 Our AI analyzes your data and creates a comprehensive portfolio structure automatically.
          </div>
        </div>
      )
    },
    {
      icon: Eye,
      title: "Preview & Share Your Portfolio",
      content: (
        <div className="space-y-4">
          <div className="bg-emerald-50 p-4 rounded-lg">
            <ul className="list-disc list-inside space-y-2 text-emerald-800 text-sm">
              <li>Choose a template from the dropdown (Template 1, 2, or 3).</li>
              <li>Click <strong>Apply Data</strong> to see your information in the template.</li>
              <li>Use <strong>Open Full Page</strong> to open a standalone, shareable portfolio page.</li>
            </ul>
          </div>
          <div className="text-xs text-gray-500 bg-pink-50 p-3 rounded border-l-4 border-pink-400">
            🎨 Multiple beautiful templates available to showcase your work in the best light.
          </div>
        </div>
      )
    }
  ];

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          {/* Progress indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-2">
              {cards.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    index <= currentCard ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Card content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-8 mb-8"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                  {React.createElement(cards[currentCard].icon, { className: "w-6 h-6 text-white" })}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {cards[currentCard].title}
                </h2>
              </div>
              
              <div className="text-gray-700">
                {cards[currentCard].content}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <button
              onClick={() => setShowOnboarding(false)}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              ← Back to Home
            </button>
            
            <div className="flex space-x-4">
              <button
                onClick={handleSkip}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2"
              >
                <SkipForward className="w-4 h-4" />
                <span>Skip to App</span>
              </button>
              
              {currentCard < 3 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onGetStarted}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2"
                >
                  <span>Get Started</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-2000"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
              Vision Weavers
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Crafting Portfolios with AI Precision ✨
            </p>
            <p className="text-lg text-gray-400 mb-12 max-w-3xl mx-auto">
              Transform your resume and GitHub profile into stunning, professional portfolios in minutes. 
              Let AI do the heavy lifting while you focus on what matters most.
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xl font-semibold px-12 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3 mx-auto"
          >
            <span>Get Started</span>
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </div>
      </div>

      {/* Features preview */}
      <div className="relative z-10 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Smart Upload</h3>
              <p className="text-gray-300 text-sm">AI-powered resume extraction from PDFs and images</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <Github className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">GitHub Integration</h3>
              <p className="text-gray-300 text-sm">Seamlessly connect and showcase your projects</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <Eye className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Beautiful Templates</h3>
              <p className="text-gray-300 text-sm">Multiple professional designs to choose from</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

