// import { db } from "@/db";
// import { matches } from "@/db/schema";

// async function storeMatchesInDatabase(
//   matchDetails: RiotMatch[]
// ): Promise<void> {
//   if (matchDetails.length === 0) return;

//   await db.transaction(async (tx) => {
//     for (const match of matchDetails) {
//       // Insert match
//       await tx
//         .insert(matches)
//         .values({
//           matchId: match.metadata.matchId,
//           gameCreation: new Date(match.info.gameCreation),
//           gameDuration: match.info.gameDuration,
//           gameMode: match.info.gameMode,
//           gameType: match.info.gameType,
//           queueId: match.info.queueId,
//           // Add other match fields as needed
//         })
//         .onConflictDoNothing();

//       // Insert participants
//       const participantData = match.info.participants.map((participant) => ({
//         matchId: match.metadata.matchId,
//         puuid: participant.puuid,
//         championId: participant.championId,
//         championName: participant.championName,
//         kills: participant.kills,
//         deaths: participant.deaths,
//         assists: participant.assists,
//         // Add other participant fields as needed
//       }));

//       await tx
//         .insert(matchParticipants)
//         .values(participantData)
//         .onConflictDoNothing();
//     }
//   });
// }

// export default storeMatchesInDatabase;
