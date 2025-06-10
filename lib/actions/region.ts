const REGIONS = [
  "euw1", // Europe West (most common)
  "na1", // North America
  "eun1", // Europe Nordic & East
  "kr", // Korea
  "br1", // Brazil
  "la1", // Latin America North
  "la2", // Latin America South
  "oc1", // Oceania
  "ru", // Russia
  "tr1", // Turkey
  "jp1", // Japan
];

export default async function fetchSummonerFromAnyRegion(puuid: string) {
  console.log("Trying to fetch summoner from multiple regions...");

  const API_KEY = process.env.RIOT_API_KEY;

  // Try regions in batches - most common first
  const regionBatches = [
    ["euw1", "na1", "eun1"], // Most common regions first
    ["kr", "br1", "la1"], // Medium popularity
    ["la2", "oc1", "ru", "tr1", "jp1"], // Less common
  ];

  for (const batch of regionBatches) {
    const batchPromises = batch.map(async (region) => {
      const url = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${API_KEY}`;

      try {
        const response = await fetch(url);
        if (response.ok) {
          const data: SummonerInfo = await response.json();
          console.log(`✅ Found summoner in region: ${region}`);
          return { region, data };
        }
        return null;
      } catch (error) {
        return null;
      }
    });

    // Wait for first successful response in this batch
    const results = await Promise.allSettled(batchPromises);

    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        return result.value;
      }
    }
  }

  throw new Error("Summoner not found in any region");
}
