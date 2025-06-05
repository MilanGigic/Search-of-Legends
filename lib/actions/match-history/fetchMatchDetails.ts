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

  return await res.json();
};

export const fetchMatchDetailsInBatch = async (
  matchIds: string[],
  REGION: string,
  puuid: string
) => {
  const BATCH_SIZE = 20;
  const TWO_MINUTE_LIMIT = 100;
  const totalRequests = matchIds.length;

  let fetchedCount = 0;
  let matchData;

  console.log(
    `Starting batch fetch for ${totalRequests} matches in region ${REGION}`
  );

  for (let i = 0; i < matchIds.length; i += BATCH_SIZE) {
    const batch = matchIds.slice(i, i + BATCH_SIZE);
    console.log(
      `Fetching batch: ${i / BATCH_SIZE + 1}, matches ${i + 1}-${
        i + batch.length
      }`
    );

    await Promise.allSettled(
      batch.map(async (matchId) => {
        try {
          console.log(`Fetching match ${matchId}...`);
          matchData = await fetchMatchDetails(matchId, REGION);
          console.log(`Fetched match ${matchId}, inserting data...`);
          await insertMatchData(matchData, puuid);
          console.log(`Inserted data for match ${matchId}`);
        } catch (err) {
          console.error(`Failed match ${matchId}:`, err);
        }
      })
    );

    fetchedCount += batch.length;
    console.log(`Fetched ${fetchedCount}/${totalRequests} matches so far.`);

    if (fetchedCount % TWO_MINUTE_LIMIT === 0) {
      console.log("Hit 2-minute limit, waiting 2 minutes...");
      await delay(120_000);
    } else {
      console.log("Waiting 1.1 seconds before next batch...");
      await delay(1100); // wait 1.1 seconds to stay under 20/sec
    }
  }
  console.log("Finished batch fetching all matches.");
  return matchData;
};
