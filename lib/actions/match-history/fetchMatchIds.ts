import { db } from "@/db";
import getRegionalEndpoint from "./getRegionalEndpoint";
import { eq } from "drizzle-orm";
import { matches } from "@/db/schema";

export default async function fetchAllMatchIds(
  puuid: string,
  region: string
): Promise<string[]> {
  const allMatchIds: string[] = [];
  let start = 0;
  const count = 100;

  console.log(`Fetching existing matches for puuid: ${puuid}`);
  const existingMatch = await db.query.matches.findMany({
    where: eq(matches.puuid, puuid),
  });

  const existingMatchIds = existingMatch.map((id) => {
    return id.matchId;
  });
  console.log(`Found ${existingMatchIds.length} existing match IDs`);

  const RIOT_API_KEY = process.env.RIOT_API_KEY;
  if (!RIOT_API_KEY) {
    throw new Error("Riot API key is not set");
  }

  const REGION = getRegionalEndpoint(region);
  console.log(`Using region endpoint: ${REGION}`);

  while (true) {
    console.log(`Fetching matches from API: start=${start}, count=${count}`);
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
    console.log(`Fetched ${batch.length} match IDs from API`);

    if (batch.length > existingMatchIds.length) {
      console.log("Adding new batch of match IDs to allMatchIds");
      allMatchIds.push(...batch);
    } else {
      console.log("Adding existing match IDs to allMatchIds");
      allMatchIds.push(...existingMatchIds);
    }

    if (batch.length < count) {
      console.log("No more data to fetch, breaking loop");
      break; // No more data
    }
    start += count;
  }

  console.log(`Returning total of ${allMatchIds.length} match IDs`);
  return allMatchIds;
}
