import { db } from "@/db";
import {
  accounts,
  matchBans,
  matchDetails,
  matches,
  matchObjectives,
  matchParticipants,
  matchTeams,
  perkStats,
  perkStyles,
  perkStyleSelections,
  perks,
} from "@/db/schema";
import { fetchWithRateLimit } from "../riot";

export default async function insertMatchData(
  matchData: RiotMatchDto,
  puuid: string
) {
  const { info, metadata } = matchData;
  const matchId = metadata.matchId;

  const userGameName = info.participants.find((p) => p.puuid === puuid);
  const userTagLine = info.participants.find((p) => p.puuid === puuid);

  if (!matchId || !puuid) {
    console.error("Invalid match data or PUUID");
    return;
  }

  const account = await db.query.accounts.findFirst({
    where: (accounts, { eq }) => eq(accounts.puuid, puuid),
  });

  if (!account) {
    await fetch(
      `/api/account?gameName=${userGameName?.riotIdGameName}&tagLine=${userTagLine?.riotIdTagline}`
    );
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
      gameCreation: new Date(info.gameCreation),
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
        queueId: info.queueId,
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
        summoner1Id: p.summoner1Id,
        summoner2Id: p.summoner2Id,
        summonerLevel: p.summonerLevel,
        summonerName: p.summonerName,
        profileIcon: p.profileIcon,
        riotIdGameName: p.riotIdGameName,
        riotIdTagline: p.riotIdTagline,
        teamId: p.teamId,
        teamEarlySurrendered: p.teamEarlySurrendered ? 1 : 0,
        win: p.win ? 1 : 0,
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

  for (const team of matchData.info.teams) {
    await db
      .insert(matchTeams)
      .values({
        matchId,
        teamId: team.teamId,
        win: team.win === true ? 1 : 0,
      })
      .onConflictDoNothing();
  }

  for (const team of matchData.info.teams) {
    team.bans?.map(async (team) => {
      await db
        .insert(matchBans)
        .values({
          matchId,
          championId: team.championId,
          pickTurn: team.pickTurn,
        })
        .onConflictDoNothing();
    });
  }

  for (const perks of matchData.info.participants) {
    await db.insert(perkStats).values({
      matchId,
      defense: perks.perks.statPerks.defense,
      flex: perks.perks.statPerks.flex,
      offense: perks.perks.statPerks.offense,
    });
  }

  for (const perks of matchData.info.participants) {
    perks.perks.styles.map(async (styles) => {
      for (const style of styles.selections) {
        await db.insert(perkStyleSelections).values({
          matchId,
          perk: style.perk,
          var1: style.var1,
          var2: style.var2,
          var3: style.var3,
        });
      }
    });
  }

  for (const perks of matchData.info.participants) {
    perks.perks.styles.map(async (styles) => {
      await db.insert(perkStyles).values({
        matchId,
        description: styles.description,
        style: styles.style,
      });
    });
  }

  for (const perk of matchData.info.participants) {
    await db.insert(perks).values({
      matchId,
      puuid: perk.puuid,
    });
  }
}
