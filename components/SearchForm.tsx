"use client";
import { useState, useEffect } from "react";

export default function SearchForm() {
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [accountInfo, setAccountInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAccount = async () => {
      if (gameName.trim() === "" || tagLine.trim() === "") {
        return; // Wait until both fields are filled
      }

      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/account?gameName=${gameName}&tagLine=${tagLine}`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch account");
        }

        setAccountInfo(data);
      } catch (err: any) {
        setError(err.message);
        setAccountInfo(null);
      } finally {
        setLoading(false);
      }
    };

    // Delay search to avoid triggering on every keystroke instantly
    const delay = setTimeout(fetchAccount, 500); // 500ms debounce

    return () => clearTimeout(delay); // Cleanup on re-type
  }, [gameName, tagLine]);

  return (
    <div className="space-y-4">
      <input
        placeholder="Game Name"
        value={gameName}
        onChange={(e) => setGameName(e.target.value)}
        className="border p-2 w-full"
      />
      <input
        placeholder="Tag Line"
        value={tagLine}
        onChange={(e) => setTagLine(e.target.value)}
        className="border p-2 w-full"
      />

      {loading && <p className="text-blue-500">Searching...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {accountInfo && (
        <pre className="bg-gray-100 p-4 mt-4 text-sm">
          {JSON.stringify(accountInfo, null, 2)}
        </pre>
      )}
    </div>
  );
}
