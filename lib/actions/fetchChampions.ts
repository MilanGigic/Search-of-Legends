import { db } from "@/db";
import { champions } from "@/db/schema";
import { fetchLatestVersion } from "../riot";

export default async function fetchChampions() {
  console.log("Fetching champions from database...");
  const dbChampions = await db.select().from(champions);
  console.log("Champions fetched from database", dbChampions[0]);

  const version = await fetchLatestVersion();
  console.log("Version:", version);

  try {
    const championRes = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
    );

    if (!championRes.ok) {
      console.warn(
        "Something went wrong fetching champions:",
        championRes.statusText
      );
    }

    const { data }: ChampionDetailData = await championRes.json();

    const championArray = Object.values(data);

    if (championArray.length > dbChampions.length) {
      console.log("Inserting champions into database...");
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
          })
        )
      );
      console.log("Champions inserted into database.");
    }

    return await db.select().from(champions);
  } catch (error) {
    console.error(`Fetching champions failed:`, error);
    throw error;
  }
}
