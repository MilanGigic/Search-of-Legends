import { db } from "@/db";
import { matchParticipants } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { kda } from "../../lib/riot";

export async function getRolePerformance(puuid: string) {
  // Step 1: Aggregate stats by champion
  const stats = await db
    .select({
      role: matchParticipants.individualPosition!,
      gamesPlayed: sql<number>`COUNT(*)`,
      avgKills: sql<number>`AVG(${matchParticipants.kills})`,
      avgDeaths: sql<number>`AVG(${matchParticipants.deaths})`,
      avgAssists: sql<number>`AVG(${matchParticipants.assists})`,
      avgCS: sql<number>`AVG(${matchParticipants.totalMinionsKilled})`,
      avgTime: sql<number>`AVG(${matchParticipants.timePlayed})`,
      wins: sql<number>`SUM(CASE WHEN ${matchParticipants.win} = 1 THEN 1 ELSE 0 END)`,
    })
    .from(matchParticipants)
    .where(
      and(
        eq(matchParticipants.puuid, puuid),
        eq(matchParticipants.queueId, 420),
      ),
    )
    .groupBy(matchParticipants.individualPosition);

  const enriched = await Promise.all(
    stats.map(async (stat) => {
      const roleKda = kda(
        Number(stat.avgKills),
        Number(stat.avgDeaths),
        Number(stat.avgAssists),
      );

      return {
        role: stat.role,
        gamesPlayed: stat.gamesPlayed,
        wins: stat.wins,
        losses: stat.gamesPlayed - stat.wins,
        avgKills: stat.avgKills,
        avgDeaths: stat.avgDeaths,
        avgAssists: stat.avgAssists,
        kda: roleKda,
        csPerMin: (stat.avgCS / (stat.avgTime / 60)).toFixed(1),
      };
    }),
  );

  return enriched;

  // Step 2: Join with champion table
  // const enriched = await Promise.all(
  //   stats.map(async (stat) => {
  //     const champ = await db.query.champions.findFirst({
  //       where: eq(champions.key, stat.championId!.toString()),
  //     });

  //     const userKda = kda(
  //       Number(stat.avgKills),
  //       Number(stat.avgDeaths),
  //       Number(stat.avgAssists)
  //     );
  //     return {
  //       championId: stat.championId,
  //       gamesPlayed: stat.gamesPlayed,
  //       wins: stat.wins,
  //       losses: stat.gamesPlayed - stat.wins,
  //       avgKills: stat.avgKills,
  //       avgDeaths: stat.avgDeaths,
  //       avgAssists: stat.avgAssists,
  //       kda: userKda,
  //       csPerMin: (stat.avgCS / (stat.avgTime / 60)).toFixed(1),
  //       championName: champ?.name || "Unknown",
  //       championImage: champ?.image || "",
  //     };
  //   })
  // );

  // return enriched;
}
