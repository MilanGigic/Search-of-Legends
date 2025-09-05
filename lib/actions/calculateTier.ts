interface Stats {
  championId: number | null;
  gamesPlayed: number;
  wins: number;
  losses: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  kda: number;
  csPerMin: number;
  championName: string;
  championImage: string;
  avgDamageDealt: number;
  avgTime: number;
  bans: number;
}

export default function calculateTier(
  championStats: Stats[],
  totalGames: number
) {
  const avgWinRate =
    championStats.reduce((acc, c) => acc + c.wins / c.gamesPlayed, 0) /
    championStats.length;

  const scored = championStats.map((c) => {
    const winRate = c.wins / c.gamesPlayed;
    const pickRate = c.gamesPlayed / totalGames;
    const banRate = c.bans / totalGames;

    const tierScore =
      (winRate - avgWinRate) * 100 + pickRate * 20 - banRate * 10;

    return {
      ...c,
      winRate,
      pickRate,
      banRate,
      tierScore,
    };
  });

  // Sort champions by score
  scored.sort((a, b) => b.tierScore - a.tierScore);

  // Assign tier labels by percentile
  const tiers = ["S+", "S", "A", "B", "C"];
  const results = scored.map((c, i) => {
    const percentile = i / scored.length;
    let tier = "C";
    if (percentile < 0.05) tier = "S+";
    else if (percentile < 0.15) tier = "S";
    else if (percentile < 0.35) tier = "A";
    else if (percentile < 0.65) tier = "B";
    return { ...c, tier };
  });

  return results;
}
