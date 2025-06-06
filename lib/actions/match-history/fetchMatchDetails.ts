import insertMatchData from "../insertMatchData";

const RIOT_API_KEY = process.env.RIOT_API_KEY;
if (!RIOT_API_KEY) {
  throw new Error("Riot API key is not set");
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const fetchMatchDetails = async (matchId: string, REGION: string) => {
  const res = await fetch(
    `https://${REGION}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
    {
      headers: { "X-Riot-Token": RIOT_API_KEY },
    }
  );

  if (!res.ok) {
    console.error(`Error fetching match ${matchId}:`, await res.text());
    throw new Error(`Failed to fetch match ${matchId}`);
  }

  const matchData: RiotMatchDto = await res.json();

  return matchData;
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
  if (matchIds.length === 0) {
    return [];
  }

  console.log(`Fetching ${matchIds.length} matches in region ${REGION}`);

  const allMatchData: any[] = [];
  const MAX_CONCURRENT = 5; // Limit concurrent requests to avoid rate limits

  // Process matches in smaller concurrent batches
  for (let i = 0; i < matchIds.length; i += MAX_CONCURRENT) {
    const batch = matchIds.slice(i, i + MAX_CONCURRENT);
    console.log(`Processing batch: matches ${i + 1}-${i + batch.length}`);

    const batchResults = await Promise.allSettled(
      batch.map(async (matchId) => {
        try {
          console.log(`Fetching match ${matchId}...`);
          const matchData = await fetchMatchDetails(matchId, REGION);
          console.log(`Fetched match ${matchId}, inserting data...`);
          await insertMatchData(matchData, puuid);
          console.log(`Inserted data for match ${matchId}`);
          return matchData;
        } catch (err) {
          console.error(`Failed match ${matchId}:`, err);
          throw err;
        }
      })
    );

    // Collect successful results
    batchResults.forEach((result, index) => {
      if (result.status === "fulfilled") {
        allMatchData.push(result.value);
      } else {
        console.error(
          `Failed to process match ${batch[index]}:`,
          result.reason
        );
      }
    });

    // Rate limiting delay between batches
    if (i + MAX_CONCURRENT < matchIds.length) {
      console.log(`Waiting 1.2 seconds before next batch...`);
      await delay(1200); // Slightly longer delay for safety
    }
  }

  console.log(
    `Finished fetching ${allMatchData.length}/${matchIds.length} matches successfully.`
  );
  return allMatchData;
};
