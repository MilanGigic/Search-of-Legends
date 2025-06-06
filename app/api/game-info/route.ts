import insertMatchData from "@/lib/actions/insertMatchData";
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

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(`Failed to fetch game info for gameId: ${gameId}`, error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
