import { db } from "@/db";
import getRegionalEndpoint from "./getRegionalEndpoint";
import { eq } from "drizzle-orm";
import { matches, matchParticipants } from "@/db/schema";
import { unstable_cache } from "next/cache";

const FIVE_MINUTES_SECONDS = 5 * 60;

async function fetchAllMatchIdsUncached(
  puuid: string,
  region: string,
  page?: string,
): Promise<string[]> {
  const pageNum = page ? Number(page) : 1;

  const existingMatches = await db
    .select({ matchId: matches.matchId })
    .from(matches)
    .innerJoin(
      matchParticipants,
      eq(matchParticipants.matchId, matches.matchId),
    )
    .where(eq(matchParticipants.puuid, puuid));

  const existingMatchIds = new Set(
    existingMatches.map((match) => match.matchId),
  );

  const RIOT_API_KEY = process.env.RIOT_API_KEY;
  if (!RIOT_API_KEY) throw new Error("Riot API key is not set");

  const REGION = getRegionalEndpoint(region);
  const allMatchIds = new Set<string>(existingMatchIds);

  const count = 100;
  const startIndex = (pageNum - 1) * count;
  const url = `https://${REGION}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${startIndex}&count=${count}`;

  const res = await fetch(url, {
    headers: { "X-Riot-Token": RIOT_API_KEY },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch match IDs");
  }

  const batch: string[] = await res.json();
  for (const matchId of batch) {
    allMatchIds.add(matchId);
  }

  return Array.from(allMatchIds);
}

const fetchAllMatchIds = unstable_cache(
  fetchAllMatchIdsUncached,
  ["fetch-all-match-ids"],
  { revalidate: FIVE_MINUTES_SECONDS },
);

export default fetchAllMatchIds;
