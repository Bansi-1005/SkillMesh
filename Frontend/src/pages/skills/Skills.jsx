import { useEffect, useState } from "react";

function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/Skill`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch skills.");
        }

        return response.json();
      })
      .then((data) => {
        setSkills(data);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="p-6">Loading skills...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-600">Error: {error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="mb-2 text-3xl font-bold text-gray-800">
        Skill Management
      </h1>

      <p className="mb-6 text-gray-600">View all skills in SkillMesh.</p>

      {skills.length === 0 ? (
        <p>No skills found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="w-full text-left">
            <thead className="bg-indigo-600 text-white">
              <tr>
                {Object.keys(skills[0]).map((key) => (
                  <th key={key} className="px-4 py-3">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {skills.map((skill, index) => (
                <tr
                  key={skill.skillId ?? skill.SkillId ?? index}
                  className="border-b hover:bg-gray-50"
                >
                  {Object.keys(skills[0]).map((key) => (
                    <td key={key} className="px-4 py-3">
                      {skill[key] == null
                        ? "-"
                        : typeof skill[key] === "object"
                          ? JSON.stringify(skill[key])
                          : String(skill[key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-sm text-gray-600">
        Total skills: {skills.length}
      </p>
    </div>
  );
}

export default Skills;
