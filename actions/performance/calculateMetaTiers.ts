export function calculateMetaTiers(
  champions: MetaChampionStats[],
  weights: TierWeights,
): ChampionTierResult[] {
  if (champions.length === 0) return [];

  const totalParticipants = champions.reduce(
    (sum, champ) => sum + champ.gamesPlayed,
    0,
  );
  const totalMatches = totalParticipants / 10;

  const minGamesThreshold = totalMatches * 0.001;

  const scoredChampions = champions.map((champ) => {
    const pickRate = (champ.gamesPlayed / totalMatches) * 100;
    const banRate = (champ.bans / totalMatches) * 100;

    const rawScore =
      champ.winRate * weights.winRateWeight +
      pickRate * weights.pickRateWeight +
      banRate * weights.banRateWeight;

    return {
      name: champ.championName,
      lane: champ.lane,
      rawScore,
      isValidSample: champ.gamesPlayed >= minGamesThreshold,
    };
  });

  const validChampions = scoredChampions.filter((c) => c.isValidSample);

  const poolForMath =
    validChampions.length > 10 ? validChampions : scoredChampions;

  const totalScore = poolForMath.reduce(
    (sum, champ) => sum + champ.rawScore,
    0,
  );
  const mean = totalScore / poolForMath.length;

  const squaredDifferences = poolForMath.map((champ) => {
    const diff = champ.rawScore - mean;
    return diff * diff;
  });
  const standardDeviation = Math.sqrt(
    squaredDifferences.reduce((sum, val) => sum + val, 0) / poolForMath.length,
  );

  return scoredChampions
    .map((champ) => {
      let assignedTier: ChampionTierResult["tier"] = "D";
      const score = champ.rawScore;

      // If they didn't meet the minimum games threshold, automatic D tier
      if (!champ.isValidSample) {
        assignedTier = "D";
      } else if (score >= mean + 2 * standardDeviation) {
        assignedTier = "S+";
      } else if (score >= mean + standardDeviation) {
        assignedTier = "S";
      } else if (score >= mean) {
        assignedTier = "A";
      } else if (score >= mean - standardDeviation) {
        assignedTier = "B";
      } else if (score >= mean - 1.5 * standardDeviation) {
        assignedTier = "C";
      }

      return {
        name: champ.name,
        lane: champ.lane,
        rawScore: Number(score.toFixed(2)),
        tier: assignedTier,
      };
    })
    .sort((a, b) => b.rawScore - a.rawScore);
}
