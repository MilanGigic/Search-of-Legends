// import getRegionalEndpoint from "./getRegionalEndpoint";

// async function fetchMatchesConcurrently(
//   matchIds: string[],
//   region: string,
//   apiKey: string,
//   maxConcurrent = 5
// ): Promise<RiotMatch[]> {
//   const results: RiotMatch[] = [];
//   const baseUrl = getRegionalEndpoint(region);

//   // Process matches in batches to respect rate limits
//   for (let i = 0; i < matchIds.length; i += maxConcurrent) {
//     const batch = matchIds.slice(i, i + maxConcurrent);

//     const promises = batch.map(async (matchId) => {
//       try {
//         const url = `${baseUrl}/lol/match/v5/matches/${matchId}?api_key=${apiKey}`;
//         const response = await fetch(url);

//         if (!response.ok) {
//           console.warn(`Failed to fetch match ${matchId}: ${response.status}`);
//           return null;
//         }

//         return (await response.json()) as RiotMatch;
//       } catch (error) {
//         console.error(`Error fetching match ${matchId}:`, error);
//         return null;
//       }
//     });

//     const batchResults = await Promise.all(promises);
//     results.push(...(batchResults.filter(Boolean) as RiotMatch[]));

//     // Add delay between batches to respect rate limits
//     if (i + maxConcurrent < matchIds.length) {
//       await new Promise((resolve) => setTimeout(resolve, 1200)); // 1.2s delay
//     }
//   }

//   return results;
// }

// export default fetchMatchesConcurrently;
