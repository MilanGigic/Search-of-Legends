import { db } from "@/db";
import { rankedStats } from "@/db/schema";
import { REGIONS } from "@/lib/riot";
import { sql } from "drizzle-orm";

interface Row {
  puuid: string;
  queueType: string;
  region: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  leaderboardPosition: number | null;
  wins: number;
  losses: number;
  updatedAt: Date;
}

type Tier = "CHALLENGER" | "GRANDMASTER" | "MASTER";

const TIER_ENDPOINTS: Record<Tier, string> = {
  CHALLENGER: "challengerleagues",
  GRANDMASTER: "grandmasterleagues",
  MASTER: "masterleagues",
};

async function fetchTierLeaderboard(
  region: string,
  tier: Tier,
): Promise<LeaderboardLeagueData> {
  const endpoint = TIER_ENDPOINTS[tier];
  const res = await fetch(
    `https://${region}.api.riotgames.com/lol/league/v4/${endpoint}/by-queue/RANKED_SOLO_5x5?api_key=${process.env.RIOT_API_KEY}`,
  );

  if (!res.ok) {
    throw new Error(
      `[leaderboard] Failed to fetch ${tier} for ${region}: ${res.status}`,
    );
  }

  return res.json();
}

const CHUNK_SIZE = 500; // 500 rows × 8 columns = 4000 params, well under the 65535 limit

async function insertInChunks(rows: Row[]) {
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);
    await db
      .insert(rankedStats)
      .values(chunk)
      .onConflictDoUpdate({
        target: [rankedStats.puuid, rankedStats.queueType],
        set: {
          tier: sql`excluded.tier`,
          rank: sql`excluded.rank`,
          leaguePoints: sql`excluded.league_points`,
          wins: sql`excluded.wins`,
          losses: sql`excluded.losses`,
          leaderboardPosition: sql`excluded.leaderboard_position`,
          updatedAt: new Date(),
        },
      });
  }
}

export async function refreshLeaderboardForRegion(region: string) {
  const [challengerData, grandmasterData, masterData] = await Promise.all([
    fetchTierLeaderboard(region, "CHALLENGER"),
    fetchTierLeaderboard(region, "GRANDMASTER"),
    fetchTierLeaderboard(region, "MASTER"),
  ]);

  const toRows = (data: LeaderboardLeagueData) =>
    data.entries.map((entry) => ({
      puuid: entry.puuid,
      queueType: "RANKED_SOLO_5x5" as const,
      region,
      tier: data.tier,
      rank: entry.rank,
      leaguePoints: entry.leaguePoints,
      leaderboardPosition: null,
      wins: entry.wins,
      losses: entry.losses,
      updatedAt: new Date(),
    }));

  const allRows = [
    ...toRows(challengerData),
    ...toRows(grandmasterData),
    ...toRows(masterData),
  ]
    .sort((a, b) => b.leaguePoints - a.leaguePoints)
    .map((row, index) => ({
      ...row,
      leaderboardPosition: index + 1, // 1-based
    }));

  await insertInChunks(allRows);

  console.log(
    `[leaderboard] ${region}: ${allRows.length} entries upserted ` +
      `(${challengerData.entries.length} CH / ${grandmasterData.entries.length} GM / ${masterData.entries.length} M)`,
  );
}

export async function refreshLeaderboards() {
  await Promise.allSettled(
    REGIONS.map(async (region) => {
      try {
        await refreshLeaderboardForRegion(region);
      } catch (err) {
        console.error(`[leaderboard] Failed to refresh ${region}:`, err);
      }
    }),
  );
}
