"use server";

import { db } from "@/db";
import {
  matchTimelineEvents,
  matchTimelineFrames,
  matchTimelineParticipantFrames,
  matchTimelines,
} from "@/db/schema";

export async function insertMatchTimeline(matchTimeline: MatchTimelineDto) {
  if (!matchTimeline) return;

  const { metadata, info } = matchTimeline;
  const matchId = metadata.matchId;

  if (!matchId) return;

  await db.transaction(async (tx) => {
    //
    // Timeline
    //
    await tx.insert(matchTimelines).values({
      matchId,
      gameId: info.gameId,
      dataVersion: metadata.dataVersion,
      endOfGameResult: info.endOfGameResult,
      frameInterval: info.frameInterval,
      participantPuuids: metadata.participants,
    });

    //
    // Frames
    //
    const frameRows: (typeof matchTimelineFrames.$inferInsert)[] = [];

    //
    // Events
    //
    const eventRows: (typeof matchTimelineEvents.$inferInsert)[] = [];

    //
    // Participant Frames
    //
    const participantFrameRows: (typeof matchTimelineParticipantFrames.$inferInsert)[] =
      [];

    info.frames.forEach((frame, frameIndex) => {
      frameRows.push({
        matchId,
        frameIndex,
        timestamp: frame.timestamp,
      });

      //
      // Events
      //
      frame.events.forEach((event, eventOrder) => {
        eventRows.push({
          matchId,
          frameIndex,
          eventOrder,

          timestamp: event.timestamp,
          realTimestamp: event.realTimestamp,
          type: event.type,

          // if your Events type later includes these
          itemId: event.itemId,
          participantId: event.participantId,
          skillSlot: event.skillSlot,
        });
      });

      //
      // Participant Frames
      //
      Object.values(frame.participantFrames).forEach((pf) => {
        participantFrameRows.push({
          matchId,
          frameIndex,

          participantId: pf.participantId,

          currentGold: pf.currentGold,
          totalGold: pf.totalGold,
          goldPerSecond: pf.goldPerSecond,
          level: pf.level,
          xp: pf.xp,
          minionsKilled: pf.minionsKilled,
          jungleMinionsKilled: pf.jungleMinionsKilled,
          timeEnemySpentControlled: pf.timeEnemySpentControlled,

          positionX: pf.position.x,
          positionY: pf.position.y,

          //
          // Champion stats
          //
          csAbilityHaste: pf.championStats.abilityHaste,
          csAbilityPower: pf.championStats.abilityPower,
          csArmor: pf.championStats.armor,
          csArmorPen: pf.championStats.armorPen,
          csArmorPenPercent: pf.championStats.armorPenPercent,
          csAttackDamage: pf.championStats.attackDamage,
          csAttackSpeed: pf.championStats.attackSpeed,
          csBonusArmorPenPercent: pf.championStats.bonusArmorPenPercent,
          csBonusMagicPenPercent: pf.championStats.bonusMagicPenPercent,
          csCcReduction: pf.championStats.ccReduction,
          csCooldownReduction: pf.championStats.cooldownReduction,
          csHealth: pf.championStats.health,
          csHealthMax: pf.championStats.healthMax,
          csHealthRegen: pf.championStats.healthRegen,
          csLifesteal: pf.championStats.lifesteal,
          csMagicPen: pf.championStats.magicPen,
          csMagicPenPercent: pf.championStats.magicPenPercent,
          csMagicResist: pf.championStats.magicResist,
          csMovementSpeed: pf.championStats.movementSpeed,
          csOmnivamp: pf.championStats.omnivamp,
          csPhysicalVamp: pf.championStats.physicalVamp,
          csPower: pf.championStats.power,
          csPowerMax: pf.championStats.powerMax,
          csPowerRegen: pf.championStats.powerRegen,
          csSpellVamp: pf.championStats.spellVamp,

          //
          // Damage stats
          //
          dsMagicDamageDone: pf.damageStats.magicDamageDone,
          dsMagicDamageDoneToChampions:
            pf.damageStats.magicDamageDoneToChampions,
          dsMagicDamageTaken: pf.damageStats.magicDamageTaken,
          dsPhysicalDamageDone: pf.damageStats.physicalDamageDone,
          dsPhysicalDamageDoneToChampions:
            pf.damageStats.physicalDamageDoneToChampions,
          dsPhysicalDamageTaken: pf.damageStats.physicalDamageTaken,
          dsTotalDamageDone: pf.damageStats.totalDamageDone,
          dsTotalDamageDoneToChampions:
            pf.damageStats.totalDamageDoneToChampions,
          dsTotalDamageTaken: pf.damageStats.totalDamageTaken,
          dsTrueDamageDone: pf.damageStats.trueDamageDone,
          dsTrueDamageDoneToChampions: pf.damageStats.trueDamageDoneToChampions,
          dsTrueDamageTaken: pf.damageStats.trueDamageTaken,
        });
      });
    });

    if (frameRows.length) {
      await tx.insert(matchTimelineFrames).values(frameRows);
    }

    if (eventRows.length) {
      await tx.insert(matchTimelineEvents).values(eventRows);
    }

    if (participantFrameRows.length) {
      await tx
        .insert(matchTimelineParticipantFrames)
        .values(participantFrameRows);
    }
  });
}
