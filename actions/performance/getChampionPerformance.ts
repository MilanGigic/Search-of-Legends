"use server";

import { db } from "@/db";
import { matchParticipants, champions } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { kda } from "../../lib/riot";

export async function getChampionPerformance(puuid: string) {
  const gamesPlayed = sql<number>`COUNT(*)::int`;

  const stats = await db
    .select({
      championId: matchParticipants.championId,
      championName: champions.name,
      championImage: champions.image,
      gamesPlayed,
      avgKills: sql<number>`AVG(${matchParticipants.kills})::float`,
      avgDeaths: sql<number>`AVG(${matchParticipants.deaths})::float`,
      avgAssists: sql<number>`AVG(${matchParticipants.assists})::float`,
      avgCS: sql<number>`AVG(${matchParticipants.totalMinionsKilled})::float`,
      avgTime: sql<number>`AVG(${matchParticipants.timePlayed})::float`,
      wins: sql<number>`SUM(CASE WHEN ${matchParticipants.win} = 1 THEN 1 ELSE 0 END)::int`,
      avgDamageDealt: sql<number>`AVG(${matchParticipants.totalDamageDealtToChampions})::float`,
    })
    .from(matchParticipants)
    .leftJoin(champions, eq(matchParticipants.championId, champions.key))
    .where(eq(matchParticipants.puuid, puuid))
    .groupBy(matchParticipants.championId, champions.name, champions.image)
    .orderBy(desc(gamesPlayed));

  return stats.map((stat) => ({
    championId: stat.championId,
    gamesPlayed: stat.gamesPlayed,
    wins: stat.wins,
    losses: stat.gamesPlayed - stat.wins,
    avgKills: stat.avgKills,
    avgDeaths: stat.avgDeaths,
    avgAssists: stat.avgAssists,
    kda: kda(stat.avgKills, stat.avgDeaths, stat.avgAssists),
    csPerMin:
      stat.avgTime > 0
        ? Number((stat.avgCS / (stat.avgTime / 60)).toFixed(1))
        : 0,
    championName: stat.championName ?? "Unknown",
    championImage: stat.championImage ?? "",
    avgDamageDealt: stat.avgDamageDealt,
    avgTime: stat.avgTime,
  }));
}
