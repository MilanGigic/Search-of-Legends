import { db } from "@/db";
import getRegionalEndpoint from "./getRegionalEndpoint";
import { eq } from "drizzle-orm";
import { matches, matchParticipants } from "@/db/schema";

export default async function fetchAllMatchIds(
  puuid: string,
  region: string,
  page?: string,
): Promise<string[]> {
  const pageNum = page ? Number(page) : 1;

  // 1. First get all matches from database
  const existingMatches = await db
    .select({
      matchId: matches.matchId,
    })
    .from(matches)
    .innerJoin(
      matchParticipants,
      eq(matchParticipants.matchId, matches.matchId),
    )
    .where(eq(matchParticipants.puuid, puuid));

  const existingMatchIds = new Set(
    existingMatches.map((match) => match.matchId),
  );

  // 2. Then fetch from Riot API to find any new matches
  const RIOT_API_KEY = process.env.RIOT_API_KEY;
  if (!RIOT_API_KEY) throw new Error("Riot API key is not set");

  const REGION = getRegionalEndpoint(region);

  const allMatchIds = new Set<string>([...existingMatchIds]);
  const count = 100;
  let hasNewMatches = false;

  const startIndex = (pageNum - 1) * count;
  const url = `https://${REGION}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${startIndex}&count=${count}`;

  const res = await fetch(url, { headers: { "X-Riot-Token": RIOT_API_KEY } });

  if (!res.ok) {
    throw new Error("Failed to fetch match IDs");
  }

  const batch: string[] = await res.json();

  // Check if any matches are new (not in database)
  for (const matchId of batch) {
    if (!existingMatchIds.has(matchId)) {
      hasNewMatches = true;
    }
    allMatchIds.add(matchId);
  }

  return Array.from(allMatchIds);
}
