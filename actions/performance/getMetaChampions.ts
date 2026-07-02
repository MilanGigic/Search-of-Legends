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
      winRate: sql<number>`round((sum(case when ${matchParticipants.win} = 1 then 1 else 0 end)::numeric / count(*)) * 100, 2)`,
      avgDamageDealt: sql<number>`round(avg(${matchParticipants.totalDamageDealtToChampions})::numeric, 0)`,
      gameVersion: matchDetails.gameVersion,
      bans: sql<number>`coalesce(${banCounts.bans}, 0)`,
      lane: matchParticipants.individualPosition!,
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
      matchDetails.gameVersion,
      banCounts.bans,
      matchParticipants.individualPosition,
    );

  const tiers = calculateMetaTiers(stats, {
    winRateWeight: 0.5,
    banRateWeight: 0.35,
    pickRateWeight: 0.15,
  });

  return stats.map((stat, index) => ({
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
    totalGames: stats.length,
    rank: index + 1,
    lane: stat.lane,
    tier: tiers.find(
      (t) => t.name === stat.championName && t.lane === stat.lane,
    )!.tier,
  }));
}
