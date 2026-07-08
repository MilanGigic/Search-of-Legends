"use server";

import { db } from "@/db";
import { items, matchParticipants } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

export interface ChampionBootsResult {
  itemId: number;
  itemName: string;
  itemImage: string;
  gamesPlayed: number;
  winRate: number;
  pickRate: number;
}

export async function getChampionBoots(
  championId: number,
  role: string,
): Promise<ChampionBootsResult[]> {
  const bootsItems = await db
    .select({ itemId: items.itemId, name: items.name, image: items.image })
    .from(items)
    .where(sql`${items.tags} @> '["Boots"]'::jsonb`);

  if (bootsItems.length === 0) return [];

  const bootsMeta = new Map(bootsItems.map((b) => [b.itemId, b]));
  const bootsIdList = sql.join(
    bootsItems.map((b) => sql`${b.itemId}`),
    sql`, `,
  );

  const equippedBoots = sql<number | null>`
    case
      when ${matchParticipants.item0} = any(array[${bootsIdList}]) then ${matchParticipants.item0}
      when ${matchParticipants.item1} = any(array[${bootsIdList}]) then ${matchParticipants.item1}
      when ${matchParticipants.item2} = any(array[${bootsIdList}]) then ${matchParticipants.item2}
      when ${matchParticipants.item3} = any(array[${bootsIdList}]) then ${matchParticipants.item3}
      when ${matchParticipants.item4} = any(array[${bootsIdList}]) then ${matchParticipants.item4}
      when ${matchParticipants.item5} = any(array[${bootsIdList}]) then ${matchParticipants.item5}
      when ${matchParticipants.item6} = any(array[${bootsIdList}]) then ${matchParticipants.item6}
      else null
    end
  `;

  const conditions = [eq(matchParticipants.championId, championId)];
  if (role) conditions.push(eq(matchParticipants.individualPosition, role));

  const rows = await db
    .select({ equippedBoots, win: matchParticipants.win })
    .from(matchParticipants)
    .where(and(...conditions));

  const totalGames = rows.length;
  const tally = new Map<number, { games: number; wins: number }>();

  for (const row of rows) {
    if (row.equippedBoots == null) continue;
    const entry = tally.get(row.equippedBoots) ?? { games: 0, wins: 0 };
    entry.games += 1;
    entry.wins += row.win === 1 ? 1 : 0;
    tally.set(row.equippedBoots, entry);
  }

  return [...tally.entries()]
    .map(([itemId, stat]) => {
      const meta = bootsMeta.get(itemId)!;
      return {
        itemId,
        itemName: meta.name,
        itemImage: meta.image,
        gamesPlayed: stat.games,
        winRate: Number(((stat.wins / stat.games) * 100).toFixed(1)),
        pickRate: Number(((stat.games / totalGames) * 100).toFixed(1)),
      };
    })
    .sort((a, b) => b.gamesPlayed - a.gamesPlayed);
}
