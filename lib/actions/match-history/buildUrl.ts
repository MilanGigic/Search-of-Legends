// import getRegionalEndpoint from "./getRegionalEndpoint";

// function buildMatchHistoryUrl(
//   region: string,
//   puuid: string,
//   count: number,
//   start: number,
//   queue?: number
// ): string {
//   const baseUrl = getRegionalEndpoint(region);
//   let url = `${baseUrl}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`;

//   if (queue) url += `&queue=${queue}`;
//   url += `&api_key=${process.env.RIOT_API_KEY}`;

//   return url;
// }

// export default buildMatchHistoryUrl;
