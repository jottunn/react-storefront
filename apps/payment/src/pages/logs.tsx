import { Button } from "@saleor/macaw-ui";
import Link from "next/link";
import { useEffect, useState } from "react";

interface LogEntry {
  level: number;
  time: number;
  msg: string;
  code?: string;
  qty?: number;
}

const levelMap: { [key: number]: { label: string; color: string } } = {
  10: { label: "TRACE", color: "#e0e0e0" },
  20: { label: "DEBUG", color: "#d1e7dd" },
  30: { label: "INFO", color: "#cff4fc" },
  40: { label: "WARN", color: "#fff3cd" },
  50: { label: "ERROR", color: "#f8d7da" },
  60: { label: "FATAL", color: "#f5c6cb" },
};

const formatLogEntry = (entry: LogEntry) => {
  const date = new Date(entry.time).toLocaleString("ro-RO", { timeZone: "Europe/Bucharest" });
  const level = levelMap[entry.level]?.label || entry.level;
  let extraFields = "";
  if (entry.code) extraFields += ` code: ${entry.code}`;
  if (entry.qty) extraFields += ` qty: ${entry.qty}`;

  return {
    formatted: `[${date}] [${level}]: ${entry.msg}${extraFields}`,
    color: levelMap[entry.level]?.color || "#ffffff",
  };
};

const LogsPage = () => {
  const [logs, setLogs] = useState<{ formatted: string; color: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch("/api/logs");
        const data = await response.json();

        if (response.ok) {
          const formattedLogs = data.logs
            .filter((log: string) => log.trim() !== "") // Filter out empty lines
            .map((log: string) => {
              try {
                const entry: LogEntry = JSON.parse(log);
                return formatLogEntry(entry);
              } catch (e) {
                return { formatted: log, color: "#ffffff" }; // If parsing fails, return the raw log
              }
            });
          setLogs(formattedLogs);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError("Failed to fetch logs");
      }
    };

    fetchLogs();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <Link href="/">
        <Button variant="secondary">Back</Button>
      </Link>
      <hr />
      <h1>🔹 ING Payments Log</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div
        style={{ background: "#f4f4f4", padding: "10px", margin: "10px 0", borderRadius: "5px" }}
      >
        {logs.map((log, index) => (
          <div
            key={index}
            style={{
              backgroundColor: log.color,
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "5px",
            }}
          >
            {log.formatted}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogsPage;
