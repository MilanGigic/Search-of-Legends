// app/api/check-matches/route.ts
import { db } from "@/db";
import { and, eq, inArray } from "drizzle-orm";
import {
  matches,
  matchDetails,
  matchParticipants,
  matchObjectives,
  matchTeams,
  matchBans,
} from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const puuid = searchParams.get("puuid");
  const matchIds = searchParams.get("matchIds");

  try {
    // Validate inputs
    if (!puuid || typeof puuid !== "string") {
      return NextResponse.json({ error: "Invalid puuid" }, { status: 400 });
    }

    let matchIdArray: string[];
    try {
      matchIdArray = JSON.parse(matchIds as string);
      if (!Array.isArray(matchIdArray)) {
        throw new Error("matchIds must be an array");
      }
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid matchIds format" },
        { status: 400 }
      );
    }

    console.log(`Checking ${matchIdArray.length} matches for puuid ${puuid}`);

    // Fetch all related match data in a single query
    const matchData = await db.transaction(async (tx) => {
      // 1. Get base match records
      const matchRecords = await tx.query.matches.findMany({
        where: and(
          eq(matches.puuid, puuid),
          inArray(matches.matchId, matchIdArray)
        ),
      });

      if (matchRecords.length === 0) return [];

      const foundMatchIds = matchRecords.map((m) => m.matchId);

      // 2. Get all related data in parallel
      const [details, participants, objectives, teams, bans] =
        await Promise.all([
          tx.query.matchDetails.findMany({
            where: inArray(matchDetails.matchId, foundMatchIds),
          }),
          tx.query.matchParticipants.findMany({
            where: inArray(matchParticipants.matchId, foundMatchIds),
          }),
          tx.query.matchObjectives.findMany({
            where: inArray(matchObjectives.matchId, foundMatchIds),
          }),
          tx.query.matchTeams.findMany({
            where: inArray(matchTeams.matchId, foundMatchIds),
          }),
          tx.query.matchBans.findMany({
            where: inArray(matchBans.matchId, foundMatchIds),
          }),
        ]);

      // 3. Structure the data for response
      return foundMatchIds.map((matchId) => {
        const matchDetail = details.find((d) => d.matchId === matchId);
        const matchParticipantsList = participants.filter(
          (p) => p.matchId === matchId
        );
        const matchObjective = objectives.find((o) => o.matchId === matchId);
        const matchTeamsList = teams.filter((t) => t.matchId === matchId);
        const matchBansList = bans.filter((b) => b.matchId === matchId);

        return {
          info: matchDetail
            ? {
                matchId: matchId,
                gameId: matchId,
                gameCreation: matchDetail.gameCreation,
                gameMode: matchDetail.gameMode,
                gameType: matchDetail.gameType,
                gameVersion: matchDetail.gameVersion,
                mapId: matchDetail.mapId,
                platformId: matchDetail.platformId,
                queueId: matchDetail.queueId,
                tournamentCode: matchDetail.tournamentCode,
              }
            : null,
          participants: matchParticipantsList,
          objectives: matchObjective,
          teams: matchTeamsList,
          bans: matchBansList,
        };
      });
    });

    // Determine which match IDs were not found
    const foundMatchIds = matchData
      .map((m) => m.info?.gameId)
      .filter(Boolean) as string[];
    const missingMatchIds = matchIdArray.filter(
      (id) => !foundMatchIds.includes(id)
    );

    console.log(
      `Found ${foundMatchIds.length} matches in database, ${missingMatchIds.length} missing`
    );

    return NextResponse.json({
      foundMatches: matchData,
      missingMatchIds,
    });
  } catch (error) {
    console.error("Error checking matches:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
