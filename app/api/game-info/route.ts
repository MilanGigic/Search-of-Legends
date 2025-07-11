import { db } from "@/db";
import {
  matchBans,
  matchDetails,
  matchObjectives,
  matchParticipants,
  matchTeams,
  perks,
  perkStats,
  perkStyles,
  perkStyleSelections,
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
    existingPerkStats,
    existingPerkStyleSelections,
    existingPerkStyles,
    existingPerks,
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
    db.query.perkStats.findMany({
      where: eq(perkStats.matchId, gameId),
    }),
    db.query.perkStyleSelections.findMany({
      where: eq(perkStyleSelections.matchId, gameId),
    }),
    db.query.perkStyles.findMany({
      where: eq(perkStyles.matchId, gameId),
    }),
    db.query.perks.findMany({
      where: eq(perks.matchId, gameId),
    }),
  ]);

  if (
    existingGameInfo &&
    existingGameParticipants.length > 0 &&
    existingGameObjectives.length > 0 &&
    existingGameTeams.length > 0 &&
    existingGameBans.length > 0 &&
    existingPerkStats.length > 0 &&
    existingPerkStyleSelections.length > 0 &&
    existingPerkStyles.length > 0 &&
    existingPerks.length > 0
  ) {
    console.log("Raw gameCreation from DB:", existingGameInfo.gameCreation);
    console.log("Type of gameCreation:", typeof existingGameInfo.gameCreation);
    console.log(
      "Instance of Date:",
      existingGameInfo.gameCreation instanceof Date
    );
    try {
      const gameCreationDate =
        existingGameInfo.gameCreation instanceof Date
          ? existingGameInfo.gameCreation
          : new Date(existingGameInfo.gameCreation);
      const completeGameInfo: DbGameInfo = {
        info: {
          ...existingGameInfo,
          gameCreation: gameCreationDate, // Convert to Date object
        },
        participants: existingGameParticipants,
        objectives: existingGameObjectives,
        teams: existingGameTeams,
        bans: existingGameBans,
        perkStats: existingPerkStats,
        perkStyleSelections: existingPerkStyleSelections,
        perkStyles: existingPerkStyles,
        perks: existingPerks,
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
      newPerkStats,
      newPerkStyleSelections,
      newPerkStyles,
      newPerks,
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
      db.query.perkStats.findMany({
        where: eq(perkStats.matchId, gameId),
      }),
      db.query.perkStyleSelections.findMany({
        where: eq(perkStyleSelections.matchId, gameId),
      }),
      db.query.perkStyles.findMany({
        where: eq(perkStyles.matchId, gameId),
      }),
      db.query.perks.findMany({
        where: eq(perks.matchId, gameId),
      }),
    ]);

    const gameCreationDate =
      newGameInfo?.gameCreation instanceof Date
        ? newGameInfo.gameCreation
        : new Date(newGameInfo!.gameCreation);
    const transformedData: DbGameInfo = {
      info: {
        ...newGameInfo!,
        gameCreation: gameCreationDate,
      },
      participants: newGameParticipants,
      objectives: newGameObjectives,
      teams: newGameTeams,
      bans: newGameBans,
      perkStats: newPerkStats,
      perkStyleSelections: newPerkStyleSelections,
      perkStyles: newPerkStyles,
      perks: newPerks,
    };

    transformedData.participants.map(async (participant) => {
      await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/account?gameName=${participant.riotIdGameName}&tagLine=${participant.riotIdTagline}`
      );
    });

    return NextResponse.json(transformedData, { status: 200 });
  } catch (error) {
    console.error(`Failed to fetch game info for gameId: ${gameId}`, error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
