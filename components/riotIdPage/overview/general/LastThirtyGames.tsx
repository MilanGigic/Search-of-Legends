"use client";

import { kda } from "@/lib/riot";
import Image from "next/image";
import WinrateGauge from "../../../WinrateGauge";
import { useEffect, useState } from "react";
import { getLastThirtyMatches } from "@/actions/getLastThirtyMatches";
import Last30GamesSkeleton from "../../Last30GamesSkeleton";

const LastThirtyGames = ({
  puuid,
  version,
}: {
  puuid: string;
  version: string;
}) => {
  const [last30ParticipantRows, setLast30ParticipantRows] = useState<
    LastThirtyMatches[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true); // reset on puuid change too, not just mount
    (async () => {
      const data = await getLastThirtyMatches(puuid);
      setLast30ParticipantRows(data);
      setIsLoading(false);
    })();
  }, [puuid]);

  let wins = 0;
  let losses = 0;
  for (const row of last30ParticipantRows) {
    if (row.win === 1) wins++;
    else losses++;
  }
  const winRate = wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0;

  const statsByChampion = new Map<
    string,
    {
      gamesPlayed: number;
      kills: number;
      deaths: number;
      assists: number;
      cs: number;
      time: number;
      wins: number;
      damage: number;
      championName: string;
      championImage: string;
      championId: string;
    }
  >();

  for (const row of last30ParticipantRows) {
    const champId = row.championId!;
    const existing = statsByChampion.get(champId) || {
      gamesPlayed: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
      cs: 0,
      time: 0,
      wins: 0,
      damage: 0,
    };
    statsByChampion.set(champId, {
      gamesPlayed: existing.gamesPlayed + 1,
      kills: existing.kills + row.kills!,
      deaths: existing.deaths + row.deaths!,
      assists: existing.assists + row.assists!,
      cs: existing.cs + row.cs!,
      time: existing.time + row.time!,
      wins: existing.wins + (row.win ? 1 : 0),
      damage: existing.damage + row.damage!,
      championImage: row.championImage,
      championName: row.championName,
      championId: champId,
    });
  }

  const sorted = Array.from(statsByChampion.entries())
    .sort((a, b) => b[1].gamesPlayed - a[1].gamesPlayed)
    .slice(0, 3);

  if (isLoading) {
    return <Last30GamesSkeleton />;
  }

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
      {sorted.map(([, stats], index) => {
        const avgKills = stats.kills / stats.time;
        const avgDeaths = stats.deaths / stats.time;
        const avgAssists = stats.assists / stats.time;
        const userKda = kda(avgKills, avgDeaths, avgAssists);

        return (
          <div
            key={index}
            className={`flex justify-between ${index < sorted.length - 1 && "border-b"} p-1`}
          >
            <div className="flex items-center justify-center rounded-full">
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${stats.championImage}`}
                alt={`${stats.championName}`}
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
                  {((stats.wins / stats.gamesPlayed) * 100).toFixed(0)}%
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
