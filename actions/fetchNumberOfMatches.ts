"use server";

export async function fetchNumberOfMatches({ puuid }: { puuid: string }) {
  if (!puuid) {
    return null;
  }
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    const res = await fetch(`${BASE_URL}/api/number-of-matches/${puuid}`);

    if (!res.ok) {
      console.error("Failed to fetch number of matches:", res.statusText);
      return null;
    }

    const data = await res.json();

    return data;
  } catch (error) {
    console.error("Error fetching number of matches:", error);
    return null;
  }
}

// This is just straight up not working, so we need to fix it.
