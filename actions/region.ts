interface RegionData {
  puuid: string;
  game: string;
  region: string;
}

export default async function fetchSummonerFromAnyRegion(puuid: string) {
  const API_KEY = process.env.RIOT_API_KEY;

  try {
    const url = `https://europe.api.riotgames.com/riot/account/v1/region/by-game/lol/by-puuid/${puuid}?api_key=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        `Failed to fetch region for PUUID ${puuid}:, ${response.statusText}`,
      );
    }

    const regionData: RegionData = await response.json();

    const summonerUrl = `https://${regionData.region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${API_KEY}`;

    if (regionData) {
      try {
        const summonerResponse = await fetch(summonerUrl);

        if (!summonerResponse.ok) {
          console.error(
            `fetching summoner data for PUUID ${puuid} gone wrong: ${summonerResponse.status} ${summonerResponse.statusText}`,
          );
        }

        const summonerData: SummonerInfo = await summonerResponse.json();
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
