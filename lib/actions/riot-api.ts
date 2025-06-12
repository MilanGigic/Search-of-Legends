export async function fetchMatchIdsByPuuid(
  puuid: string,
  region: string
): Promise<string[]> {
  const response = await fetch(
    `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=100`,
    {
      headers: {
        "X-Riot-Token": process.env.RIOT_API_KEY!,
      },
    }
  );
  return await response.json();
}

export async function fetchMatchDetails(
  matchId: string,
  region: string
): Promise<any> {
  const response = await fetch(
    `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
    {
      headers: {
        "X-Riot-Token": process.env.RIOT_API_KEY!,
      },
    }
  );
  return await response.json();
}
