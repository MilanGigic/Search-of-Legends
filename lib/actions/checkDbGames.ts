export default async function checkDbGames(puuid: string, matchIds: string[]) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  console.log("checkDbGames called with:", { puuid, matchIds, BASE_URL });
  try {
    const url = `${BASE_URL}/api/check-db-games?puuid=${puuid}&matchIds=${encodeURIComponent(
      JSON.stringify(matchIds)
    )}`;
    console.log("Fetching URL:", url);
    const res = await fetch(url);
    console.log("Fetch response status:", res.status);

    if (!res.ok) throw new Error("Failed to check matches");

    const {
      foundMatches,
      missingMatchIds,
    }: { foundMatches: DbGameInfo[]; missingMatchIds: string[] } =
      await res.json();

    console.log("Found matches:", foundMatches);
    console.log("Missing match IDs:", missingMatchIds);

    return { foundMatches, missingMatchIds };
  } catch (error) {
    console.error("Checking database for games failed", error);
    throw error;
  }
}
