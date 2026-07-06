"use server";
import { db } from "@/db";
import {
  champions,
  matchBans,
  matchDetails,
  matchParticipants,
} from "@/db/schema";
import { kda } from "@/lib/riot";
import { eq, sql } from "drizzle-orm";
import { calculateMetaTiers } from "./calculateMetaTiers";

export async function getMetaChampions() {
  const banCounts = db
    .select({
      championId: matchBans.championId,
      bans: sql<number>`COUNT(*)`.as("bans"),
    })
    .from(matchBans)
    .groupBy(matchBans.championId)
    .as("banCounts");

  // Step A: overall stats per champion, no lane grouping
  const stats = await db
    .select({
      championId: matchParticipants.championId,
      championName: champions.name,
      championImage: champions.image,
      gamesPlayed: sql<number>`cast(count(*) as integer)`,
      wins: sql<number>`SUM(CASE WHEN ${matchParticipants.win} = 1 THEN 1 ELSE 0 END)`,
      losses: sql<number>`COUNT(*) - SUM(CASE WHEN ${matchParticipants.win} = 1 THEN 1 ELSE 0 END)`,
      avgKills: sql<number>`round(avg(${matchParticipants.kills})::numeric, 2)`,
      avgDeaths: sql<number>`round(avg(${matchParticipants.deaths})::numeric, 2)`,
      avgAssists: sql<number>`round(avg(${matchParticipants.assists})::numeric, 2)`,
      avgCS: sql<number>`round(avg(${matchParticipants.totalMinionsKilled})::numeric, 1)`,
      avgTime: sql<number>`round(avg(${matchParticipants.timePlayed})::numeric, 0)`,
      avgDamageDealt: sql<number>`round(avg(${matchParticipants.totalDamageDealtToChampions})::numeric, 0)`,
      gameVersion: sql<string>`max(${matchDetails.gameVersion})`,
      bans: sql<number>`coalesce(${banCounts.bans}, 0)`,
    })
    .from(matchParticipants)
    .innerJoin(
      matchDetails,
      eq(matchParticipants.matchId, matchDetails.matchId),
    )
    .innerJoin(champions, eq(matchParticipants.championId, champions.key))
    .leftJoin(banCounts, eq(matchParticipants.championId, banCounts.championId))
    .groupBy(
      matchParticipants.championId,
      champions.name,
      champions.image,
      banCounts.bans,
    );

  // Step B: games per (champion, lane), used only to find each champion's top lane
  const laneCounts = await db
    .select({
      championId: matchParticipants.championId,
      lane: matchParticipants.individualPosition!,
      games: sql<number>`cast(count(*) as integer)`,
    })
    .from(matchParticipants)
    .groupBy(
      matchParticipants.championId,
      matchParticipants.individualPosition,
    );

  // Step C: reduce to "most played lane" per champion
  const topLaneMap = new Map<number, string>();
  const topLaneGames = new Map<number, number>();
  for (const row of laneCounts) {
    const currentBest = topLaneGames.get(row.championId!) ?? -1;
    if (row.games > currentBest) {
      topLaneMap.set(row.championId!, row.lane!);
      topLaneGames.set(row.championId!, row.games);
    }
  }

  // Step D: attach derived lane to each champion row
  const statsWithLane = stats.map((stat) => ({
    ...stat,
    lane: topLaneMap.get(stat.championId!) ?? "UNKNOWN",
    winRate: (stat.wins / stat.gamesPlayed) * 100,
  }));

  const tiers = calculateMetaTiers(statsWithLane, {
    winRateWeight: 0.5,
    banRateWeight: 0.35,
    pickRateWeight: 0.15,
  });
  const tierMap = new Map(tiers.map((t) => [t.name, t.tier]));

  const totalGames = statsWithLane.reduce(
    (sum, stat) => sum + stat.gamesPlayed,
    0,
  );

  return statsWithLane.map((stat, index) => ({
    championId: stat.championId,
    gamesPlayed: stat.gamesPlayed,
    wins: stat.wins,
    losses: stat.losses,
    avgKills: stat.avgKills,
    avgDeaths: stat.avgDeaths,
    avgAssists: stat.avgAssists,
    kda: kda(
      Number(stat.avgKills),
      Number(stat.avgDeaths),
      Number(stat.avgAssists),
    ),
    csPerMin: Number((stat.avgCS / (stat.avgTime / 60)).toFixed(1)),
    championName: stat.championName,
    championImage: stat.championImage,
    avgDamageDealt: stat.avgDamageDealt,
    avgTime: stat.avgTime,
    bans: stat.bans,
    gameVersion: stat.gameVersion,
    totalGames,
    rank: index + 1,
    lane: stat.lane,
    tier: tierMap.get(stat.championName)!,
  }));
}
