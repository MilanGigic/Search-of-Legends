"use server";

import { db } from "@/db";
import { champions, matchDetails, matchParticipants } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getLastThirtyMatches(puuid: string) {
  if (!puuid) {
    throw new Error("[getLastThirtyMatches] puuid required");
  }

  return db
    .select({
      kills: matchParticipants.kills,
      deaths: matchParticipants.deaths,
      assists: matchParticipants.assists,
      cs: matchParticipants.totalMinionsKilled,
      time: matchParticipants.timePlayed,
      win: matchParticipants.win,
      damage: matchParticipants.totalDamageDealtToChampions,
      championImage: champions.image,
      championName: champions.name,
      championId: champions.id,
    })
    .from(matchParticipants)
    .innerJoin(
      matchDetails,
      eq(matchParticipants.matchId, matchDetails.matchId),
    )
    .innerJoin(champions, eq(matchParticipants.championId, champions.key))
    .where(eq(matchParticipants.puuid, puuid))
    .orderBy(desc(matchDetails.gameCreation))
    .limit(30);
}
