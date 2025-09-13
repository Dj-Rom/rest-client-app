import { useEffect, useState } from "react";
import { fetchRequestHistory, type RequestMetadata } from "../lib/api";
import { getCurrentUser } from "../lib/auth";
import { t } from "i18next";
import type { HistoryListProps } from "../app/history.tsx";

export default function HistoryList({
  onSelect,
}: {
  onSelect?: HistoryListProps;
}) {
  const [history, setHistory] = useState<RequestMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) throw new Error("You must be signed in to view history.");

        const data = await fetchRequestHistory(user.id);
        setHistory(
          data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
        );
      } catch (err: any) {
        setError(err.message || "Failed to load history.");
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  if (loading) return <p className="text-gray-500">Loading history...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (history.length === 0)
    return <p className="text-gray-500">No history found.</p>;

  const handleClick = (entry: RequestMetadata) => {
    onSelect?.(entry);
  };

  return (
    <div className="space-y-4">
      {history.map((entry, index) => (
        <div
          key={index}
          className="history-entry cursor-pointer p-2 border rounded hover:bg-gray-100"
          onClick={() => handleClick(entry)}
        >
          <div>
            {t("method")}:{" "}
            <strong style={{ color: "blue" }}> {entry.method} </strong>{" "}
            {t("url")}: {entry.url}
            <span style={{ color: "green", fontSize: 20 }}>
              {" "}
              <strong style={{ color: "black" }}>{t("status")}: </strong>{" "}
              {entry.status}
            </span>
            <span style={{ color: "red" }}>{entry.error}</span>
          </div>
          <div style={{ color: "gray" }}>
            {entry.timestamp.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
