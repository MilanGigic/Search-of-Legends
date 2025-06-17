"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function SearchForm({ placeholder }: { placeholder: string }) {
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [accountInfo, setAccountInfo] = useState<DbSummonerInfo | null>(null);
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

        if (!res.ok) {
          throw new Error(res.statusText || "Failed to fetch account");
        }
        const data: DbSummonerInfo = await res.json();

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

  useEffect(() => {
    console.log("Account info:", accountInfo);
  }, [accountInfo]);

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
    <div className="space-y-4 w-full flex flex-col justify-center items-center">
      <input
        placeholder={placeholder}
        className="border-b border-gray-400 text-gray-200 focus:outline-none p-2 w-full text-center"
        value={inputValue}
        onChange={(e) => handleRiotNameChange(e)}
      />

      {error && <p className="text-red-500">{error}</p>}
      <div className="min-h-[90px] w-full flex justify-center items-center transition-all duration-300">
        {loading && (
          <div className="flex gap-4 items-center p-4 rounded-lg bg-[#2A2A40] w-fit">
            <div className="w-14 h-14 rounded-full skeleton" />
            <div className="flex flex-col gap-2">
              <div className="w-40 h-4 skeleton" />
              <div className="w-24 h-3 skeleton" />
            </div>
            <div className="ml-auto w-16 h-6 skeleton rounded" />
          </div>
        )}

        {!loading && accountInfo && (
          <div className="px-4 py-1 bg-[#2A2A40] rounded-b-lg shadow border-x border-b border-gray-200 w-fit">
            <Link
              href={`/${accountInfo.gameName}-${accountInfo.tagLine}`}
              className="flex items-center justify-between p-2 text-center gap-2 hover:opacity-85 cursor-pointer"
            >
              <div className="flex items-center">
                <Image
                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/profileicon/${accountInfo.profileIconId}.png`}
                  alt={``}
                  width={60}
                  height={60}
                  className="rounded-full border-2 border-[#5C87F8] animate-pulse animate-duration-5000 mr-4"
                />
                <h1 className="text-[#EAEAEA] text-2xl flex flex-col">
                  {accountInfo.gameName}#{accountInfo.tagLine}
                  <span className="text-sm text-gray-400">
                    Level: {accountInfo.summonerLevel}
                  </span>
                </h1>
              </div>
              <h4 className="bg-[#1E2A78] text-[#EAEAEA] p-2 px-3 uppercase rounded-md font-semibold">
                {accountInfo.region}
              </h4>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
