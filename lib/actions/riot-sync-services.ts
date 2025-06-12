// lib/riot-sync-service.ts
import { db } from "@/db"; // Your Drizzle DB connection
import { accounts, matches } from "@/db/schema/index"; // Adjust this based on your actual schema
import {
  fetchMatchIdsByPuuid,
  fetchMatchDetails,
} from "@/lib/actions/riot-api";
import { createRiotRateLimiter } from "@/lib/actions/rateLimiter";
import insertMatchData from "./insertMatchData";

const rateLimit = createRiotRateLimiter();

export async function syncAllPlayersMatches() {
  const allPlayers = await db.select().from(accounts); // Get all puuids

  for (const player of allPlayers) {
    const { puuid, region } = player;

    const matchIds = await fetchMatchIdsByPuuid(puuid, region);

    for (const matchId of matchIds) {
      const exists = await db.query.matches.findFirst({
        where: (m, { eq }) => eq(m.matchId, matchId),
      });

      if (!exists) {
        await rateLimit(); // 🛑 Wait before each fetch
        const matchData: RiotMatchDto = await fetchMatchDetails(
          matchId,
          region
        );

        await insertMatchData(matchData, puuid);

        console.log(`Stored match ${matchId}`);
      }
    }
  }
}
