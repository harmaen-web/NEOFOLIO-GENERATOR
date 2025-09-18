import React from 'react'
import {useState} from 'react';
function App() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [portfolio, setPortfolio] = useState(null);

  const fetchGitHubData = async () => {
    if (!username) return alert("Enter a GitHub username!");
    setLoading(true);

    try {
      // 1️⃣ Fetch profile
      const profileRes = await fetch(`https://api.github.com/users/${username}`);
      const profile = await profileRes.json();

      // 2️⃣ Fetch repos
      const reposRes = await fetch(`https://api.github.com/users/${username}/repos`);
      const repos = await reposRes.json();
      console.log(repos)
      // 3️⃣ Extract useful info
      const profileData = {
        name: profile.name,
        profilePic: profile.avatar_url,
        bio: profile.bio,
        location: profile.location,
        githubUrl: profile.html_url,
        website: profile.blog
      };

      const projects = repos
        .map(repo => ({
          title: repo.name,
          description: repo.description,
          techStack: repo.language,
          stars: repo.stargazers_count,
          repoLink: repo.html_url
        }));

      const structuredData = {
        personal: profileData,
        projects: projects
      };

      console.log("✅ Structured Portfolio Data:", structuredData);
      setPortfolio(structuredData);
    } catch (error) {
      console.error("❌ Error fetching GitHub data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Input + Button */}
      <div className="mb-6 flex">
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Enter GitHub username"
          className="flex-1 border px-3 py-2 rounded"
        />
        <button
          onClick={fetchGitHubData}
          className="ml-2 px-4 py-2 bg-blue-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Loading..." : "Fetch Data"}
        </button>
      </div>

      {/* Portfolio Display */}
      {portfolio && (
        <div className="space-y-6">
          {/* Personal Info */}
          <div className="flex items-center gap-4">
            <img
              src={portfolio.personal.profilePic}
              alt="Profile"
              className="w-20 h-20 rounded-full border"
            />
            <div>
              <h2 className="text-2xl font-bold">{portfolio.personal.name}</h2>
              <p className="text-gray-600">{portfolio.personal.bio}</p>
              <p className="text-sm text-gray-500">{portfolio.personal.location}</p>
              <div className="flex gap-4 mt-2">
                <a
                  href={portfolio.personal.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  GitHub
                </a>
                {portfolio.personal.website && (
                  <a
                    href={portfolio.personal.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Projects */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Projects</h3>
            <ul className="space-y-3">
              {portfolio.projects.map((proj, idx) => (
                <li
                  key={idx}
                  className="border p-4 rounded-lg hover:shadow-md transition"
                >
                  <h4 className="text-lg font-bold">
                    <a
                      href={proj.repoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:underline"
                    >
                      {proj.title}
                    </a>
                  </h4>
                  <p className="text-gray-600">{proj.description}</p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">Tech:</span> {proj.techStack || "N/A"} | ⭐ {proj.stars}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App