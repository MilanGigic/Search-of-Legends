import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { puuid: string } }
) {
  const { puuid } = params;
  const API_KEY = process.env.RIOT_API_KEY;

  if (!API_KEY) {
    throw new Error("No API KEY provided");
  }

  // https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/omgN_Flcq4tyNFd_yb49UjoKS8MF1feqpaZAmgwp0RJjBzwPooBZ3x6rTKBmisA4jwVqbIzcQV-ewg/ids?start=0&count=100&api_key=RGAPI-d226fbb2-17d0-4e6a-992d-52f2086dcfb6
  const res = await fetch(
    `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=100&api_key=${API_KEY}`
  );

  const data = res.json();



  return new Response(JSON.stringify(data), { status: 200 });
}
