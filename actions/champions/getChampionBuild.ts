"use server";

import { db } from "@/db";
import {
  matchParticipants,
  matchParticipantPerks,
  matchParticipantPerkStyles,
  matchParticipantPerkSelections,
  matchTimelineEvents,
  items,
} from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

const CORE_ITEM_GOLD_THRESHOLD = 2000;
const MAX_CORE_ITEMS = 6; // caps the build path length, avoids late-game rebuy noise

export interface ChampionBuildResult {
  gamesPlayed: number;
  wins: number;
  winRate: number;
  summoner1Id: number | null;
  summoner2Id: number | null;
  primaryStyle: number | null;
  subStyle: number | null;
  keystone: number | null;
  primaryPerks: (number | null)[];
  subPerks: (number | null)[];
  shards: {
    offense: number | null;
    flex: number | null;
    defense: number | null;
  };
  itemOrder: number[];
}

export async function getChampionBuild(
  championId: number,
  role: string,
): Promise<ChampionBuildResult | null> {
  // --- Rune pivots, same as before ---
  const perkStylesAgg = db
    .select({
      matchId: matchParticipantPerkStyles.matchId,
      participantId: matchParticipantPerkStyles.participantId,
      primaryStyle:
        sql<number>`max(case when ${matchParticipantPerkStyles.description} = 'primaryStyle' then ${matchParticipantPerkStyles.style} end)`.as(
          "primary_style",
        ),
      subStyle:
        sql<number>`max(case when ${matchParticipantPerkStyles.description} = 'subStyle' then ${matchParticipantPerkStyles.style} end)`.as(
          "sub_style",
        ),
    })
    .from(matchParticipantPerkStyles)
    .groupBy(
      matchParticipantPerkStyles.matchId,
      matchParticipantPerkStyles.participantId,
    )
    .as("perkStylesAgg");

  const perkSelectionsAgg = db
    .select({
      matchId: matchParticipantPerkSelections.matchId,
      participantId: matchParticipantPerkSelections.participantId,
      keystone:
        sql<number>`max(case when ${matchParticipantPerkSelections.description} = 'primaryStyle' and ${matchParticipantPerkSelections.selectionOrder} = 0 then ${matchParticipantPerkSelections.perk} end)`.as(
          "keystone",
        ),
      primaryPerk1:
        sql<number>`max(case when ${matchParticipantPerkSelections.description} = 'primaryStyle' and ${matchParticipantPerkSelections.selectionOrder} = 1 then ${matchParticipantPerkSelections.perk} end)`.as(
          "primary_perk_1",
        ),
      primaryPerk2:
        sql<number>`max(case when ${matchParticipantPerkSelections.description} = 'primaryStyle' and ${matchParticipantPerkSelections.selectionOrder} = 2 then ${matchParticipantPerkSelections.perk} end)`.as(
          "primary_perk_2",
        ),
      primaryPerk3:
        sql<number>`max(case when ${matchParticipantPerkSelections.description} = 'primaryStyle' and ${matchParticipantPerkSelections.selectionOrder} = 3 then ${matchParticipantPerkSelections.perk} end)`.as(
          "primary_perk_3",
        ),
      subPerk1:
        sql<number>`max(case when ${matchParticipantPerkSelections.description} = 'subStyle' and ${matchParticipantPerkSelections.selectionOrder} = 0 then ${matchParticipantPerkSelections.perk} end)`.as(
          "sub_perk_1",
        ),
      subPerk2:
        sql<number>`max(case when ${matchParticipantPerkSelections.description} = 'subStyle' and ${matchParticipantPerkSelections.selectionOrder} = 1 then ${matchParticipantPerkSelections.perk} end)`.as(
          "sub_perk_2",
        ),
    })
    .from(matchParticipantPerkSelections)
    .groupBy(
      matchParticipantPerkSelections.matchId,
      matchParticipantPerkSelections.participantId,
    )
    .as("perkSelectionsAgg");

  // Flat per-participant rows: NOT grouped to a single top build yet,
  // because we still need to merge in item order before we can tally.
  const buildConditions = [eq(matchParticipants.championId, championId)];
  if (role)
    buildConditions.push(eq(matchParticipants.individualPosition, role));

  const participantBuildRows = await db
    .select({
      matchId: matchParticipants.matchId,
      participantId: matchParticipants.participantId,
      win: matchParticipants.win,
      summoner1Id: matchParticipants.summoner1Id,
      summoner2Id: matchParticipants.summoner2Id,
      primaryStyle: perkStylesAgg.primaryStyle,
      subStyle: perkStylesAgg.subStyle,
      keystone: perkSelectionsAgg.keystone,
      primaryPerk1: perkSelectionsAgg.primaryPerk1,
      primaryPerk2: perkSelectionsAgg.primaryPerk2,
      primaryPerk3: perkSelectionsAgg.primaryPerk3,
      subPerk1: perkSelectionsAgg.subPerk1,
      subPerk2: perkSelectionsAgg.subPerk2,
      shardOffense: matchParticipantPerks.statPerkOffense,
      shardFlex: matchParticipantPerks.statPerkFlex,
      shardDefense: matchParticipantPerks.statPerkDefense,
    })
    .from(matchParticipants)
    .innerJoin(
      perkStylesAgg,
      and(
        eq(matchParticipants.matchId, perkStylesAgg.matchId),
        eq(matchParticipants.participantId, perkStylesAgg.participantId),
      ),
    )
    .innerJoin(
      perkSelectionsAgg,
      and(
        eq(matchParticipants.matchId, perkSelectionsAgg.matchId),
        eq(matchParticipants.participantId, perkSelectionsAgg.participantId),
      ),
    )
    .innerJoin(
      matchParticipantPerks,
      and(
        eq(matchParticipants.matchId, matchParticipantPerks.matchId),
        eq(
          matchParticipants.participantId,
          matchParticipantPerks.participantId,
        ),
      ),
    )
    .where(and(...buildConditions));

  // --- Core item purchase order, from timeline events ---
  const itemConditions = [
    eq(matchTimelineEvents.type, "ITEM_PURCHASED"),
    eq(matchParticipants.championId, championId),
    sql`${items.totalGold} >= ${CORE_ITEM_GOLD_THRESHOLD}`,
    sql`not (${items.tags} @> '["Boots"]'::jsonb)`,
    sql`not (${items.tags} @> '["Consumable"]'::jsonb)`,
    sql`not (${items.tags} @> '["Trinket"]'::jsonb)`,
  ];
  if (role) itemConditions.push(eq(matchParticipants.individualPosition, role));

  const coreItemRows = await db
    .select({
      matchId: matchTimelineEvents.matchId,
      participantId: matchTimelineEvents.participantId,
      itemId: matchTimelineEvents.itemId,
    })
    .from(matchTimelineEvents)
    .innerJoin(
      matchParticipants,
      and(
        eq(matchTimelineEvents.matchId, matchParticipants.matchId),
        eq(matchTimelineEvents.participantId, matchParticipants.participantId),
      ),
    )
    .innerJoin(items, eq(matchTimelineEvents.itemId, items.itemId))
    .where(and(...itemConditions))
    .orderBy(
      matchTimelineEvents.matchId,
      matchTimelineEvents.participantId,
      matchTimelineEvents.timestamp,
    );

  // Chronological order is already guaranteed by the orderBy above,
  // so pushing into an array per (matchId, participantId) preserves purchase order.
  const itemOrderMap = new Map<string, number[]>();
  for (const row of coreItemRows) {
    if (row.itemId == null) continue;
    const key = `${row.matchId}-${row.participantId}`;
    const arr = itemOrderMap.get(key) ?? [];
    if (arr.length < MAX_CORE_ITEMS) arr.push(row.itemId);
    itemOrderMap.set(key, arr);
  }

  // --- Merge runes + item order into one full signature, tally in JS ---
  const tally = new Map<
    string,
    {
      games: number;
      wins: number;
      sample: (typeof participantBuildRows)[number] & { itemOrder: number[] };
    }
  >();

  for (const row of participantBuildRows) {
    const key = `${row.matchId}-${row.participantId}`;
    const itemOrder = itemOrderMap.get(key) ?? [];
    const signature = [
      row.primaryStyle,
      row.subStyle,
      row.keystone,
      row.primaryPerk1,
      row.primaryPerk2,
      row.primaryPerk3,
      row.subPerk1,
      row.subPerk2,
      row.shardOffense,
      row.shardFlex,
      row.shardDefense,
      row.summoner1Id,
      row.summoner2Id,
      itemOrder.join(">"),
    ].join("|");

    const entry = tally.get(signature) ?? {
      games: 0,
      wins: 0,
      sample: { ...row, itemOrder },
    };
    entry.games += 1;
    entry.wins += row.win === 1 ? 1 : 0;
    tally.set(signature, entry);
  }

  const top = [...tally.values()].sort((a, b) => b.games - a.games)[0];
  if (!top) return null;

  return {
    gamesPlayed: top.games,
    wins: top.wins,
    winRate: Number(((top.wins / top.games) * 100).toFixed(1)),
    summoner1Id: top.sample.summoner1Id,
    summoner2Id: top.sample.summoner2Id,
    primaryStyle: top.sample.primaryStyle,
    subStyle: top.sample.subStyle,
    keystone: top.sample.keystone,
    primaryPerks: [
      top.sample.primaryPerk1,
      top.sample.primaryPerk2,
      top.sample.primaryPerk3,
    ],
    subPerks: [top.sample.subPerk1, top.sample.subPerk2],
    shards: {
      offense: top.sample.shardOffense,
      flex: top.sample.shardFlex,
      defense: top.sample.shardDefense,
    },
    itemOrder: top.sample.itemOrder,
  };
}
