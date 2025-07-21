import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const matchId = searchParams.get("matchId");
  const region = searchParams.get("region");

  const RIOT_API_KEY = process.env.RIOT_API_KEY;

  if (!RIOT_API_KEY) {
    console.error("Riot API Key not found");
    return;
  }

  try {
    const url = `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchId}/timeline?api_key=${RIOT_API_KEY}`;
    const res = await fetch(url);

    if (!res.ok) {
      console.error(
        `Fetching match event details failed at route: ${res.statusText} Status: ${res.status}`
      );
      return;
    }

    const data: MatchTimelineDto = await res.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
