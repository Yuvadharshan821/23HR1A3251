import { useEffect, useState } from "react";
import axios from "axios";

export default function PriorityNotifications() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch computed Top 10 from backend stage6 endpoint
      const res = await axios.get("http://localhost:3000/top10");
      setData(Array.isArray(res.data?.top10) ? res.data.top10 : []);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Failed to load top10");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Priority Notifications (Top 10)</h2>

      {loading && <p>Loading...</p>}
      {!loading && error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && data.length === 0 && <p>No notifications found</p>}

      {data.map((n) => (
        <div key={n.ID} style={{ margin: 10, padding: 10, border: "2px solid black" }}>
          <b>{n.Type}</b>
          <p>{n.Message}</p>
          <small>{n.Timestamp}</small>
        </div>
      ))}
    </div>
  );
}
