import { db } from "@/db";
import { champions } from "@/db/schema";
import { fetchLatestVersion } from "@/lib/riot";

export async function seedChampions() {
  const version = await fetchLatestVersion();

  const URL = `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`;

  const res = await fetch(URL);

  if (!res.ok) {
    console.error("Fetching champions went wrong:", res.statusText, res.status);
    return;
  }

  const data = await res.json();
  const parsedData = data as ChampionDetailData;
  const gameVersion = parsedData.version;

  const championsToInsert = Object.entries(parsedData.data).map(
    ([id, item]) => {
      return {
        id: item.id,
        key: item.key,
        name: item.name,
        title: item.title,
        blurb: item.blurb,
        image: item.image.full,
        tags: item.tags || [],
      };
    },
  );

  console.log(
    `Preparing to seed ${championsToInsert.length} items (Version ${gameVersion})...`,
  );

  try {
    // Perform a batch insert.
    // onConflictDoNothing() ensures the script is idempotent and won't crash if run twice.
    await db
      .insert(champions)
      .values(championsToInsert)
      .onConflictDoNothing({ target: champions.id });

    console.log("✅ Items successfully seeded!");
  } catch (error) {
    console.error("❌ Failed to seed items:", error);
  }
}

seedChampions().then(() => process.exit(0));
