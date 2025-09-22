// Test script to verify the key functions are working
// This can be run in the browser console to test the validation and normalization functions

// Test data that matches the expected schema
const testData = {
  contact_information: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1-555-123-4567",
    linkedin_url: "https://linkedin.com/in/johndoe",
    github_url: "https://github.com/johndoe"
  },
  summary: "Experienced software developer with expertise in React and Node.js",
  education: [
    {
      institution: "University of Technology",
      degree: "Bachelor of Computer Science",
      years: "2018-2022",
      cgpa: "3.8"
    }
  ],
  experience: [
    {
      company: "Tech Corp",
      role: "Senior Developer",
      start_date: "2022-01",
      end_date: "2024-01",
      duration: "2 years",
      location: "San Francisco, CA",
      responsibilities: ["Led development team", "Architected scalable systems"]
    }
  ],
  projects: [
    {
      title: "Portfolio Website",
      description: "A modern portfolio built with React",
      technologies: ["React", "Tailwind CSS", "Node.js"],
      live_demo: "https://johndoe.dev",
      github_link: "https://github.com/johndoe/portfolio"
    }
  ],
  github_projects: [
    {
      title: "E-commerce App",
      description: "Full-stack e-commerce application",
      tech_stack: "React, Node.js, MongoDB",
      stars: 25,
      forks: 8,
      repo_link: "https://github.com/johndoe/ecommerce"
    }
  ],
  technical_skills: {
    languages: ["JavaScript", "Python", "TypeScript"],
    frameworks_libraries: ["React", "Node.js", "Express"],
    databases: ["MongoDB", "PostgreSQL"],
    authentication_apis: ["JWT", "OAuth"],
    dev_tools: ["Git", "Docker", "AWS"],
    ai_cv_tools: ["OpenAI API", "TensorFlow"]
  },
  certificates: [
    {
      title: "AWS Certified Developer",
      date: "2023-06",
      description: "Certified in AWS cloud development"
    }
  ],
  achievements: [
    "Led team of 5 developers",
    "Reduced application load time by 40%",
    "Mentored 3 junior developers"
  ],
  github_profile_overview: {
    username: "johndoe",
    profile_pic: "https://github.com/johndoe.png",
    followers: 150,
    following: 200,
    public_repos: 25,
    github_url: "https://github.com/johndoe"
  }
};

// Test validation function
function testValidation() {
  console.log("Testing validation function...");
  
  // Test with valid data
  const validResult = validatePortfolioSchema(testData);
  console.log("Valid data test:", validResult);
  
  // Test with invalid data (missing required fields)
  const invalidData = { ...testData };
  delete invalidData.contact_information;
  const invalidResult = validatePortfolioSchema(invalidData);
  console.log("Invalid data test:", invalidResult);
  
  return { validResult, invalidResult };
}

// Test normalization function
function testNormalization() {
  console.log("Testing normalization function...");
  
  // Test with variant keys
  const variantData = {
    personal_info: {
      name: "Jane Smith",
      email: "jane@example.com"
    },
    personal: {
      username: "janesmith",
      profilePic: "https://github.com/janesmith.png"
    },
    skills: {
      languages: ["JavaScript", "Python"],
      frameworks: ["React", "Vue"]
    },
    work_experience: [
      {
        title: "Developer",
        organization: "Startup Inc",
        period: "2020-2022"
      }
    ]
  };
  
  const normalized = normalizePortfolio(variantData);
  console.log("Normalized data:", normalized);
  
  return normalized;
}

// Test safe parsing function
function testSafeParsing() {
  console.log("Testing safe parsing function...");
  
  // Test with valid JSON string
  const validJson = JSON.stringify(testData);
  const parsed1 = safeParsePortfolio(validJson);
  console.log("Valid JSON parsing:", parsed1 ? "Success" : "Failed");
  
  // Test with markdown-wrapped JSON
  const markdownJson = "```json\n" + validJson + "\n```";
  const parsed2 = safeParsePortfolio(markdownJson);
  console.log("Markdown JSON parsing:", parsed2 ? "Success" : "Failed");
  
  // Test with invalid JSON
  const invalidJson = "{ invalid json }";
  const parsed3 = safeParsePortfolio(invalidJson);
  console.log("Invalid JSON parsing:", parsed3 ? "Success" : "Failed");
  
  return { parsed1, parsed2, parsed3 };
}

// Run all tests
function runAllTests() {
  console.log("=== Portfolio Generator Function Tests ===");
  
  try {
    const validationTests = testValidation();
    const normalizationTests = testNormalization();
    const parsingTests = testSafeParsing();
    
    console.log("\n=== Test Results Summary ===");
    console.log("✅ Validation function working:", validationTests.validResult.isValid);
    console.log("✅ Normalization function working:", !!normalizationTests);
    console.log("✅ Safe parsing function working:", !!parsingTests.parsed1);
    
    return {
      validation: validationTests,
      normalization: normalizationTests,
      parsing: parsingTests
    };
  } catch (error) {
    console.error("❌ Test failed:", error);
    return { error: error.message };
  }
}

// Export for use in browser console
window.testPortfolioFunctions = runAllTests;
window.testData = testData;

console.log("Test functions loaded. Run 'testPortfolioFunctions()' in the browser console to test all functions.");

