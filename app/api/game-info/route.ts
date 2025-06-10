import { db } from "@/db";
import {
  matchBans,
  matchDetails,
  matchObjectives,
  matchParticipants,
  matchTeams,
} from "@/db/schema";
import insertMatchData from "@/lib/actions/insertMatchData";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gameId = searchParams.get("gameId");
  const REGION = searchParams.get("region");
  const puuid = searchParams.get("puuid");

  const API_KEY = process.env.RIOT_API_KEY;

  if (!API_KEY) {
    return new Response("Riot API key is not set", { status: 500 });
  }

  if (!gameId || !REGION || !puuid) {
    return new Response("Missing gameId or region", { status: 400 });
  }

  const [
    existingGameInfo,
    existingGameParticipants,
    existingGameObjectives,
    existingGameTeams,
    existingGameBans,
  ] = await Promise.all([
    db.query.matchDetails.findFirst({
      where: eq(matchDetails.matchId, gameId),
    }),
    db.query.matchParticipants.findMany({
      where: eq(matchParticipants.matchId, gameId),
    }),
    db.query.matchObjectives.findMany({
      where: eq(matchObjectives.matchId, gameId),
    }),
    db.query.matchTeams.findMany({
      where: eq(matchTeams.matchId, gameId),
    }),
    db.query.matchBans.findMany({
      where: eq(matchBans.matchId, gameId),
    }),
  ]);

  if (
    existingGameInfo &&
    existingGameParticipants.length > 0 &&
    existingGameObjectives.length > 0 &&
    existingGameTeams.length > 0 &&
    existingGameBans.length > 0
  ) {
    try {
      const completeGameInfo: DbGameInfo = {
        info: existingGameInfo,
        participants: existingGameParticipants,
        objectives: existingGameObjectives,
        teams: existingGameTeams,
        bans: existingGameBans,
      };

      console.log("Existing complete game info:", completeGameInfo);
      return NextResponse.json(completeGameInfo, { status: 200 });
    } catch (error) {
      console.error(
        `Failed to fetch game info from database for gameId: ${gameId}`,
        error
      );
      return NextResponse.json(
        { message: "Internal server error" },
        { status: 500 }
      );
    }
  }

  try {
    const url = `https://${REGION}.api.riotgames.com/lol/match/v5/matches/${gameId}?api_key=${API_KEY}`;

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(
        `Failed to fetch game info for gameId: ${gameId}. Status: ${res.status}, Error: ${errorText}`
      );
      return new Response(errorText, { status: res.status });
    }

    const data: RiotMatchDto = await res.json();

    await insertMatchData(data, puuid);

    const [
      newGameInfo,
      newGameParticipants,
      newGameObjectives,
      newGameTeams,
      newGameBans,
    ] = await Promise.all([
      db.query.matchDetails.findFirst({
        where: eq(matchDetails.matchId, gameId),
      }),
      db.query.matchParticipants.findMany({
        where: eq(matchParticipants.matchId, gameId),
      }),
      db.query.matchObjectives.findMany({
        where: eq(matchObjectives.matchId, gameId),
      }),
      db.query.matchTeams.findMany({
        where: eq(matchTeams.matchId, gameId),
      }),
      db.query.matchBans.findMany({
        where: eq(matchBans.matchId, gameId),
      }),
    ]);

    const transformedData: DbGameInfo = {
      info: newGameInfo!,
      participants: newGameParticipants,
      objectives: newGameObjectives,
      teams: newGameTeams,
      bans: newGameBans,
    };

    return NextResponse.json(transformedData, { status: 200 });
  } catch (error) {
    console.error(`Failed to fetch game info for gameId: ${gameId}`, error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
