import { db } from "@/db";
import { champions, matchBans, matchParticipants } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { kda } from "../../lib/riot";

export async function getMostBannedChampions() {
  // Step 1: Aggregate stats by champion
  const banStats = await db
    .select({
      championId: matchBans.championId,
      bans: sql<number>`COUNT(*)`,
    })
    .from(matchBans)
    .groupBy(matchBans.championId);

  const participantStats = await db
    .select({
      championId: matchParticipants.championId,
      gamesPlayed: sql<number>`COUNT(*)`,
      avgKills: sql<number>`AVG(${matchParticipants.kills})`,
      avgDeaths: sql<number>`AVG(${matchParticipants.deaths})`,
      avgAssists: sql<number>`AVG(${matchParticipants.assists})`,
      avgCS: sql<number>`AVG(${matchParticipants.totalMinionsKilled})`,
      avgTime: sql<number>`AVG(${matchParticipants.timePlayed})`,
      wins: sql<number>`SUM(CASE WHEN ${matchParticipants.win} = 1 THEN 1 ELSE 0 END)`,
      avgDamageDealt: sql<number>`AVG(${matchParticipants.totalDamageDealtToChampions})`,
    })
    .from(matchParticipants)
    .groupBy(matchParticipants.championId);

  // Step 3: Create maps for quick lookup
  const statsMap = new Map(
    participantStats.map((stat) => [stat.championId, stat]),
  );
  const banStatsMap = new Map(banStats.map((ban) => [ban.championId, ban]));

  // Step 4: Get all champion IDs that have either bans or stats
  const allChampionIds = new Set([
    ...banStats.map((b) => b.championId),
    ...participantStats.map((s) => s.championId),
  ]);
  // Step 2: Join with champion table
  const enriched = await Promise.all(
    Array.from(allChampionIds)
      .filter((championId) => championId !== null) // Filter out null values
      .map(async (championId) => {
        const stat = statsMap.get(championId);
        const banData = banStatsMap.get(championId);

        // Get champion info
        const champ = await db.query.champions.findFirst({
          where: eq(champions.key, championId!),
        });

        // If no participant stats, create defaults (champions that are only banned, never played)
        if (!stat) {
          return {
            championId: championId,
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            avgKills: 0,
            avgDeaths: 0,
            avgAssists: 0,
            kda: 0,
            csPerMin: 0,
            championName: champ?.name || "Unknown",
            championImage: champ?.image || "",
            avgDamageDealt: 0,
            avgTime: 0,
            bans: banData?.bans || 0,
          };
        }

        const userKda = kda(
          Number(stat.avgKills),
          Number(stat.avgDeaths),
          Number(stat.avgAssists),
        );

        return {
          championId: stat.championId,
          gamesPlayed: stat.gamesPlayed,
          wins: stat.wins,
          losses: stat.gamesPlayed - stat.wins,
          avgKills: stat.avgKills,
          avgDeaths: stat.avgDeaths,
          avgAssists: stat.avgAssists,
          kda: userKda,
          csPerMin: Number((stat.avgCS / (stat.avgTime / 60)).toFixed(1)),
          championName: champ?.name || "Unknown",
          championImage: champ?.image || "",
          avgDamageDealt: stat.avgDamageDealt,
          avgTime: stat.avgTime,
          bans: banData?.bans || 0,
        };
      }),
  );

  return {
    championStats: enriched, // Array of all champion stats
    banStats: banStats, // Original ban stats for backward compatibility
  };
}
