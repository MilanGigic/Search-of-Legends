import "dotenv";

export async function GET({ params }: { params: { puuid: string } }) {
  const { puuid } = params;
  console.log("[Number of Matches API] Received request for puuid:", puuid);

  const API_KEY = process.env.RIOT_API_KEY;

  if (!API_KEY) {
    console.error("[Number of Matches API] No API KEY provided");
    throw new Error("No API KEY provided");
  }

  const apiUrl = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=100&api_key=${API_KEY}`;
  console.log("[Number of Matches API] Fetching from Riot API at URL:", apiUrl);

  const res = await fetch(apiUrl);

  if (!res.ok) {
    console.error(
      "[Number of Matches API] Failed to fetch matches. Status:",
      res.status,
      "StatusText:",
      res.statusText,
    );
  }

  const data = await res.json();
  console.log(
    "[Number of Matches API] Successfully fetched match data. Number of matches:",
    Array.isArray(data) ? data.length : "unknown",
  );

  return new Response(JSON.stringify(data), { status: 200 });
}
