import { db } from "@/db";
import { champions } from "@/db/schema";

export default async function fetchChampions() {
  console.log("Fetching champions from database...");
  const dbChampions = await db.select().from(champions);
  console.log("Champions fetched from database", dbChampions[0]);

  if (dbChampions.length > 0) {
    console.log("Returning champions from database.");
    return dbChampions;
  } else {
    try {
      console.log("No champions in database. Fetching from Riot API...");
      const championRes = await fetch(
        "https://ddragon.leagueoflegends.com/cdn/15.5.1/data/en_US/champion.json"
      );

      if (!championRes.ok) {
        console.warn(
          "Something went wrong fetching champions:",
          championRes.statusText
        );
      }

      const { data }: ChampionDetailData = await championRes.json();
      console.log("Champions fetched from Riot API", Object.values(data)[0]);

      const championArray = Object.values(data);

      if (championArray.length > 0) {
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
}
