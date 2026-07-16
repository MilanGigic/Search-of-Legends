"use server";

import { getMetaChampions } from "../performance/getMetaChampions";

export interface ChampionSummary {
  championId: number | null;
  championName: string;
  championImage: string;
  lane: string | null;
  tier: string | null;
  wins: number;
  gamesPlayed: number;
  totalGames: number;
  accentColor: string | null;
}

export async function getChampionSummary(
  name: string,
): Promise<ChampionSummary | null> {
  const allChampions = await getMetaChampions(); // cached — this is a lookup, not a fresh scan
  const champion = allChampions.find((c) => c.championName === name);
  if (!champion) return null;

  return {
    championId: champion.championId,
    championName: champion.championName,
    championImage: champion.championImage,
    lane: champion.lane,
    tier: champion.tier,
    wins: champion.wins,
    gamesPlayed: champion.gamesPlayed,
    totalGames: champion.totalGames,
    accentColor: champion.accentColor,
  };
}
