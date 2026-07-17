"use server";

import { cacheLife, cacheTag } from "next/cache";

export async function fetchLatestVersion() {
  "use cache";

  cacheLife("hours");

  cacheTag("latest-version");

  console.log("FetchLatestVersion action hit");
  try {
    const versionRes = await fetch(
      "https://ddragon.leagueoflegends.com/api/versions.json",
    );

    if (!versionRes.ok) {
      console.error(
        "Error fetching versions:",
        versionRes.status,
        versionRes.statusText,
      );
    }

    const version: string[] = await versionRes.json();

    return version[0];
  } catch (error) {
    console.error("Fetching versions failed:", error);
  }
}
