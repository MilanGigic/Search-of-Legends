"use client";
import getFrontendRegion from "@/actions/match-history/getFrontendRegion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

interface ChampionSearchResult {
  name: string;
  image: string;
}

export default function SearchForm({
  placeholder,
  version,
}: {
  placeholder: string;
  version: string;
}) {
  const [inputValue, setInputValue] = useState("");
  const [accountInfo, setAccountInfo] = useState<DbSummonerInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [region, setRegion] = useState("");
  const [allChampions, setAllChampions] = useState<ChampionSearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/champions", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ChampionSearchResult[]) => setAllChampions(data))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Derived directly from inputValue every render — no separate
  // gameName/tagLine state to fall out of sync with what's actually typed.
  const hashIndex = inputValue.indexOf("#");
  const isSummonerQuery = hashIndex !== -1;
  const gameName = isSummonerQuery ? inputValue.slice(0, hashIndex).trim() : "";
  const tagLine = isSummonerQuery ? inputValue.slice(hashIndex + 1).trim() : "";

  const championMatches =
    !isSummonerQuery && inputValue.trim().length > 0
      ? allChampions
          .filter((c) =>
            c.name.toLowerCase().includes(inputValue.trim().toLowerCase()),
          )
          .slice(0, 6)
      : [];

  useEffect(() => {
    if (!isSummonerQuery || gameName === "" || tagLine === "") {
      setAccountInfo(null);
      setRegion("");
      setError("");
      return;
    }

    const controller = new AbortController();
    let isCurrent = true;

    const fetchAccount = async () => {
      setLoading(true);
      setError("");

      const fetchData = async (): Promise<DbSummonerInfo | null> => {
        const res = await fetch(
          `/api/account?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`,
          { signal: controller.signal },
        );

        if (!res.ok) {
          if (res.status === 404 || res.status === 500) {
            await new Promise((r) => setTimeout(r, 1000));
            const retryRes = await fetch(
              `/api/account?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`,
              { signal: controller.signal },
            );
            if (!retryRes.ok) throw new Error(retryRes.statusText);
            return retryRes.json();
          }
          throw new Error(res.statusText);
        }
        return res.json();
      };

      try {
        const data = await fetchData();
        if (!isCurrent) return;
        if (!data) throw new Error("Empty data");

        setAccountInfo(data);
        setRegion(getFrontendRegion(data.region));
      } catch (err) {
        if (!isCurrent) return;
        if ((err as Error).name === "AbortError") return;
        setError("Sorry, we couldn't find what you're looking for.");
        setAccountInfo(null);
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchAccount, 500);

    return () => {
      isCurrent = false;
      controller.abort();
      clearTimeout(debounceTimer);
    };
  }, [isSummonerQuery, gameName, tagLine]);

  const hasResults = championMatches.length > 0 || accountInfo !== null;
  const isPanelOpen = showResults && inputValue.trim().length > 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full flex flex-col items-center"
    >
      <input
        placeholder={placeholder}
        className="border-b border-slate-400/50 text-gray-200 focus:outline-none p-2 w-[200px] md:w-md text-center"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={() => setShowResults(true)}
      />

      {isPanelOpen && (
        <div className="absolute top-full mt-2 w-[240px] md:w-md bg-gradient-to-b from-[#121624] to-[#1B1F35] rounded-lg shadow-lg border border-slate-400/50 overflow-hidden z-50">
          {loading && (
            <div className="flex gap-4 items-center p-4">
              <div className="w-14 h-14 rounded-full skeleton" />
              <div className="flex flex-col gap-2">
                <div className="w-40 h-4 skeleton" />
                <div className="w-24 h-3 skeleton" />
              </div>
              <div className="ml-auto w-16 h-6 skeleton rounded" />
            </div>
          )}

          {!loading && error && (
            <div className="px-4 py-3 text-slate-300 text-sm text-left">
              {error}
            </div>
          )}

          {!loading && !error && championMatches.length > 0 && (
            <div className="py-2">
              <p className="px-4 pb-1 text-[11px] uppercase tracking-widest text-slate-500">
                Champions
              </p>
              {championMatches.map((champion) => (
                <Link
                  key={champion.name}
                  href={`/champions/${encodeURIComponent(champion.name)}`}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors"
                  onClick={() => setShowResults(false)}
                >
                  <Image
                    src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image}`}
                    alt={champion.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <span className="text-[#EAEAEA] text-sm">
                    {champion.name}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {!loading && !error && accountInfo && (
            <div className="py-2">
              <p className="px-4 pb-1 text-[11px] uppercase tracking-widest text-slate-500">
                Summoner
              </p>
              <Link
                href={`/${encodeURIComponent(accountInfo.gameName)}-${encodeURIComponent(accountInfo.tagLine)}`}
                className="flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-colors"
                onClick={() => setShowResults(false)}
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${accountInfo.profileIconId}.png`}
                    alt=""
                    width={44}
                    height={44}
                    className="rounded-full border-2 border-[#5C87F8]"
                  />
                  <div className="flex flex-col">
                    <span className="text-[#EAEAEA] text-sm">
                      {accountInfo.gameName}#{accountInfo.tagLine}
                    </span>
                    <span className="text-xs text-gray-400">
                      Level {accountInfo.summonerLevel}
                    </span>
                  </div>
                </div>
                <span className="bg-[#1E2A78] text-[#EAEAEA] text-xs uppercase px-2 py-1 rounded-md">
                  {region}
                </span>
              </Link>
            </div>
          )}

          {!loading && !error && !hasResults && (
            <div className="px-4 py-3 text-sm text-slate-500">
              {isSummonerQuery ? "Still typing…" : "No champions found."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
