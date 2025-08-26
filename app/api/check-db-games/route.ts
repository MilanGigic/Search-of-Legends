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
  /* eslint-disable @typescript-eslint/no-unused-vars */
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
      const invalidMatchIds = matchIdArray.filter(
        (id) => typeof id !== "string" || id.trim().length === 0
      );

      if (invalidMatchIds.length > 0) {
        return NextResponse.json(
          { error: "All matchIds must be non-empty strings" },
          { status: 400 }
        );
      }
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid matchIds format", e },
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

      if (!matchRecords || matchRecords.length === 0) {
        console.log(`No matches found in database for puuid: ${puuid}`);
        return {
          foundMatches: [],
          missingMatchIds: matchIdArray,
          totalRequested: matchIdArray.length,
          foundCount: 0,
        };
      }

      const foundMatchIds = matchRecords.map((m) => m.matchId);

      if (foundMatchIds.length === 0) {
        console.warn("Match records found but no valid matchIds extracted");
        return {
          foundMatches: [],
          missingMatchIds: matchIdArray,
          totalRequested: matchIdArray.length,
          foundCount: 0,
        };
      }

      console.log(`Found ${foundMatchIds.length} base matches in database`);

      try {
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

        // Step 7: Validate related data was fetched
        console.log(
          `Related data fetched - Details: ${
            details?.length || 0
          }, Participants: ${participants?.length || 0}, Teams: ${
            teams?.length || 0
          }`
        );

        // Step 8: Structure and validate the complete match data
        const completeMatches = foundMatchIds.map((matchId) => {
          const matchDetail = details?.find((d) => d?.matchId === matchId);
          const matchParticipantsList =
            participants?.filter((p) => p?.matchId === matchId) || [];
          const matchObjective = objectives?.find(
            (o) => o?.matchId === matchId
          );
          const matchTeamsList =
            teams?.filter((t) => t?.matchId === matchId) || [];
          const matchBansList =
            bans?.filter((b) => b?.matchId === matchId) || [];

          // Step 9: Validate essential match data exists
          const hasEssentialData =
            matchDetail &&
            matchParticipantsList.length > 0 &&
            matchTeamsList.length > 0;

          if (!hasEssentialData) {
            console.warn(
              `Incomplete data for match ${matchId}: detail=${!!matchDetail}, participants=${
                matchParticipantsList.length
              }, teams=${matchTeamsList.length}`
            );
          }

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
            isComplete: hasEssentialData,
          };
        });

        // Step 10: Filter out incomplete matches and determine missing ones
        const validCompleteMatches = completeMatches.filter(
          (match) => match.isComplete
        );
        const validMatchIds = validCompleteMatches
          .map((m) => m.info?.gameId)
          .filter(Boolean) as string[];

        const missingMatchIds = matchIdArray.filter(
          (id) => !validMatchIds.includes(id)
        );

        console.log(
          `Returning ${validCompleteMatches.length} complete matches, ${missingMatchIds.length} missing/incomplete`
        );

        return {
          foundMatches: validCompleteMatches.map(
            ({ isComplete, ...match }) => match
          ),
          missingMatchIds,
          totalRequested: matchIdArray.length,
          foundCount: validCompleteMatches.length,
        };
      } catch (relatedDataError) {
        console.error("Error fetching related match data:", relatedDataError);
        // Fallback - return matches without complete related data
        return {
          foundMatches: [],
          missingMatchIds: matchIdArray,
          totalRequested: matchIdArray.length,
          foundCount: 0,
          error: "Failed to fetch complete match data",
        };
      }
    });

    // Step 11: Final validation of transaction result
    if (!matchData) {
      console.error("Database transaction returned null/undefined");
      return NextResponse.json(
        { error: "Database transaction failed" },
        { status: 500 }
      );
    }

    const { foundMatches, missingMatchIds, totalRequested, foundCount } =
      matchData;

    // Step 12: Log final results for debugging
    console.log(
      `Final results: Found ${foundCount}/${totalRequested} matches, ${missingMatchIds.length} missing`
    );

    // Step 13: Validate response structure before sending
    if (!Array.isArray(foundMatches) || !Array.isArray(missingMatchIds)) {
      console.error("Invalid response structure from database transaction");
      return NextResponse.json(
        { error: "Invalid data structure returned" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      foundMatches,
      missingMatchIds,
      stats: {
        totalRequested,
        foundInDb: foundCount,
        needToFetch: missingMatchIds.length,
        completionRate:
          totalRequested > 0
            ? ((foundCount / totalRequested) * 100).toFixed(1) + "%"
            : "0%",
      },
    });
  } catch (error) {
    console.error("Error checking matches:", error);

    // Step 14: Enhanced error handling with more specific error types
    if (error instanceof Error) {
      if (error.message.includes("connection")) {
        return NextResponse.json(
          { error: "Database connection failed" },
          { status: 503 }
        );
      }
      if (error.message.includes("timeout")) {
        return NextResponse.json(
          { error: "Database query timeout" },
          { status: 504 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}
