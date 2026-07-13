import { db } from "@/db";
import { items } from "@/db/schema";
import { fetchLatestVersion } from "@/lib/riot";

interface LeagueItemJson {
  type: string;
  version: string;
  data: Record<
    string,
    {
      name: string;
      image: {
        full: string;
        [key: string]: any;
      };
      tags?: string[];
      [key: string]: any; // Catch-all for the other stats/maps data
    }
  >;
}

export async function seedItems() {
  const version = await fetchLatestVersion();

  const URL = `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`;

  const res = await fetch(URL);

  if (!res.ok) {
    console.error("Fetching items went wrong:", res.statusText, res.status);
    return;
  }

  const data = await res.json();
  const parsedData = data as LeagueItemJson;
  const gameVersion = parsedData.version;

  // Map the JSON object into an array of records matching your Drizzle schema
  const itemsToInsert = Object.entries(parsedData.data).map(([id, item]) => {
    return {
      itemId: parseInt(id, 10),
      name: item.name,
      image: item.image.full,
      tags: item.tags || [], // Fallback to an empty array if tags are missing
      totalGold: item.gold.total,
      gameVersion: gameVersion,
    };
  });

  console.log(
    `Preparing to seed ${itemsToInsert.length} items (Version ${gameVersion})...`,
  );

  try {
    // Perform a batch insert.
    // onConflictDoNothing() ensures the script is idempotent and won't crash if run twice.
    await db
      .insert(items)
      .values(itemsToInsert)
      .onConflictDoNothing({ target: items.itemId });

    console.log("✅ Items successfully seeded!");
  } catch (error) {
    console.error("❌ Failed to seed items:", error);
  }
}

// Execute the function if running directly
seedItems().then(() => process.exit(0));
