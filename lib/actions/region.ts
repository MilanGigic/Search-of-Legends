interface RegionData {
  puuid: string;
  game: string;
  region: string;
}

export default async function fetchSummonerFromAnyRegion(puuid: string) {
  console.log("Trying to fetch summoner from multiple regions...");

  const API_KEY = process.env.RIOT_API_KEY;

  // Try regions in batches - most common first
  // const regionBatches = [
  //   ["euw1", "na1", "eun1"], // Most common regions first
  //   ["kr", "br1", "la1"], // Medium popularity
  //   ["la2", "oc1", "ru", "tr1", "jp1"], // Less common
  // ];

  // for (const batch of regionBatches) {
  //   const batchPromises = batch.map(async (region) => {
  //     const url = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${API_KEY}`;

  //     try {
  //       const response = await fetch(url);
  //       if (response.ok) {
  //         const data: SummonerInfo = await response.json();
  //         console.log(`✅ Found summoner in region: ${region}`);
  //         return { region, data };
  //       }
  //       return null;
  //     } catch (error) {
  //       return null;
  //     }
  //   });

  //   // Wait for first successful response in this batch
  //   const results = await Promise.allSettled(batchPromises);

  //   for (const result of results) {
  //     if (result.status === "fulfilled" && result.value) {
  //       return result.value;
  //     }
  //   }
  // }

  try {
    const url = `https://europe.api.riotgames.com/riot/account/v1/region/by-game/lol/by-puuid/${puuid}?api_key=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        `Failed to fetch region for PUUID ${puuid}:, ${response.statusText}`
      );
    }

    const regionData: RegionData = await response.json();
    console.log(`✅ Found region for PUUID ${puuid}: ${regionData.region}`);

    const summonerUrl = `https://${regionData.region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${API_KEY}`;

    if (regionData) {
      try {
        const summonerResponse = await fetch(summonerUrl);

        if (!summonerResponse.ok) {
          console.error(
            `fetching summoner data for PUUID ${puuid} gone wrong: ${summonerResponse.status} ${summonerResponse.statusText}`
          );
        }

        const summonerData: SummonerInfo = await summonerResponse.json();

        console.log(
          `✅ Found summoner data for PUUID ${puuid} in region ${regionData.region}`
        );

        return {
          region: regionData.region,
          data: summonerData,
        };
      } catch (error) {
        console.error(`Fetching summoner data failed: ${error}`);
        return null;
      }
    }
  } catch (error) {
    console.error(`Fetching region data for PUUID ${puuid} failed: ${error}`);
    return null;
  }
}
