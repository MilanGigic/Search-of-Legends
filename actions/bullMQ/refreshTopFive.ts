import { db } from "@/db";
import { topFivePerRegion } from "@/db/schema";
import { eq } from "drizzle-orm";
import { fetchAccount } from "../fetchAccount";
import { REGIONS } from "@/lib/riot";

interface ExtractedAccountInfo {
  puuid: string;
  gameName: string;
  tagLine: string;
  region: string;
  summonerLevel?: number;
  profileIconId?: number;
  revisionDate?: number;
}

export async function refreshTopFiveForRegion(region: string) {
  const res = await fetch(
    `https://${region}.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5?api_key=${process.env.RIOT_API_KEY}`,
  );

  if (!res.ok) {
    throw new Error(
      `[topFive] Failed to fetch leaderboard for ${region}: ${res.status}`,
    );
  }

  const leaderboardData = await res.json();
  const topFiveEntries: LeagueEntry[] = leaderboardData.entries
    .sort((a: LeagueEntry, b: LeagueEntry) => b.leaguePoints - a.leaguePoints)
    .slice(0, 5);

  const topFiveAccounts = await Promise.all(
    topFiveEntries.map(async (entry) => {
      const accountInfo = (await fetchAccount(
        entry.puuid,
        region,
      )) as ExtractedAccountInfo;

      const profileIconId = accountInfo.profileIconId ?? 0;
      const summonerLevel = accountInfo.summonerLevel ?? 0;

      return {
        gameName: accountInfo.gameName,
        tagLine: accountInfo.tagLine,
        leaguePoints: entry.leaguePoints,
        losses: entry.losses,
        wins: entry.wins,
        puuid: accountInfo.puuid,
        rank: entry.rank,
        region,
        profileIconId,
        summonerLevel,
      };
    }),
  );

  // Delete stale data for this region, then insert fresh
  await db.delete(topFivePerRegion).where(eq(topFivePerRegion.region, region));

  await db.insert(topFivePerRegion).values(topFiveAccounts);

  console.log(
    `[topFive] Refreshed ${region}: ${topFiveAccounts.length} entries`,
  );
}

export async function refreshAllRegions() {
  for (const region of REGIONS) {
    try {
      await refreshTopFiveForRegion(region);
    } catch (err) {
      // Don't let one region failure abort the rest
      console.error(`[topFive] Failed to refresh ${region}:`, err);
    }
  }
}
