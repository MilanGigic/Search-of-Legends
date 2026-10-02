"use server";

import { db } from "@/db";
import { matchParticipants } from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { kda } from "../../lib/riot";

const RANKED_SOLO_QUEUE_ID = 420;

export async function getRolePerformance(puuid: string) {
  const gamesPlayed = sql<number>`COUNT(*)::int`;

  // Aggregate stats by role, most-played first.
  const stats = await db
    .select({
      role: matchParticipants.individualPosition,
      gamesPlayed,
      avgKills: sql<number>`AVG(${matchParticipants.kills})::float`,
      avgDeaths: sql<number>`AVG(${matchParticipants.deaths})::float`,
      avgAssists: sql<number>`AVG(${matchParticipants.assists})::float`,
      avgCS: sql<number>`AVG(${matchParticipants.totalMinionsKilled})::float`,
      avgTime: sql<number>`AVG(${matchParticipants.timePlayed})::float`,
      wins: sql<number>`SUM(CASE WHEN ${matchParticipants.win} = 1 THEN 1 ELSE 0 END)::int`,
    })
    .from(matchParticipants)
    .where(
      and(
        eq(matchParticipants.puuid, puuid),
        eq(matchParticipants.queueId, RANKED_SOLO_QUEUE_ID),
      ),
    )
    .groupBy(matchParticipants.individualPosition)
    .orderBy(desc(gamesPlayed));

  // Nothing here is async, so a plain map is enough.
  return stats.map((stat) => ({
    role: stat.role,
    gamesPlayed: stat.gamesPlayed,
    wins: stat.wins,
    losses: stat.gamesPlayed - stat.wins,
    avgKills: stat.avgKills,
    avgDeaths: stat.avgDeaths,
    avgAssists: stat.avgAssists,
    kda: kda(stat.avgKills, stat.avgDeaths, stat.avgAssists),
    csPerMin:
      stat.avgTime > 0 ? (stat.avgCS / (stat.avgTime / 60)).toFixed(1) : "0.0",
  }));
}
