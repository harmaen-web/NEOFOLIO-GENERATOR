import React, { useState } from 'react';

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
      const profileRaw = await profileRes.json();

      // 2️⃣ Fetch repos
      const reposRes = await fetch(`https://api.github.com/users/${username}/repos`);
      const reposRaw = await reposRes.json();

      // 3️⃣ Extract only useful fields (with null fallback)
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
        ? reposRaw.map(repo => ({
            title: repo.name ?? null,
            description: repo.description ?? null,
            techStack: repo.language ?? null,
            stars: repo.stargazers_count ?? 0,
            forks: repo.forks_count ?? 0,
            repoLink: repo.html_url ?? null,
          }))
        : [];

      // 4️⃣ Unified object
      const structuredData = {
        personal: profileData,
        projects,
      };

      console.log("✅ Unified Portfolio Object:", structuredData);
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
              <h2 className="text-2xl font-bold">{portfolio.personal.name ?? "N/A"}</h2>
              <p className="text-gray-600">{portfolio.personal.bio ?? "No bio"}</p>
              <p className="text-sm text-gray-500">{portfolio.personal.location ?? "Unknown"}</p>
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
              <p className="mt-2 text-sm text-gray-500">
                Followers: {portfolio.personal.followers} | Following: {portfolio.personal.following} | Public Repos: {portfolio.personal.publicRepos}
              </p>
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
                      {proj.title ?? "Untitled"}
                    </a>
                  </h4>
                  <p className="text-gray-600">
                    {proj.description ?? "No description"}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">Tech:</span>{" "}
                    {proj.techStack ?? "N/A"} | ⭐ {proj.stars} | 🍴 {proj.forks}
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

export default App;
