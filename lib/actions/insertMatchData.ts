import { db } from "@/db";
import {
  matchDetails,
  matches,
  matchObjectives,
  matchParticipants,
} from "@/db/schema";

export default async function insertMatchData(
  matchData: RiotMatchDto,
  puuid: string
) {
  const { info, metadata } = matchData;
  const matchId = metadata.matchId;

  if (!matchId || !puuid) {
    console.error("Invalid match data or PUUID");
    return;
  }

  // Insert into matches table
  await db
    .insert(matches)
    .values({
      matchId,
      puuid,
    })
    .onConflictDoNothing();

  // Insert into matchDetails table

  await db
    .insert(matchDetails)
    .values({
      matchId,
      gameCreation: info.gameCreation.toString(),
      gameDuration: info.gameDuration.toString(),
      gameEndTimestamp: new Date(info.gameEndTimestamp),
      gameMode: info.gameMode,
      gameType: info.gameType,
      gameVersion: info.gameVersion,
      mapId: info.mapId,
      platformId: info.platformId,
      queueId: info.queueId,
      tournamentCode: info.tournamentCode || null,
      createdAt: new Date(),
    })
    .onConflictDoNothing();

  for (const p of matchData.info.participants) {
    await db
      .insert(matchParticipants)
      .values({
        matchId,
        assists: p.assists,
        baronKills: p.baronKills,
        bountyLevel: p.bountyLevel,
        champExperience: p.champExperience,
        champLevel: p.champLevel,
        championId: p.championId,
        championName: p.championName,
        championTransform: p.championTransform,
        damageDealtToBuildings: p.damageDealtToBuildings,
        damageDealtToObjectives: p.damageDealtToObjectives,
        damageDealtToTurrets: p.damageDealtToTurrets,
        damageSelfMitigated: p.damageSelfMitigated,
        deaths: p.deaths,
        magicDamageDealt: p.magicDamageDealt,
        magicDamageDealtToChampions: p.magicDamageDealtToChampions,
        magicDamageTaken: p.magicDamageTaken,
        physicalDamageDealt: p.physicalDamageDealt,
        physicalDamageDealtToChampions: p.physicalDamageDealtToChampions,
        physicalDamageTaken: p.physicalDamageTaken,
        trueDamageDealt: p.trueDamageDealt,
        trueDamageDealtToChampions: p.trueDamageDealtToChampions,
        trueDamageTaken: p.trueDamageTaken,
        totalDamageDealt: p.totalDamageDealt,
        totalDamageDealtToChampions: p.totalDamageDealtToChampions,
        totalDamageTaken: p.totalDamageTaken,
        doubleKills: p.doubleKills,
        dragonKills: p.dragonKills,
        firstBloodAssist: p.firstBloodAssist ? 1 : 0,
        firstBloodKill: p.firstBloodKill ? 1 : 0,
        firstTowerAssist: p.firstTowerAssist ? 1 : 0,
        firstTowerKill: p.firstTowerKill ? 1 : 0,
        killingSprees: p.killingSprees,
        kills: p.kills,
        largestKillingSpree: p.largestKillingSpree,
        largestMultiKill: p.largestMultiKill,
        pentaKills: p.pentaKills,
        quadraKills: p.quadraKills,
        tripleKills: p.tripleKills,
        goldEarned: p.goldEarned,
        goldSpent: p.goldSpent,
        itemsPurchased: p.itemsPurchased,
        item0: p.item0,
        item1: p.item1,
        item2: p.item2,
        item3: p.item3,
        item4: p.item4,
        item5: p.item5,
        item6: p.item6,
        individualPosition: p.individualPosition,
        teamPosition: p.teamPosition,
        lane: p.lane,
        role: p.role,
        participantId: p.participantId,
        puuid: p.puuid,
        summonerId: p.summonerId,
        summonerLevel: p.summonerLevel,
        summonerName: p.summonerName,
        profileIcon: p.profileIcon,
        riotIdGameName: p.riotIdGameName,
        riotIdTagline: p.riotIdTagline,
        teamId: p.teamId,
        teamEarlySurrendered: p.teamEarlySurrendered ? 1 : 0,
        win: p.win ? 1 : 0,
        detectorWardsPlaced: p.detectorWardsPlaced,
        sightWardsBoughtInGame: p.sightWardsBoughtInGame,
        visionScore: p.visionScore,
        visionWardsBoughtInGame: p.visionWardsBoughtInGame,
        timePlayed: p.timePlayed,
        totalMinionsKilled: p.totalMinionsKilled,
      })
      .onConflictDoNothing();
  }

  for (const team of matchData.info.teams) {
    await db
      .insert(matchObjectives)
      .values({
        matchId,
        baron: String(team.objectives?.baron?.kills ?? "0"),
        champion: String(team.objectives?.champion?.kills ?? "0"),
        dragon: String(team.objectives?.dragon?.kills ?? "0"),
        inhibitor: String(team.objectives?.inhibitor?.kills ?? "0"),
        riftHerald: String(team.objectives?.riftHerald?.kills ?? "0"),
        tower: String(team.objectives?.tower?.kills ?? "0"),
      })
      .onConflictDoNothing();
  }
}
