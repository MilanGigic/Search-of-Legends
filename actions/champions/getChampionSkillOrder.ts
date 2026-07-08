"use server";

import { db } from "@/db";
import { matchParticipants, matchTimelineEvents } from "@/db/schema";
import { and, eq } from "drizzle-orm";

const SKILL_LABELS: Record<number, string> = { 1: "Q", 2: "W", 3: "E" };

export interface ChampionSkillOrderResult {
  order: number[]; // e.g. [1, 3, 2]
  orderLabel: string; // e.g. "Q > E > W"
  gamesPlayed: number;
  winRate: number;
  pickRate: number;
}

export async function getChampionSkillOrder(
  championId: number,
  role: string,
): Promise<ChampionSkillOrderResult | null> {
  const conditions = [
    eq(matchTimelineEvents.type, "SKILL_LEVEL_UP"),
    eq(matchParticipants.championId, championId),
  ];

  if (role) {
    conditions.push(eq(matchParticipants.individualPosition, role));
  }

  const events = await db
    .select({
      matchId: matchTimelineEvents.matchId,
      participantId: matchTimelineEvents.participantId,
      skillSlot: matchTimelineEvents.skillSlot,
      timestamp: matchTimelineEvents.timestamp,
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
    .where(and(...conditions))
    .orderBy(
      matchTimelineEvents.matchId,
      matchTimelineEvents.participantId,
      matchTimelineEvents.timestamp,
    );

  // Step A: replay events per (matchId, participantId) to find each
  // game's actual "maxed first / second / third" order.
  const games = new Map<
    string,
    {
      win: number | null;
      skillCounts: Record<number, number>;
      maxOrder: number[];
    }
  >();

  for (const event of events) {
    if (event.skillSlot == null || event.skillSlot === 4) continue; // skip ultimate
    const key = `${event.matchId}-${event.participantId}`;
    let game = games.get(key);
    if (!game) {
      game = {
        win: event.win,
        skillCounts: { 1: 0, 2: 0, 3: 0 },
        maxOrder: [],
      };
      games.set(key, game);
    }
    game.skillCounts[event.skillSlot]++;
    if (
      game.skillCounts[event.skillSlot] === 5 &&
      !game.maxOrder.includes(event.skillSlot)
    ) {
      game.maxOrder.push(event.skillSlot);
    }
  }

  // Step B: tally games by their final 3-skill signature
  const orderTally = new Map<
    string,
    { games: number; wins: number; order: number[] }
  >();
  let totalGames = 0;

  for (const game of games.values()) {
    // Any skill that never reached rank 5 (short/remade game) gets
    // slotted in by however many points it did get.
    const remaining = ([1, 2, 3] as const).filter(
      (s) => !game.maxOrder.includes(s),
    );
    remaining.sort((a, b) => game.skillCounts[b] - game.skillCounts[a]);
    const fullOrder = [...game.maxOrder, ...remaining];

    const key = fullOrder.join("-");
    const entry = orderTally.get(key) ?? {
      games: 0,
      wins: 0,
      order: fullOrder,
    };
    entry.games += 1;
    entry.wins += game.win === 1 ? 1 : 0;
    orderTally.set(key, entry);
    totalGames += 1;
  }

  if (totalGames === 0) return null;

  const top = [...orderTally.values()].sort((a, b) => b.games - a.games)[0];

  return {
    order: top.order,
    orderLabel: top.order.map((s) => SKILL_LABELS[s]).join(" > "),
    gamesPlayed: top.games,
    winRate: Number(((top.wins / top.games) * 100).toFixed(1)),
    pickRate: Number(((top.games / totalGames) * 100).toFixed(1)),
  };
}
