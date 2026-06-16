import { db } from "@/db";
import { accounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import getRegionalEndpoint from "./match-history/getRegionalEndpoint";

export default async function getGameInfo(
  matchId: string,
  puuid: string
): Promise<RiotMatchDto | null> {
  const account = await db.query.accounts.findFirst({
    where: eq(accounts.puuid, puuid),
  });

  if (!account) {
    console.error(`No account found for puuid: ${puuid}`);
    return null;
  }

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const region = getRegionalEndpoint(account.region);
  const url = `${BASE_URL}/api/riot/game-info?currRegion=${region}&gameId=${matchId}&puuid=${puuid}`;
  try {

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Failed to fetch game info for gameId: ${matchId}. Status: ${response.status}, Error: ${errorText}`
      );

      // Log different error types
      if (response.status === 404) {
        console.warn(`Match not found: ${matchId}`);
      } else if (response.status === 429) {
        console.warn(`Rate limit exceeded for match: ${matchId}`);
      } else if (response.status >= 500) {
        console.error(`Server error for match: ${matchId}`);
      }

      return null;
    }

    const data: RiotMatchDto = await response.json();

    // Validate the response data structure
    if (!data || !data.info || !data.metadata) {
      console.error(
        `Invalid data structure received for gameId: ${matchId}`,
        data
      );
      return null;
    }


    return data;
  } catch (error) {
    console.error(`Failed to fetch game info for gameId: ${matchId}`, error);
    return null;
  }
}
