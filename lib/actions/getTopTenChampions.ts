import { db } from "@/db";
import { champions, matchBans, matchParticipants } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { kda } from "../riot";

export async function getTopTenChampions() {
  const stats = await db
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

  const banStats = await db
    .select({
      championId: matchBans.championId,
      bans: sql<number>`COUNT(*)`,
    })
    .from(matchBans)
    .groupBy(matchBans.championId);

  const banStatsMap = new Map(
    banStats.map((ban) => [ban.championId, ban.bans])
  );

  const enriched = await Promise.all(
    stats.map(async (stat) => {
      const champ = await db.query.champions.findFirst({
        where: eq(champions.key, stat.championId!.toString()),
      });

      const userKda = kda(
        Number(stat.avgKills),
        Number(stat.avgDeaths),
        Number(stat.avgAssists)
      );

      // Get ban count from the map, default to 0 if not found
      const banCount = banStatsMap.get(stat.championId) || 0;

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
        bans: banCount,
      };
    })
  );

  return enriched;
}
