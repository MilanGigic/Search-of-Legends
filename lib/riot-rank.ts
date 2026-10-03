"use server";

export type SoloRank = {
  tier: string;
  rank: string;
  lp: number;
  wins: number;
  losses: number;
} | null;

type LeagueEntry = {
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
};

export async function fetchSoloRank(
  puuid: string,
  platform: string,
): Promise<SoloRank> {
  const res = await fetch(
    `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${encodeURIComponent(puuid)}`,
    {
      headers: { "X-Riot-Token": process.env.RIOT_API_KEY! },
      next: { revalidate: 300 },
    },
  );
  if (!res.ok) return null;

  const entries: LeagueEntry[] = await res.json();
  const solo = entries.find((e) => e.queueType === "RANKED_SOLO_5x5");
  if (!solo) return null;

  return {
    tier: solo.tier,
    rank: solo.rank,
    lp: solo.leaguePoints,
    wins: solo.wins,
    losses: solo.losses,
  };
}
