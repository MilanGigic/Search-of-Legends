"use client";

import { useState } from "react";
import Image from "next/image";
import { BsArrowDown, BsArrowUp } from "react-icons/bs";

interface ChampionStat {
  championId: number | null;
  championName: string;
  championImage: string;
  kda: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  gamesPlayed: number;
  wins: number;
  csPerMin: number;
  avgDamageDealt: number;
  avgTime: number;
}

type SortKey = "kda" | "gamesPlayed" | "winRate" | "csPerMin" | "dpm";

export default function ChampionStatsClient({
  champions,
  version,
}: {
  champions: ChampionStat[];
  version: string;
}) {
  const [sortBy, setSortBy] = useState<SortKey>("gamesPlayed");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const toggleSort = (key: SortKey) => {
    if (key === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("desc");
    }
  };

  const sorted = [...champions].sort((a, b) => {
    const aValue =
      sortBy === "winRate"
        ? a.wins / a.gamesPlayed
        : sortBy === "dpm"
        ? a.avgDamageDealt / (a.avgTime / 60)
        : a[sortBy];

    const bValue =
      sortBy === "winRate"
        ? b.wins / b.gamesPlayed
        : sortBy === "dpm"
        ? b.avgDamageDealt / (b.avgTime / 60)
        : b[sortBy];

    if (sortOrder === "asc") return aValue - bValue;
    else return bValue - aValue;
  });

  return (
    <div className="pt-5 max-w-5xl mx-auto rounded-md bg-gradient-to-b from-[#121624] to-[#1B1F35]">
      <ul className="grid grid-cols-6 text-slate-300 px-5 font-semibold cursor-pointer">
        <li
          className={`text-center flex items-center justify-center col-start-2 ${
            sortBy === "kda" && "pr-4"
          }`}
          onClick={() => toggleSort("kda")}
        >
          {sortBy === "kda" ? (
            sortOrder === "asc" ? (
              <BsArrowUp />
            ) : (
              <BsArrowDown />
            )
          ) : null}
          KDA
        </li>
        <li
          className={`text-center flex items-center justify-center ${
            sortBy === "gamesPlayed" && "pr-4"
          }`}
          onClick={() => toggleSort("gamesPlayed")}
        >
          {sortBy === "gamesPlayed" ? (
            sortOrder === "asc" ? (
              <BsArrowUp />
            ) : (
              <BsArrowDown />
            )
          ) : null}
          Games
        </li>
        <li
          className={`text-center flex items-center justify-center ${
            sortBy === "winRate" && "pr-4"
          }`}
          onClick={() => toggleSort("winRate")}
        >
          {sortBy === "winRate" ? (
            sortOrder === "asc" ? (
              <BsArrowUp />
            ) : (
              <BsArrowDown />
            )
          ) : null}
          WR
        </li>
        <li
          className={`text-center flex items-center justify-center ${
            sortBy === "csPerMin" && "pr-4"
          }`}
          onClick={() => toggleSort("csPerMin")}
        >
          {sortBy === "csPerMin" ? (
            sortOrder === "asc" ? (
              <BsArrowUp />
            ) : (
              <BsArrowDown />
            )
          ) : null}
          CS/min
        </li>
        <li
          className={`text-center flex items-center justify-center ${
            sortBy === "dpm" && "pr-4"
          }`}
          onClick={() => toggleSort("dpm")}
        >
          {sortBy === "dpm" ? (
            sortOrder === "asc" ? (
              <BsArrowUp />
            ) : (
              <BsArrowDown />
            )
          ) : null}
          DMG/min
        </li>
      </ul>
      <ul className="mt-1">
        {sorted.map((champ, index) => (
          <li
            key={champ.championId}
            className={`text-center grid grid-cols-6 py-1 px-5 ${
              index < sorted.length - 1 ? "border-b border-gray-700" : ""
            }`}
          >
            <div className="flex items-center justify-start gap-0.5 pl-6">
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ.championImage}`}
                alt={champ.championName}
                width={40}
                height={40}
                className="border border-gray-500 rounded-full"
              />
              <h1 className="text-based">{champ.championName}</h1>
            </div>

            <p className="text-center flex flex-col items-center justify-center">
              {champ.kda}
              <span className="text-sm text-gray-400 block">
                {Math.round(champ.avgKills)}/
                <span className="text-red-700">
                  {Math.round(champ.avgDeaths)}
                </span>
                /{Math.round(champ.avgAssists)}
              </span>
            </p>

            <p className="text-center flex flex-col items-center justify-center">
              {champ.gamesPlayed}
            </p>
            <p className="text-sm text-center flex flex-col items-center justify-center">
              {Math.round((champ.wins / champ.gamesPlayed) * 100)}%
              <span className="text-gray-400 text-xs">
                {champ.wins}W/{champ.gamesPlayed - champ.wins}L
              </span>
            </p>
            <p className="text-center flex flex-col items-center justify-center">
              {champ.csPerMin.toFixed(1)}
            </p>
            <p className="text-center flex flex-col items-center justify-center">
              {Math.round(champ.avgDamageDealt / (champ.avgTime / 60))}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
