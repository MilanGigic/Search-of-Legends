"use server";

import { db } from "@/db";
import { champions, matchDetails, matchParticipants } from "@/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";

export async function getLastThirtyMatches(puuid: string) {
  if (!puuid) {
    throw new Error("[getLastThirtyMatches]Puuid required!");
  }

  const last30MatchIds = await db
    .select({ matchId: matchParticipants.matchId })
    .from(matchParticipants)
    .where(eq(matchParticipants.puuid, puuid))
    .orderBy(desc(matchDetails.gameCreation)) // Ideally use gameCreation desc
    .innerJoin(
      matchDetails,
      eq(matchParticipants.matchId, matchDetails.matchId),
    )
    .limit(30);

  const matchIds = last30MatchIds.map((m) => m.matchId);

  const last30ParticipantRows = await db
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
    .where(
      and(
        eq(matchParticipants.puuid, puuid),
        inArray(matchParticipants.matchId, matchIds),
      ),
    )
    .innerJoin(champions, eq(matchParticipants.championId, champions.key));

  return last30ParticipantRows;
}
