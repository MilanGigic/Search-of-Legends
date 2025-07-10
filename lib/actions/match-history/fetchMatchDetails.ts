import { fetchWithRateLimit } from "@/lib/riot";
import insertMatchData from "../insertMatchData";

const RIOT_API_KEY = process.env.RIOT_API_KEY;
if (!RIOT_API_KEY) {
  throw new Error("Riot API key is not set");
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const fetchMatchDetails = async (matchId: string, REGION: string) => {
  const url = `https://${REGION}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetchWithRateLimit(url, {
        headers: { "X-Riot-Token": RIOT_API_KEY },
      });

      if (res.status === 429) {
        const retryAfter = Number(res.headers.get("Retry-After")) || 1;
        console.warn(
          `⚠️ Rate limited on ${matchId}. Retrying in ${retryAfter}s...`
        );
        await delay(retryAfter * 1000);
        continue;
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Fetch failed [${res.status}]: ${errorText}`);
      }

      const matchData: RiotMatchDto = await res.json();
      return matchData;
    } catch (error) {
      console.error(
        `❌ Attempt ${attempt} failed for match ${matchId}:`,
        error
      );
      if (attempt < MAX_RETRIES) {
        await delay(RETRY_DELAY * attempt); // exponential backoff
      } else {
        throw new Error(
          `Failed to fetch match ${matchId} after ${MAX_RETRIES} attempts`
        );
      }
    }
  }

  throw new Error(`Unreachable retry error on ${matchId}`);
};

export const fetchMatchDetailsInBatch = async (
  matchIds: string[],
  REGION: string,
  puuid: string
) => {
  const matches = await fetchMatchDetailsInSmallBatch(matchIds, REGION, puuid);
  return matches;
};

// New function optimized for progressive loading
export const fetchMatchDetailsInSmallBatch = async (
  matchIds: string[],
  REGION: string,
  puuid: string
) => {
  if (matchIds.length === 0) return [];

  console.log(`📦 Fetching ${matchIds.length} matches in region ${REGION}`);

  const allMatchData: RiotMatchDto[] = [];
  const MAX_CONCURRENT = 5;

  for (let i = 0; i < matchIds.length; i += MAX_CONCURRENT) {
    const batch = matchIds.slice(i, i + MAX_CONCURRENT);
    console.log(`🔄 Batch ${i / MAX_CONCURRENT + 1}: ${batch.length} matches`);

    const batchResults = await Promise.allSettled(
      batch.map(async (matchId, index) => {
        try {
          await delay(100 * index); // Slight stagger to avoid burst
          const matchData = await fetchMatchDetails(matchId, REGION);
          await insertMatchData(matchData, puuid);
          return matchData;
        } catch (err) {
          console.error(`❌ Failed match ${matchId}:`, err);
          return null;
        }
      })
    );

    batchResults.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value) {
        allMatchData.push(result.value);
      } else {
        console.warn(`❌ Could not process match ${batch[index]}`);
      }
    });

    if (i + MAX_CONCURRENT < matchIds.length) {
      console.log(`⏳ Waiting 1.2 seconds before next batch...`);
      await delay(1200);
    }
  }

  console.log(
    `✅ Finished: ${allMatchData.length}/${matchIds.length} matches processed successfully.`
  );
  return allMatchData;
};
