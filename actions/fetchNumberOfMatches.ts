"use server";

import "dotenv";

export async function fetchNumberOfMatches({ puuid }: { puuid: string }) {
  if (!puuid) {
    console.log("[fetchNumberOfMatches] No puuid provided");
    return null;
  }
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    const url = `${BASE_URL}/api/number-of-matches/${puuid}`;
    console.log(`[fetchNumberOfMatches] Fetching number of matches from:`, url);

    const res = await fetch(url);

    if (!res.ok) {
      console.error(
        "[fetchNumberOfMatches] Failed to fetch number of matches:",
        res.status,
        res.statusText,
      );
      return null;
    }

    const data = await res.json();
    console.log(
      "[fetchNumberOfMatches] Received number of matches response:",
      Array.isArray(data) ? data.length : data,
    );

    return data;
  } catch (error) {
    console.error(
      "[fetchNumberOfMatches] Error fetching number of matches:",
      error,
    );
    return null;
  }
}

// This is just straight up not working, so we need to fix it.
