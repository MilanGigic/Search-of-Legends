"use server";

import { db } from "@/db";
import { matchDetails, matchParticipants, matchTeams, matchObjectives, matchBans } from "@/db/schema";
import { inArray } from "drizzle-orm";

type CachedGame = {
  matchId: string;
  data: DbGameInfo;
};

export default async function checkDbGames(
  matchIds: string[],
): Promise<CachedGame[]> {
  if (!matchIds || matchIds.length === 0) {
    return [];
  }

  const [details, participants, teams, objectives, bans] = await Promise.all([
    db
      .select()
      .from(matchDetails)
      .where(inArray(matchDetails.matchId, matchIds)),

    db
      .select()
      .from(matchParticipants)
      .where(inArray(matchParticipants.matchId, matchIds)),

    db.select().from(matchTeams).where(inArray(matchTeams.matchId, matchIds)),

    db
      .select()
      .from(matchObjectives)
      .where(inArray(matchObjectives.matchId, matchIds)),

    db.select().from(matchBans).where(inArray(matchBans.matchId, matchIds)),
  ]);

  const participantsByMatch = new Map<string, typeof participants>();
  for (const p of participants) {
    const list = participantsByMatch.get(p.matchId) ?? [];
    list.push(p);
    participantsByMatch.set(p.matchId, list);
  }
  const teamsByMatch = new Map<string, typeof teams>();
  for (const t of teams) {
    const list = teamsByMatch.get(t.matchId) ?? [];
    list.push(t);
    teamsByMatch.set(t.matchId, list);
  }

  const objectivesByMatch = new Map<string, typeof objectives>();
  for (const o of objectives) {
    const list = objectivesByMatch.get(o.matchId) ?? [];
    list.push(o);
    objectivesByMatch.set(o.matchId, list);
  }

  const bansByMatch = new Map<string, typeof bans>();
  for (const b of bans) {
    const list = bansByMatch.get(b.matchId) ?? [];
    list.push(b);
    bansByMatch.set(b.matchId, list);
  }

  const results: CachedGame[] = [];

  for (const detail of details) {
    const matchParticipantsList = participantsByMatch.get(detail.matchId) ?? [];
    const matchTeamsList = teamsByMatch.get(detail.matchId) ?? [];
    const matchObjectivesList = objectivesByMatch.get(detail.matchId) ?? [];
    const matchBansList = bansByMatch.get(detail.matchId) ?? [];

    if (matchParticipantsList.length === 0 || matchTeamsList.length === 0) {
      continue;
    }

    results.push({
      matchId: detail.matchId,
      data: {
        info: {
          matchId: detail.matchId,
          gameCreation: detail.gameCreation,
          gameMode: detail.gameMode,
          gameType: detail.gameType,
          gameVersion: detail.gameVersion,
          mapId: detail.mapId,
          platformId: detail.platformId,
          queueId: detail.queueId,
          tournamentCode: detail.tournamentCode,
          createdAt: detail.createdAt,
        },
        participants: matchParticipantsList,
        objectives: matchObjectivesList,
        teams: matchTeamsList,
        bans: matchBansList,
      },
    });
  }

  return results;
}
