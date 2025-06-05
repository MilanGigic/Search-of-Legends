// import { db } from "@/db";
// import { matches, matchParticipants } from "@/db/schema";
// import { eq, and, inArray, desc } from "drizzle-orm";
// import buildMatchHistoryUrl from "./buildUrl";
// import fetchMatchesConcurrently from "./fetchMatchesConcurrently";
// import storeMatchesInDatabase from "./storeInDatabase";

// export async function fetchAndStoreMatchHistory({
//   puuid,
//   region,
//   count = 20,
//   start = 0,
//   queue,
// }: MatchHistoryParams) {
//   const API_KEY = process.env.RIOT_API_KEY!;

//   try {
//     // Step 1: Get match IDs
//     const matchIdsUrl = buildMatchHistoryUrl(
//       region,
//       puuid,
//       count,
//       start,
//       queue
//     );
//     console.log("Fetching match IDs:", matchIdsUrl);

//     const matchIdsResponse = await fetch(matchIdsUrl);
//     if (!matchIdsResponse.ok) throw new Error("Failed to fetch match IDs");

//     const matchIds: string[] = await matchIdsResponse.json();
//     console.log(`Found ${matchIds.length} match IDs`);

//     if (matchIds.length === 0) return { success: true, newMatches: 0 };

//     // Step 2: Check which matches we already have
//     const existingMatches = await db
//       .select({ matchId: matches.matchId })
//       .from(matches)
//       .where(inArray(matches.matchId, matchIds));

//     const existingMatchIds = new Set(existingMatches.map((m) => m.matchId));
//     const newMatchIds = matchIds.filter((id) => !existingMatchIds.has(id));

//     console.log(`${newMatchIds.length} new matches to fetch`);

//     if (newMatchIds.length === 0) {
//       return { success: true, newMatches: 0 };
//     }

//     // Step 3: Fetch match details with controlled concurrency
//     const matchDetails = await fetchMatchesConcurrently(
//       newMatchIds,
//       region,
//       API_KEY
//     );

//     // Step 4: Store in database using transaction
//     await storeMatchesInDatabase(matchDetails);

//     return {
//       success: true,
//       newMatches: matchDetails.length,
//       totalMatches: matchIds.length,
//     };
//   } catch (error) {
//     console.error("Error in fetchAndStoreMatchHistory:", error);
//     throw error;
//   }
// }
