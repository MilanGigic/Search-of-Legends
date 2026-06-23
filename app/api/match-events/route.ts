import { db } from "@/db";
import {
  matches,
  matchTimelines,
  matchTimelineFrames,
  matchTimelineEvents,
  matchTimelineParticipantFrames,
} from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const matchId = searchParams.get("matchId");
  const region = searchParams.get("region");

  if (!matchId || !region) {
    return NextResponse.json(
      { error: "matchId and region are required" },
      { status: 400 },
    );
  }

  try {
    // 1. Check the DB first — timeline data is immutable once a match ends,
    // so a cache hit here never goes stale.
    const cached = await readTimelineFromDb(matchId);
    if (cached) {
      return NextResponse.json(cached, { status: 200 });
    }

    // 2. Cache miss — fetch live from Riot.
    const RIOT_API_KEY = process.env.RIOT_API_KEY;
    if (!RIOT_API_KEY) {
      console.error("Riot API Key not found");
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 },
      );
    }

    const url = `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchId}/timeline?api_key=${RIOT_API_KEY}`;
    const res = await fetch(url);

    if (!res.ok) {
      const body = await res.text();
      console.error(
        `[match-events] Riot fetch failed: ${res.status} ${res.statusText} — ${body}`,
      );
      return NextResponse.json(
        { error: `Riot API error: ${res.status}` },
        { status: res.status },
      );
    }

    const data: MatchTimelineDto = await res.json();

    // 3. Write-through: store it so the next request for this match is a DB hit.
    // Failure to persist shouldn't fail the request — the user still gets
    // their data, we just log it and try again next time.
    try {
      await writeTimelineToDb(matchId, data);
    } catch (writeErr) {
      console.error(
        `[match-events] Failed to cache timeline for ${matchId}:`,
        writeErr,
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[match-events] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------

async function readTimelineFromDb(
  matchId: string,
): Promise<MatchTimelineDto | null> {
  const timeline = await db.query.matchTimelines.findFirst({
    where: eq(matchTimelines.matchId, matchId),
  });
  if (!timeline) return null;

  const frames = await db
    .select()
    .from(matchTimelineFrames)
    .where(eq(matchTimelineFrames.matchId, matchId))
    .orderBy(asc(matchTimelineFrames.frameIndex));

  if (frames.length === 0) {
    // Timeline row exists but frames are missing — treat as a partial/failed
    // write and fall back to a live fetch rather than returning empty data.
    return null;
  }

  const [allEvents, allParticipantFrames] = await Promise.all([
    db
      .select()
      .from(matchTimelineEvents)
      .where(eq(matchTimelineEvents.matchId, matchId))
      .orderBy(
        asc(matchTimelineEvents.frameIndex),
        asc(matchTimelineEvents.eventOrder),
      ),
    db
      .select()
      .from(matchTimelineParticipantFrames)
      .where(eq(matchTimelineParticipantFrames.matchId, matchId)),
  ]);

  const eventsByFrame = new Map<number, typeof allEvents>();
  for (const e of allEvents) {
    const list = eventsByFrame.get(e.frameIndex) ?? [];
    list.push(e);
    eventsByFrame.set(e.frameIndex, list);
  }

  const pFramesByFrame = new Map<number, typeof allParticipantFrames>();
  for (const pf of allParticipantFrames) {
    const list = pFramesByFrame.get(pf.frameIndex) ?? [];
    list.push(pf);
    pFramesByFrame.set(pf.frameIndex, list);
  }

  return {
    metadata: {
      dataVersion: timeline.dataVersion ?? "",
      matchId,
      participants: timeline.participantPuuids ?? [],
    },
    info: {
      endOfGameResult: timeline.endOfGameResult ?? "",
      frameInterval: timeline.frameInterval,
      frames: frames.map((frame) => ({
        events: (eventsByFrame.get(frame.frameIndex) ?? []).map((e) => ({
          timestamp: e.timestamp,
          realTimestamp: e.realTimestamp ?? undefined,
          type: e.type as Events["type"],
          itemId: e.itemId ?? undefined,
          participantId: e.participantId ?? undefined,
          skillSlot: e.skillSlot ?? undefined,
          ward_type: e.wardType ?? undefined,
        })),
        participantFrames: Object.fromEntries(
          (pFramesByFrame.get(frame.frameIndex) ?? []).map((pf) => [
            pf.participantId,
            {
              participantId: pf.participantId,
              currentGold: pf.currentGold,
              totalGold: pf.totalGold,
              goldPerSecond: pf.goldPerSecond,
              level: pf.level,
              xp: pf.xp,
              minionsKilled: pf.minionsKilled,
              jungleMinionsKilled: pf.jungleMinionsKilled,
              timeEnemySpentControlled: pf.timeEnemySpentControlled,
              position: { x: pf.positionX, y: pf.positionY },
              championStats: {
                abilityHaste: pf.csAbilityHaste,
                abilityPower: pf.csAbilityPower,
                armor: pf.csArmor,
                armorPen: pf.csArmorPen,
                armorPenPercent: pf.csArmorPenPercent,
                attackDamage: pf.csAttackDamage,
                attackSpeed: pf.csAttackSpeed,
                bonusArmorPenPercent: pf.csBonusArmorPenPercent,
                bonusMagicPenPercent: pf.csBonusMagicPenPercent,
                ccReduction: pf.csCcReduction,
                cooldownReduction: pf.csCooldownReduction,
                health: pf.csHealth,
                healthMax: pf.csHealthMax,
                healthRegen: pf.csHealthRegen,
                lifesteal: pf.csLifesteal,
                magicPen: pf.csMagicPen,
                magicPenPercent: pf.csMagicPenPercent,
                magicResist: pf.csMagicResist,
                movementSpeed: pf.csMovementSpeed,
                omnivamp: pf.csOmnivamp,
                physicalVamp: pf.csPhysicalVamp,
                power: pf.csPower,
                powerMax: pf.csPowerMax,
                powerRegen: pf.csPowerRegen,
                spellVamp: pf.csSpellVamp,
              } satisfies ChampionStats,
              damageStats: {
                magicDamageDone: pf.dsMagicDamageDone,
                magicDamageDoneToChampions: pf.dsMagicDamageDoneToChampions,
                magicDamageTaken: pf.dsMagicDamageTaken,
                physicalDamageDone: pf.dsPhysicalDamageDone,
                physicalDamageDoneToChampions:
                  pf.dsPhysicalDamageDoneToChampions,
                physicalDamageTaken: pf.dsPhysicalDamageTaken,
                totalDamageDone: pf.dsTotalDamageDone,
                totalDamageDoneToChampions: pf.dsTotalDamageDoneToChampions,
                totalDamageTaken: pf.dsTotalDamageTaken,
                trueDamageDone: pf.dsTrueDamageDone,
                trueDamageDoneToChampions: pf.dsTrueDamageDoneToChampions,
                trueDamageTaken: pf.dsTrueDamageTaken,
              } satisfies DamageStats,
            } satisfies ParticipantFrame,
          ]),
        ),
      })),
    },
  };
}

async function writeTimelineToDb(matchId: string, data: MatchTimelineDto) {
  // Ensure the parent `matches` row exists (no-op if already there).
  await db.insert(matches).values({ matchId }).onConflictDoNothing();

  await db
    .insert(matchTimelines)
    .values({
      matchId,
      dataVersion: data.metadata.dataVersion,
      endOfGameResult: data.info.endOfGameResult,
      frameInterval: data.info.frameInterval,
      participantPuuids: data.metadata.participants,
    })
    .onConflictDoNothing();

  const frameRows = data.info.frames.map((_, frameIndex) => ({
    matchId,
    frameIndex,
    timestamp: data.info.frames[frameIndex].events[0]?.timestamp ?? frameIndex,
  }));
  if (frameRows.length > 0) {
    await db
      .insert(matchTimelineFrames)
      .values(frameRows)
      .onConflictDoNothing();
  }

  const eventRows = data.info.frames.flatMap((frame, frameIndex) =>
    frame.events.map((event, eventOrder) => ({
      matchId,
      frameIndex,
      eventOrder,
      timestamp: event.timestamp,
      realTimestamp: event.realTimestamp ?? null,
      type: event.type,
      itemId: event.itemId ?? null,
      participantId: event.participantId ?? null,
      skillSlot: event.skillSlot ?? null,
      wardType: event.ward_type ?? null,
    })),
  );
  if (eventRows.length > 0) {
    // Chunk inserts to stay safely under Postgres' bound-parameter limit,
    // same pattern used for leaderboard bulk inserts.
    const CHUNK_SIZE = 500;
    for (let i = 0; i < eventRows.length; i += CHUNK_SIZE) {
      await db
        .insert(matchTimelineEvents)
        .values(eventRows.slice(i, i + CHUNK_SIZE))
        .onConflictDoNothing();
    }
  }

  const participantFrameRows = data.info.frames.flatMap((frame, frameIndex) =>
    Object.entries(frame.participantFrames).map(([participantIdKey, pf]) => ({
      matchId,
      frameIndex,
      participantId: pf.participantId ?? Number(participantIdKey),
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

      dsMagicDamageDone: pf.damageStats.magicDamageDone,
      dsMagicDamageDoneToChampions: pf.damageStats.magicDamageDoneToChampions,
      dsMagicDamageTaken: pf.damageStats.magicDamageTaken,
      dsPhysicalDamageDone: pf.damageStats.physicalDamageDone,
      dsPhysicalDamageDoneToChampions:
        pf.damageStats.physicalDamageDoneToChampions,
      dsPhysicalDamageTaken: pf.damageStats.physicalDamageTaken,
      dsTotalDamageDone: pf.damageStats.totalDamageDone,
      dsTotalDamageDoneToChampions: pf.damageStats.totalDamageDoneToChampions,
      dsTotalDamageTaken: pf.damageStats.totalDamageTaken,
      dsTrueDamageDone: pf.damageStats.trueDamageDone,
      dsTrueDamageDoneToChampions: pf.damageStats.trueDamageDoneToChampions,
      dsTrueDamageTaken: pf.damageStats.trueDamageTaken,
    })),
  );
  if (participantFrameRows.length > 0) {
    const CHUNK_SIZE = 200; // lower than event/frame chunks — this row is ~37 columns wide, so fewer rows fit under the parameter limit per batch
    for (let i = 0; i < participantFrameRows.length; i += CHUNK_SIZE) {
      await db
        .insert(matchTimelineParticipantFrames)
        .values(participantFrameRows.slice(i, i + CHUNK_SIZE))
        .onConflictDoNothing();
    }
  }
}
