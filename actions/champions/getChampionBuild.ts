"use server";

import { db } from "@/db";
import {
  matchParticipants,
  matchParticipantPerks,
  matchParticipantPerkStyles,
  matchParticipantPerkSelections,
} from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

export interface ChampionBuildResult {
  gamesPlayed: number;
  wins: number;
  winRate: number;
  summoner1Id: number | null;
  summoner2Id: number | null;
  primaryStyle: number | null;
  subStyle: number | null;
  keystone: number | null;
  primaryPerks: (number | null)[]; // [perk1, perk2, perk3]
  subPerks: (number | null)[]; // [perk1, perk2]
  shards: {
    offense: number | null;
    flex: number | null;
    defense: number | null;
  };
}

export async function getChampionBuild(
  championId: number,
  role: string,
): Promise<ChampionBuildResult | null> {
  // One row per participant: their rune tree choices, pivoted into columns
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

  // One row per participant: their 6 individual rune picks, pivoted into columns
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

  // One row per (matchId, participantId) for this champion/role: full build signature
  const participantBuilds = db
    .select({
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
    .where(
      role
        ? and(
            eq(matchParticipants.championId, championId),
            eq(matchParticipants.individualPosition, role),
          )
        : eq(matchParticipants.championId, championId),
    )
    .as("participantBuilds");

  // Group by the FULL signature to find the most-played exact combo
  const [topBuild] = await db
    .select({
      primaryStyle: participantBuilds.primaryStyle,
      subStyle: participantBuilds.subStyle,
      keystone: participantBuilds.keystone,
      primaryPerk1: participantBuilds.primaryPerk1,
      primaryPerk2: participantBuilds.primaryPerk2,
      primaryPerk3: participantBuilds.primaryPerk3,
      subPerk1: participantBuilds.subPerk1,
      subPerk2: participantBuilds.subPerk2,
      shardOffense: participantBuilds.shardOffense,
      shardFlex: participantBuilds.shardFlex,
      shardDefense: participantBuilds.shardDefense,
      summoner1Id: participantBuilds.summoner1Id,
      summoner2Id: participantBuilds.summoner2Id,
      gamesPlayed: sql<number>`cast(count(*) as integer)`,
      wins: sql<number>`cast(sum(case when ${participantBuilds.win} = 1 then 1 else 0 end) as integer)`,
    })
    .from(participantBuilds)
    .groupBy(
      participantBuilds.primaryStyle,
      participantBuilds.subStyle,
      participantBuilds.keystone,
      participantBuilds.primaryPerk1,
      participantBuilds.primaryPerk2,
      participantBuilds.primaryPerk3,
      participantBuilds.subPerk1,
      participantBuilds.subPerk2,
      participantBuilds.shardOffense,
      participantBuilds.shardFlex,
      participantBuilds.shardDefense,
      participantBuilds.summoner1Id,
      participantBuilds.summoner2Id,
    )
    .orderBy(sql`count(*) desc`)
    .limit(1);

  if (!topBuild) return null;

  return {
    gamesPlayed: topBuild.gamesPlayed,
    wins: topBuild.wins,
    winRate: Number(((topBuild.wins / topBuild.gamesPlayed) * 100).toFixed(1)),
    summoner1Id: topBuild.summoner1Id,
    summoner2Id: topBuild.summoner2Id,
    primaryStyle: topBuild.primaryStyle,
    subStyle: topBuild.subStyle,
    keystone: topBuild.keystone,
    primaryPerks: [
      topBuild.primaryPerk1,
      topBuild.primaryPerk2,
      topBuild.primaryPerk3,
    ],
    subPerks: [topBuild.subPerk1, topBuild.subPerk2],
    shards: {
      offense: topBuild.shardOffense,
      flex: topBuild.shardFlex,
      defense: topBuild.shardDefense,
    },
  };
}
