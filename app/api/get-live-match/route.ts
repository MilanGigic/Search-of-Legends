import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const puuid = searchParams.get("puuid");
  const region = searchParams.get("region");

  const API_KEY = process.env.RIOT_API_KEY;

  if (!API_KEY) {
    return new Response("Riot API key is not set", { status: 500 });
  }

  if (!region || !puuid) {
    return new Response("Missing puuid or region", { status: 400 });
  }

  try {
    const response = await fetch(
      `https://${region}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${puuid}`,
      {
        headers: {
          "X-Riot-Token": API_KEY,
        },
      },
    );

    if (response.status === 404) {
      return NextResponse.json({ error: "Not in game" }, { status: 404 });
    }

    if (!response.ok) {
      const text = await response.text();
      console.error("Riot error:", response.status, text);
      return NextResponse.json(
        { error: "Failed to fetch live match data" },
        { status: response.status },
      );
    }
    const data: CurrentGameInfo = await response.json();

    if (!data) {
      return new Response("No live match data found", { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching live match data:", error);
    return new Response("Error fetching live match data", { status: 500 });
  }
}
