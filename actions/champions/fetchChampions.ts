import { db } from "@/db";
import { champions } from "@/db/schema";
import { fetchLatestVersion } from "../../lib/riot";

export default async function fetchChampions() {
  const dbChampions = await db.select().from(champions);

  const version = await fetchLatestVersion();

  try {
    const championRes = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`,
    );

    if (!championRes.ok) {
      console.warn(
        "Something went wrong fetching champions:",
        championRes.statusText,
      );
    }

    const { data }: ChampionDetailData = await championRes.json();

    const championArray = Object.values(data);

    if (championArray.length > dbChampions.length) {
      await Promise.all(
        championArray.map((champion) =>
          db.insert(champions).values({
            id: champion.id,
            key: champion.key,
            name: champion.name,
            title: champion.title,
            blurb: champion.blurb,
            image: champion.image.full,
            tags: champion.tags,
          }),
        ),
      );
    }

    return await db.select().from(champions);
  } catch (error) {
    console.error(`Fetching champions failed:`, error);
    throw error;
  }
}
