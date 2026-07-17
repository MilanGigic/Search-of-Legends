"use client";

import { ChampionSummary } from "@/actions/champions/fetchSelectedChampion";
import { ChampionMatchupResult } from "@/actions/champions/getChampionMatchups";
import { useDataStore } from "@/lib/store/useConstantDataStore";
import Image from "next/image";

interface ChampionMatchupsResult {
  baselineWinRate: number;
  goodAgainst: ChampionMatchupResult[];
  badAgainst: ChampionMatchupResult[];
}

export default function MatchupsPanel({
  data,
  lane,
  version,
  selectedChampion,
}: {
  data: ChampionMatchupsResult | null;
  lane: string;
  version: string;
  selectedChampion: ChampionSummary | null;
}) {
  if (
    !data ||
    (data.goodAgainst.length === 0 && data.badAgainst.length === 0)
  ) {
    return (
      <div className="text-white p-16">
        <h1 className="text-sm uppercase tracking-widest text-[#726e78] mb-5">
          Matchups
        </h1>
        <p className="text-sm text-[#726e78]">
          No matchup data found for this lane yet.
        </p>
      </div>
    );
  }

  if (!selectedChampion) {
    return (
      <div>
        <h1 className="text-white">No champion found</h1>
      </div>
    );
  }

  const seen = new Set<number>();
  const combined = [...data.goodAgainst, ...data.badAgainst]
    .filter((matchup) => {
      if (seen.has(matchup.opponentChampionId)) return false;
      seen.add(matchup.opponentChampionId);
      return true;
    })
    .sort((a, b) => b.winRateDelta - a.winRateDelta);

  const maxAbsDelta = Math.max(
    ...combined.map((m) => Math.abs(m.winRateDelta)),
    1,
  );

  return (
    <div className="text-white px-10 py-4 flex flex-col gap-4 border-b border-[#EDEAE2]/17">
      <h1
        style={{
          color: selectedChampion.accentColor ?? "#edeae2",
        }}
        className="text-lg text-[#726e78] uppercase leading-[0.95] mt-1.5 block tracking-widest font-semibold"
      >
        Matchups
      </h1>
      <p className="text-sm font-mono uppercase text-[#726e78] block mt-0.5">
        vs {lane.toLowerCase()} · baseline {data.baselineWinRate}% win rate
      </p>

      <div className="flex flex-col gap-3">
        {combined.map((matchup) => {
          const isGood = matchup.winRateDelta >= 0;
          const barWidthPercent =
            (Math.abs(matchup.winRateDelta) / maxAbsDelta) * 50; // half-track max, mirrors mockup scaling

          return (
            <div
              key={matchup.opponentChampionId}
              className="grid grid-cols-[160px_1fr_64px] items-center gap-5"
            >
              <div className="flex items-center justify-start gap-4 w-56">
                <div className="relative w-24 h-[40px] min-h-[40px] overflow-hidden rounded bg-black-700 shrink-0">
                  <Image
                    src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${matchup.opponentChampionName}.png`}
                    alt={matchup.opponentChampionName}
                    width={96}
                    height={40}
                    loading="eager"
                    className="object-cover absolute h-[100%] w-[100%] inset-0 bg-transparent"
                  />
                </div>
                <span className="text-sm font-mono uppercase text-[#726e78] block mt-0.5">
                  {matchup.games.toLocaleString()} games
                </span>
              </div>

              <div className="relative h-1.5 bg-white/[0.06] rounded-full">
                <div className="absolute -top-1.5 -bottom-1.5 left-1/2 w-px bg-white/10" />
                <div
                  className={`absolute top-0 h-full rounded-full ${
                    isGood ? "bg-[#8fb088] left-1/2" : "bg-[#c07872] right-1/2"
                  }`}
                  style={{ width: `${barWidthPercent}%` }}
                />
              </div>

              <span
                className={`text-sm font-mono font-medium text-right ${
                  isGood ? "text-[#8fb088]" : "text-[#c07872]"
                }`}
              >
                {isGood ? "+" : ""}
                {matchup.winRateDelta}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
