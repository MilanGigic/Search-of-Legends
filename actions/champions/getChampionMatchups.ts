"use server";

import { db } from "@/db";
import { matchParticipants } from "@/db/schema";
import { and, eq, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export interface ChampionMatchupResult {
  opponentChampionId: number;
  opponentChampionName: string;
  games: number;
  winRate: number;
  winRateDelta: number; // positive = target does better than usual vs this champ
}

export async function getChampionMatchups(championId: number, lane: string) {
  if (!championId || !lane) {
    console.error("Both parameters needed!");
    return;
  }

  // Self-join the table to reference opponent's championId
  const target = alias(matchParticipants, "target");
  const opponent = alias(matchParticipants, "opponent");

  const [baseline] = await db
    .select({
      games: sql<number>`cast(count(*) as integer)`,
      wins: sql<number>`cast(sum(case when ${matchParticipants.win} = 1 then 1 else 0 end) as integer)`,
    })
    .from(matchParticipants)
    .where(
      and(
        eq(matchParticipants.championId, championId),
        eq(matchParticipants.individualPosition, lane),
      ),
    );

  if (!baseline || baseline.games === 0) return null;
  const baselineWinRate = (baseline.wins / baseline.games) * 100;

  const matchups = await db
    .select({
      opponentChampionId: opponent.championId,
      opponentChampionName: opponent.championName,
      games: sql<number>`cast(count(*) as integer)`,
      wins: sql<number>`cast(sum(case when ${target.win} = 1 then 1 else 0 end) as integer)`,
    })
    .from(target)
    .innerJoin(
      opponent,
      and(
        eq(target.matchId, opponent.matchId),
        eq(target.individualPosition, opponent.individualPosition),
        ne(target.teamId, opponent.teamId),
      ),
    )
    .where(
      and(
        eq(target.championId, championId),
        eq(target.individualPosition, lane),
        ne(opponent.championId, championId),
      ),
    )
    .groupBy(opponent.championId, opponent.championName);

  const results: ChampionMatchupResult[] = matchups
    .filter((m) => m.opponentChampionId !== null)
    .map((m) => {
      const winRate = (m.wins / m.games) * 100;
      return {
        opponentChampionId: m.opponentChampionId!,
        opponentChampionName: m.opponentChampionName!,
        games: m.games,
        winRate: Number(winRate.toFixed(1)),
        winRateDelta: Number((winRate - baselineWinRate).toFixed(1)),
      };
    });

  return {
    baselineWinRate: Number(baselineWinRate.toFixed(1)),
    goodAgainst: [...results]
      .sort((a, b) => b.winRateDelta - a.winRateDelta)
      .slice(0, 5),
    badAgainst: [...results]
      .sort((a, b) => a.winRateDelta - b.winRateDelta)
      .slice(0, 5),
  };
}
