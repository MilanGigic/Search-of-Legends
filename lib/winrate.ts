export function winRatePercent(wins: number, games: number) {
  return games > 0 ? Math.round((wins / games) * 100) : 0;
}

// Above 50% green, exactly 50% white, below 50% red.
export function winRateColor(percent: number) {
  if (percent > 50) return "text-emerald-600";
  if (percent === 50) return "text-white";
  return "text-red-700";
}
