"use server";
import { db } from "@/db";
import { topFivePerRegion } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function fetchTopFivePerRegion(selectedRegion: string) {
  return await db
    .select()
    .from(topFivePerRegion)
    .where(eq(topFivePerRegion.region, selectedRegion))
    .limit(5);
}

// import { db } from "@/db";
// import { topFivePerRegion } from "@/db/schema";
// import { eq } from "drizzle-orm";
// import { fetchAccount } from "./fetchAccount";
// import "dotenv";

// interface ExtractedAccountInfo {
//   puuid: string;
//   gameName: string;
//   tagLine: string;
//   region: string;
//   summonerLevel?: number;
//   profileIconId?: number;
//   revisionDate?: number;
// }

// export async function fetchTopFivePerRegion(selectedRegion: string) {
//   try {
//     const data = await db
//       .select()
//       .from(topFivePerRegion)
//       .where(eq(topFivePerRegion.region, selectedRegion))
//       .limit(5);

//     if (data.length > 0) {
//       return data;
//     } else {
//       console.log("selectedRegion:", selectedRegion);
//       console.log(
//         `https://${selectedRegion}.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5`,
//       );
//       const res = await fetch(
//         `https://${selectedRegion}.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5?api_key=${process.env.RIOT_API_KEY}`,
//       );

//       if (!res.ok) {
//         throw new Error(
//           `Failed to fetch top five players for ${selectedRegion}`,
//         );
//       }

//       const leaderboardData = await res.json();

//       const topFiveEntries: LeagueEntry[] = leaderboardData.entries.slice(0, 5);

//       const topFiveAccounts = await Promise.all(
//         topFiveEntries.map(async (entry) => {
//           const accountInfo = (await fetchAccount(
//             entry.puuid,
//             selectedRegion,
//           )) as ExtractedAccountInfo;

//           return {
//             gameName: accountInfo.gameName,
//             tagLine: accountInfo.tagLine,
//             leaguePoints: entry.leaguePoints,
//             losses: entry.losses,
//             wins: entry.wins,
//             puuid: accountInfo.puuid,
//             rank: entry.rank,
//             region: selectedRegion,
//             profileIconId: accountInfo.profileIconId,
//             summonerLevel: accountInfo.summonerLevel,
//           };
//         }),
//       );

//       await Promise.all(
//         topFiveAccounts.map(async (account) => {
//           return await db.insert(topFivePerRegion).values({
//             gameName: account.gameName,
//             tagLine: account.tagLine,
//             leaguePoints: account.leaguePoints,
//             losses: account.losses,
//             wins: account.wins,
//             puuid: account.puuid,
//             rank: account.rank,
//             region: selectedRegion,
//             profileIconId: account.profileIconId!,
//             summonerLevel: account.summonerLevel!,
//           });
//         }),
//       );

//       return topFiveAccounts;
//     }
//   } catch (error) {
//     console.error("fetchTopFivePerRegion error:", error);
//     throw error;
//   }
// }
