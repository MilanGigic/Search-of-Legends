"use client";
import getFrontendRegion from "@/actions/match-history/getFrontendRegion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function SearchForm({
  placeholder,
  version,
}: {
  placeholder: string;
  version: string;
}) {
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [accountInfo, setAccountInfo] = useState<DbSummonerInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inputValue, setInputValue] = useState<string>("");
  const [region, setRegion] = useState<string>("");

  // const BASE_URL = process.env.NEXT_PUBLIC_VERCEL_URL!;

  useEffect(() => {
    const fetchAccount = async () => {
      console.log("[fetchAccount] Called with", { gameName, tagLine });

      if (gameName.trim() === "" || tagLine.trim() === "") {
        console.log("[fetchAccount] Missing gameName or tagLine, aborting");
        return;
      }

      setLoading(true);
      setError("");

      const fetchData = async (): Promise<DbSummonerInfo | null> => {
        console.log(
          "[fetchData] Fetching account info for:",
          gameName,
          tagLine,
        );

        const res = await fetch(
          `/api/account?gameName=${gameName}&tagLine=${tagLine}`,
        );
        console.log("[fetchData] First fetch result:", res);

        if (!res.ok) {
          // Retry once after a delay if first request fails
          if (res.status === 404 || res.status === 500) {
            console.log(
              "[fetchData] First fetch failed with status",
              res.status,
              "retrying in 1s...",
            );
            await new Promise((r) => setTimeout(r, 1000));
            const retryRes = await fetch(
              `/api/account?gameName=${gameName}&tagLine=${tagLine}`,
            );
            console.log("[fetchData] Retry fetch result:", retryRes);
            if (!retryRes.ok) throw new Error(retryRes.statusText);
            const retryJson = await retryRes.json();
            console.log("[fetchData] Retry fetch JSON:", retryJson);
            return retryJson;
          }

          console.error(
            "[fetchData] Fetch failed with status:",
            res.status,
            res.statusText,
          );
          throw new Error(res.statusText);
        }

        const jsonData = await res.json();
        console.log("[fetchData] Fetch successful, JSON:", jsonData);
        setLoading(false);
        return jsonData;
      };

      try {
        const data = await fetchData();
        if (!data) {
          console.error("[fetchAccount] fetchData returned empty object");
          throw new Error("Empty data");
        }

        console.log("[fetchAccount] Received data:", data);
        setAccountInfo(data);
        const displayRegion = getFrontendRegion(data.region);
        console.log("[fetchAccount] Setting region to", displayRegion);
        setLoading(false);

        setRegion(displayRegion);
      } catch (err) {
        console.error("[fetchAccount] Error:", err);
        setError(`Sorry, we couldn't find what you're looking for: ${err}`);
        setAccountInfo(null);
      } finally {
        console.log("[fetchAccount] Fetch finished, setting loading to false");
        setLoading(false);
      }
    };

    // Delay search to avoid triggering on every keystroke instantly
    const delay = setTimeout(fetchAccount, 500); // 500ms debounce

    return () => clearTimeout(delay); // Cleanup on re-type
  }, [gameName, tagLine]);

  const handleRiotNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

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
    <div className="w-full flex flex-col justify-center items-center">
      <input
        placeholder={placeholder}
        className="border-b border-slate-400/50 text-gray-200 focus:outline-none p-2 w-[200px] md:w-md text-center"
        value={inputValue}
        onChange={(e) => handleRiotNameChange(e)}
      />

      {error && (
        <div className="px-4 py-1 animate-pulse animate-duration-[3s] text-slate-300 text-start flex items-center bg-[#2A2A40] rounded-b-lg shadow border-x border-b border-gray-200 w-full h-[85px]">
          {error}
        </div>
      )}
      <div className="min-h-[90px] w-full flex justify-center items-center transition-all duration-300">
        {loading && (
          <div className="flex gap-4 items-center p-4 rounded-lg bg-[#2A2A40] w-[200px] md:w-md h-[85px]">
            <div className="w-14 h-14 rounded-full skeleton" />
            <div className="flex flex-col gap-2">
              <div className="w-40 h-4 skeleton" />
              <div className="w-24 h-3 skeleton" />
            </div>
            <div className="ml-auto w-16 h-6 skeleton rounded" />
          </div>
        )}

        {!loading && accountInfo && (
          <div className="px-4 bg-gradient-to-b from-[#121624] to-[#1B1F35] rounded-b-lg shadow border-x border-b border-slate-400/50 w-[200px] md:w-md">
            <Link
              href={`/${encodeURIComponent(
                accountInfo.gameName,
              )}-${encodeURIComponent(accountInfo.tagLine)}`}
              className="flex items-center justify-between p-2 text-center gap-2 hover:opacity-85 cursor-pointer"
            >
              <div className="flex items-center">
                <Image
                  src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${accountInfo.profileIconId}.png`}
                  alt={``}
                  width={60}
                  height={60}
                  className="rounded-full border-2 border-[#5C87F8] animate-pulse animate-duration-5000 mr-4"
                />
                <h1 className="text-[#EAEAEA] text-lg md:text-2xl flex flex-col">
                  {accountInfo.gameName}#{accountInfo.tagLine}
                  <span className="text-xs md:text-sm text-gray-400">
                    Level: {accountInfo.summonerLevel}
                  </span>
                </h1>
              </div>
              <h4 className="bg-[#1E2A78] text-[#EAEAEA] p-2 px-3 uppercase rounded-md font-normal md:font-semibold">
                {region}
              </h4>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

//     br1: "BR",
// la1: "LAN",
// la2: "LAS",
// na1: "NA",
// eun1: "EUNE",
// euw1: "EUW",
// tr1: "TR",
// ru: "RU",
// jp1: "JP",
// kr: "KR",
// oc1: "OCE",
// ph2: "PH",
// sg2: "SG",
// th2: "TH",
// tw2: "TW",
// vn2: "VN",
