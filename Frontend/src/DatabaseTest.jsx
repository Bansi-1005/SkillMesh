import { useEffect, useState } from "react";

function DatabaseTest() {
  const [message, setMessage] = useState("Testing database connection...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/DatabaseTest`)
      .then(async (response) => {
        const data = await response.text();

        if (!response.ok) {
          throw new Error(data || `HTTP error: ${response.status}`);
        }

        return data;
      })
      .then((data) => {
        setMessage(data);
      })
      .catch((error) => {
        setMessage("Connection failed: " + error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h2>Backend and Database Connection Test</h2>
      <p>{loading ? "Please wait..." : message}</p>
    </div>
  );
}

export default DatabaseTest;
