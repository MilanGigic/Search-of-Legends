import { Vibrant } from "node-vibrant/node";
import { mkdtemp, writeFile, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { db } from "@/db";
import { champions } from "@/db/schema";
import { eq } from "drizzle-orm";

const SPLASH_ART_BASE =
  "https://ddragon.leagueoflegends.com/cdn/img/champion/splash";

const SWATCH_PRIORITY = [
  "Vibrant",
  "LightVibrant",
  "DarkVibrant",
  "Muted",
  "LightMuted",
  "DarkMuted",
] as const;

const REQUEST_DELAY_MS = 150; // stay polite across 170+ requests to Data Dragon

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getDominantColor(
  splashId: string,
  tempDir: string,
): Promise<string | null> {
  const url = `${SPLASH_ART_BASE}/${splashId}_0.jpg`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error(`  x ${splashId}: fetch failed (${response.status})`);
    return null;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const tempPath = path.join(tempDir, `${splashId}.jpg`);
  await writeFile(tempPath, buffer);

  const palette = await Vibrant.from(tempPath).getPalette();

  for (const swatchName of SWATCH_PRIORITY) {
    const swatch = palette[swatchName];
    if (swatch) return swatch.hex;
  }

  console.error(`  x ${splashId}: no usable swatch found`);
  return null;
}

export async function seedChampionAccentColors(
  options: { force?: boolean } = {},
) {
  const { force = false } = options;

  const allChampions = await db
    .select({
      key: champions.key,
      name: champions.name,
      image: champions.image,
      accentColor: champions.accentColor,
    })
    .from(champions);

  const targets = force
    ? allChampions
    : allChampions.filter((c) => !c.accentColor);

  if (targets.length === 0) {
    console.log(
      "All champions already have an accent color. Pass { force: true } to recompute.",
    );
    return;
  }

  console.log(`Processing ${targets.length} champion(s)...`);

  const tempDir = await mkdtemp(path.join(tmpdir(), "champion-splash-"));
  let updated = 0;
  let failed = 0;

  try {
    for (const champion of targets) {
      const splashId = champion.image.replace(/\.png$/i, "");
      const accentColor = await getDominantColor(splashId, tempDir);

      if (accentColor) {
        await db
          .update(champions)
          .set({ accentColor })
          .where(eq(champions.key, champion.key));
        console.log(`  ✓ ${champion.name}: ${accentColor}`);
        updated++;
      } else {
        failed++;
      }

      await delay(REQUEST_DELAY_MS);
    }
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }

  console.log(`Done. ${updated} updated, ${failed} failed.`);
}

seedChampionAccentColors().then(() => process.exit(0));
