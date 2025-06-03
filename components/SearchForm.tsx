"use client";
import { useState, useEffect } from "react";

export default function SearchForm() {
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [accountInfo, setAccountInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inputValue, setInputValue] = useState<string>("");

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

  useEffect(() => {
    const fetchAccount = async () => {
      if (gameName.trim() === "" || tagLine.trim() === "") {
        return; // Wait until both fields are filled
      }

      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `${BASE_URL}/api/account?gameName=${gameName}&tagLine=${tagLine}`
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

  const handleRiotNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    console.log("Input value changed:", value);
    setInputValue(value);

    const hashIndex = value.indexOf("#");

    if (hashIndex === -1) {
      // No hashtag present
      console.log("No hashtag present, setting gameName:", value.trim());
      setGameName(value.trim());
      setTagLine("");
    } else if (value.split("#").length - 1 > 1) {
      // more than one #
      console.error("Only one # allowed");
    } else {
      const [name, tag] = value.split("#");
      console.log("Parsed gameName:", name.trim(), "tagLine:", tag.trim());
      setGameName(name.trim());
      setTagLine(tag.trim());
    }
  };

  return (
    <div className="space-y-4">
      <input
        placeholder="Enter Summoner Name (e.g. PlayerName#1234)"
        className="border p-2 w-full"
        value={inputValue}
        onChange={(e) => handleRiotNameChange(e)}
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
