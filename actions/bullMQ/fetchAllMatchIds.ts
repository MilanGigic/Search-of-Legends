import { db } from "@/db";
import { eq } from "drizzle-orm";
import { matchParticipants } from "@/db/schema";
import { fetchWithRateLimit } from "@/lib/riot";

export default async function fetchAllMatchIds(
  puuid: string,
): Promise<string[]> {
  console.log(`Fetching existing matches for puuid: ${puuid}`);

  const existingMatches = await db.query.matchParticipants.findMany({
    where: eq(matchParticipants.puuid, puuid),
    columns: { matchId: true },
  });
  const existingMatchIds = new Set(
    existingMatches.map((match) => match.matchId),
  );
  console.log(`Found ${existingMatchIds.size} existing match IDs`);

  const RIOT_API_KEY = process.env.RIOT_API_KEY;
  if (!RIOT_API_KEY) throw new Error("Riot API key is not set");

  const newMatchIds: string[] = [];
  let start = 0;
  const count = 100;

  outer: while (true) {
    console.log(`Fetching matches from API: start=${start}, count=${count}`);
    const res = await fetchWithRateLimit(
      `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } },
    );

    if (!res.ok) {
      console.error("Failed to fetch match IDs:", await res.text());
      throw new Error("Failed to fetch match IDs");
    }

    const batch: string[] = await res.json();
    console.log(`Fetched ${batch.length} match IDs from API`);

    for (const matchId of batch) {
      if (existingMatchIds.has(matchId)) {
        console.log(`Hit known match ${matchId}, stopping pagination early`);
        break outer;
      }
      newMatchIds.push(matchId);
    }

    if (batch.length < count) {
      console.log("Reached end of match history");
      break;
    }

    start += count;
  }

  console.log(`Found ${newMatchIds.length} new match IDs`);
  return newMatchIds;
}
