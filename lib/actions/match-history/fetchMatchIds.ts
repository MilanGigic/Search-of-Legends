import { db } from "@/db";
import getRegionalEndpoint from "./getRegionalEndpoint";
import { eq } from "drizzle-orm";
import { matches } from "@/db/schema";

export default async function fetchAllMatchIds(
  puuid: string,
  region: string
): Promise<string[]> {
  console.log(`Fetching existing matches for puuid: ${puuid}`);

  // 1. First get all matches from database
  const existingMatches = await db.query.matches.findMany({
    where: eq(matches.puuid, puuid),
  });
  const existingMatchIds = new Set(
    existingMatches.map((match) => match.matchId)
  );
  console.log(`Found ${existingMatchIds.size} existing match IDs`);

  // 2. Then fetch from Riot API to find any new matches
  const RIOT_API_KEY = process.env.RIOT_API_KEY;
  if (!RIOT_API_KEY) throw new Error("Riot API key is not set");

  const REGION = getRegionalEndpoint(region);
  console.log(`Using region endpoint: ${REGION}`);

  const allMatchIds = new Set<string>([...existingMatchIds]);
  let start = 0;
  const count = 100;
  let hasNewMatches = false;

  while (true) {
    console.log(`Fetching matches from API: start=${start}, count=${count}`);
    const res = await fetch(
      `https://${REGION}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );

    if (!res.ok) {
      console.error("Failed to fetch match IDs:", await res.text());
      throw new Error("Failed to fetch match IDs");
    }

    const batch: string[] = await res.json();
    console.log(`Fetched ${batch.length} match IDs from API`);

    // Check if any matches are new (not in database)
    for (const matchId of batch) {
      if (!existingMatchIds.has(matchId)) {
        hasNewMatches = true;
      }
      allMatchIds.add(matchId);
    }

    // Stop if we've reached the end or if we're not getting new matches
    if (batch.length < count || !hasNewMatches) {
      console.log("Stopping fetch - no more matches or no new matches");
      break;
    }

    start += count;
  }

  console.log(`Total unique match IDs: ${allMatchIds.size}`);
  return Array.from(allMatchIds);
}
