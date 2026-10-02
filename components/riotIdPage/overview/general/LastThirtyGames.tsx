"use client";

import { kda } from "@/lib/riot";
import Image from "next/image";
import WinrateGauge from "../../../WinrateGauge";
import { getLastThirtyMatches } from "@/actions/getLastThirtyMatches";
import Last30GamesSkeleton from "../../Last30GamesSkeleton";
import { useAccountData } from "../../hooks/useAccountData";
import { winRatePercent } from "@/lib/winrate";

type ChampionTotals = {
  championId: string;
  championName: string;
  championImage: string;
  gamesPlayed: number;
  wins: number;
  kills: number;
  deaths: number;
  assists: number;
};

const LastThirtyGames = ({
  puuid,
  version,
}: {
  puuid: string;
  version: string;
}) => {
  const { data, error, isLoading } = useAccountData(
    puuid,
    getLastThirtyMatches,
  );

  if (isLoading) {
    return <Last30GamesSkeleton />;
  }

  if (!data) {
    return (
      <div className="p-5 py-3 border border-gray-700/70 rounded-md text-sm text-red-400">
        {error}
      </div>
    );
  }

  const wins = data.filter((row) => row.win === 1).length;
  const losses = data.length - wins;
  const winRate = data.length > 0 ? (wins / data.length) * 100 : 0;

  const statsByChampion = new Map<string, ChampionTotals>();

  for (const row of data) {
    const totals = statsByChampion.get(row.championId) ?? {
      championId: row.championId,
      championName: row.championName,
      championImage: row.championImage,
      gamesPlayed: 0,
      wins: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
    };

    totals.gamesPlayed += 1;
    totals.wins += row.win === 1 ? 1 : 0;
    totals.kills += row.kills ?? 0;
    totals.deaths += row.deaths ?? 0;
    totals.assists += row.assists ?? 0;

    statsByChampion.set(row.championId, totals);
  }

  const top3 = Array.from(statsByChampion.values())
    .sort((a, b) => b.gamesPlayed - a.gamesPlayed)
    .slice(0, 3);

  return (
    <div className="p-5 py-3 border border-gray-700/70 text-slate-300 rounded-md flex flex-col gap-1 bg-gradient-to-b from-[#1B1F35] to-[#121624] shadow-sm shadow-[#2A2A40]">
      <div>
        <h1 className="flex items-center justify-center font-semibold text-lg">
          Last 30 Games
        </h1>
        <WinrateGauge
          percentage={winRate}
          subtitle={`${wins}W-${losses}L`}
          size={100}
        />
      </div>
      {top3.map((stats, index) => {
        // Per-game averages (the old code divided by time played).
        const userKda = kda(
          stats.kills / stats.gamesPlayed,
          stats.deaths / stats.gamesPlayed,
          stats.assists / stats.gamesPlayed,
        );

        return (
          <div
            key={stats.championId}
            className={`flex justify-between p-1 ${
              index < top3.length - 1 ? "border-b" : ""
            }`}
          >
            <div className="flex items-center justify-center rounded-full">
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${stats.championImage}`}
                alt={stats.championName}
                width={44}
                height={44}
                className="rounded-full"
              />
            </div>
            <div className="flex flex-col justify-center text-slate-300">
              <div className="flex flex-col items-center text-center">
                <div className="flex">
                  <p>{stats.wins}W</p>
                  <span>-</span>
                  <p>{stats.gamesPlayed - stats.wins}L</p>
                </div>
                <p className="text-gray-400 text-xs">
                  {winRatePercent(stats.wins, stats.gamesPlayed)}%
                </p>
              </div>
            </div>
            <p className="flex items-center justify-center text-slate-300 text-base gap-0.5 font-medium">
              {userKda.toFixed(1)}{" "}
              <span className="text-gray-400 text-xs text-center items-center flex">
                KDA
              </span>
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default LastThirtyGames;
