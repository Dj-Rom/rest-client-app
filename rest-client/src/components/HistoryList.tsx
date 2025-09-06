import { useEffect, useState } from "react";
import { fetchRequestHistory, type RequestMetadata } from "../lib/api";

import { getCurrentUser } from "../lib/auth";

export default function HistoryList() {
  const [history, setHistory] = useState<RequestMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) throw new Error("You must be signed in to view history.");

        const data = await fetchRequestHistory(user.id);
        const sorted = data.sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
        );
        setHistory(sorted);
      } catch (err: any) {
        setError(err.message || "Failed to load history.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const handleReplay = (entry: RequestMetadata) => {
    window.open(`http://${entry.url}`, "_blank", "opener,referrer");
  };

  if (loading) return <p className="text-gray-500">Loading history...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (history.length === 0)
    return <p className="text-gray-500">No history found.</p>;

  return (
    <div className="space-y-4">
      {history.map((entry, index) => (
        <div
          key={index}
          className="history-entry"
          onClick={() => handleReplay(entry)}
        >
          <div className="history-header">
            <span className="history-method">{entry.method}</span>
            <span className="history-timestamp">
              {entry.timestamp.toLocaleString()}
            </span>
          </div>
          <div className="history-url">{entry.url}</div>
          <div className="history-meta">
            Status: <span className="status">{entry.status}</span> | Duration:{" "}
            {entry.duration}ms
            {entry.error && (
              <span className="error"> | Error: {entry.error}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
