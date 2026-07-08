"use server";

import { db } from "@/db";
import { items, matchParticipants, matchTimelineEvents } from "@/db/schema";
import { and, eq, inArray, lte } from "drizzle-orm";

const START_PHASE_CUTOFF_MS = 90_000; // adjust based on what your data shows

export interface ChampionStartItemsResult {
  itemIds: number[];
  itemNames: string[];
  gamesPlayed: number;
  winRate: number;
  pickRate: number;
}

export async function getChampionStartItems(
  championId: number,
  role: string,
): Promise<ChampionStartItemsResult[]> {
  const conditions = [eq(matchParticipants.championId, championId)];
  if (role) conditions.push(eq(matchParticipants.individualPosition, role));

  const events = await db
    .select({
      matchId: matchTimelineEvents.matchId,
      participantId: matchTimelineEvents.participantId,
      itemId: matchTimelineEvents.itemId,
      win: matchParticipants.win,
    })
    .from(matchTimelineEvents)
    .innerJoin(
      matchParticipants,
      and(
        eq(matchTimelineEvents.matchId, matchParticipants.matchId),
        eq(matchTimelineEvents.participantId, matchParticipants.participantId),
      ),
    )
    .where(
      and(
        eq(matchTimelineEvents.type, "ITEM_PURCHASED"),
        lte(matchTimelineEvents.timestamp, START_PHASE_CUTOFF_MS),
        ...conditions,
      ),
    );

  const games = new Map<string, { win: number | null; itemIds: number[] }>();
  for (const event of events) {
    if (event.itemId == null) continue;
    const key = `${event.matchId}-${event.participantId}`;
    let game = games.get(key);
    if (!game) {
      game = { win: event.win, itemIds: [] };
      games.set(key, game);
    }
    game.itemIds.push(event.itemId);
  }

  const tally = new Map<
    string,
    { games: number; wins: number; itemIds: number[] }
  >();
  let totalGames = 0;

  for (const game of games.values()) {
    const sortedIds = [...game.itemIds].sort((a, b) => a - b);
    const key = sortedIds.join("-");
    const entry = tally.get(key) ?? { games: 0, wins: 0, itemIds: sortedIds };
    entry.games += 1;
    entry.wins += game.win === 1 ? 1 : 0;
    tally.set(key, entry);
    totalGames += 1;
  }

  if (totalGames === 0) return [];

  const allItemIds = [
    ...new Set([...tally.values()].flatMap((t) => t.itemIds)),
  ];
  const itemRows = await db
    .select({ itemId: items.itemId, name: items.name })
    .from(items)
    .where(inArray(items.itemId, allItemIds));
  const itemMeta = new Map(itemRows.map((i) => [i.itemId, i.name]));

  return [...tally.values()]
    .map((entry) => ({
      itemIds: entry.itemIds,
      itemNames: entry.itemIds.map((id) => itemMeta.get(id) ?? "Unknown"),
      gamesPlayed: entry.games,
      winRate: Number(((entry.wins / entry.games) * 100).toFixed(1)),
      pickRate: Number(((entry.games / totalGames) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.gamesPlayed - a.gamesPlayed)
    .slice(0, 5);
}
