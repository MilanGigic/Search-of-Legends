export default async function fetchAllMatchIds(
  puuid: string,
  REGION: string
): Promise<string[]> {
  const allMatchIds: string[] = [];
  let start = 0;
  const count = 100;

  const RIOT_API_KEY = process.env.RIOT_API_KEY;
  if (!RIOT_API_KEY) {
    throw new Error("Riot API key is not set");
  }

  while (true) {
    const res = await fetch(
      `https://${REGION}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`,
      {
        headers: { "X-Riot-Token": RIOT_API_KEY },
      }
    );

    if (!res.ok) {
      console.error("Failed to fetch match IDs:", await res.text());
      throw new Error("Failed to fetch match IDs");
    }

    const batch: string[] = await res.json();

    allMatchIds.push(...batch);
    if (batch.length < count) break; // No more data

    start += count;
  }

  return allMatchIds;
}
