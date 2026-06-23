import { db } from "@/db";
import {
  matches,
  matchDetails,
  matchParticipants,
  matchTeams,
  matchParticipantPerks,
  matchParticipantPerkStyles,
  matchParticipantPerkSelections,
} from "@/db/schema";
import { eq } from "drizzle-orm";
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
    const cached = await readRunesDataFromDb(matchId);
    if (cached) {
      return NextResponse.json(cached, { status: 200 });
    }

    const RIOT_API_KEY = process.env.RIOT_API_KEY;
    if (!RIOT_API_KEY) {
      console.error("Riot API Key not found");
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 },
      );
    }

    const url = `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${RIOT_API_KEY}`;
    const res = await fetch(url);

    if (!res.ok) {
      const body = await res.text();
      console.error(
        `[runes-page] Riot fetch failed: ${res.status} ${res.statusText} — ${body}`,
      );
      return NextResponse.json(
        { error: `Riot API error: ${res.status}` },
        { status: res.status },
      );
    }

    const data: RiotMatchDto = await res.json();

    try {
      await writePerksToDb(matchId, data);
    } catch (writeErr) {
      console.error(
        `[runes-page] Failed to cache perks for ${matchId}:`,
        writeErr,
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[runes-page] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function readRunesDataFromDb(
  matchId: string,
): Promise<RiotMatchDto | null> {
  const participants = await db
    .select()
    .from(matchParticipants)
    .where(eq(matchParticipants.matchId, matchId));

  if (participants.length === 0) return null; // base match data not cached yet either

  const perksRows = await db
    .select()
    .from(matchParticipantPerks)
    .where(eq(matchParticipantPerks.matchId, matchId));

  if (perksRows.length !== participants.length) return null;

  const [styleRows, selectionRows] = await Promise.all([
    db
      .select()
      .from(matchParticipantPerkStyles)
      .where(eq(matchParticipantPerkStyles.matchId, matchId)),
    db
      .select()
      .from(matchParticipantPerkSelections)
      .where(eq(matchParticipantPerkSelections.matchId, matchId)),
  ]);

  const stylesByParticipant = new Map<number, typeof styleRows>();
  for (const s of styleRows) {
    const list = stylesByParticipant.get(s.participantId) ?? [];
    list.push(s);
    stylesByParticipant.set(s.participantId, list);
  }

  const selectionsByStyle = new Map<string, typeof selectionRows>();
  for (const sel of selectionRows) {
    const key = `${sel.participantId}:${sel.description}`;
    const list = selectionsByStyle.get(key) ?? [];
    list.push(sel);
    selectionsByStyle.set(key, list);
  }

  const participantsWithPerks = participants.map((p) => {
    const perks = perksRows.find((pr) => pr.participantId === p.participantId)!;
    const styles = (stylesByParticipant.get(p.participantId!) ?? [])
      .sort((a, b) => (a.description < b.description ? -1 : 1))
      .map((style) => {
        const selections = (
          selectionsByStyle.get(`${p.participantId}:${style.description}`) ?? []
        )
          .sort((a, b) => a.selectionOrder - b.selectionOrder)
          .map((sel) => ({
            perk: sel.perk,
            var1: sel.var1,
            var2: sel.var2,
            var3: sel.var3,
          }));

        return {
          description: style.description,
          style: style.style,
          selections,
        };
      });

    return {
      ...p,
      perks: {
        statPerks: {
          defense: perks.statPerkDefense,
          flex: perks.statPerkFlex,
          offense: perks.statPerkOffense,
        },
        styles,
      },
    };
  });

  return {
    metadata: { matchId },
    info: {
      participants: participantsWithPerks,
    },
  } as unknown as RiotMatchDto;
}

async function writePerksToDb(matchId: string, data: RiotMatchDto) {
  await db.insert(matches).values({ matchId }).onConflictDoNothing();

  const perksRows = data.info.participants.map((p: ParticipantData) => ({
    matchId,
    participantId: p.participantId!,
    statPerkDefense: p.perks?.statPerks?.defense ?? null,
    statPerkFlex: p.perks?.statPerks?.flex ?? null,
    statPerkOffense: p.perks?.statPerks?.offense ?? null,
  }));
  if (perksRows.length > 0) {
    await db
      .insert(matchParticipantPerks)
      .values(perksRows)
      .onConflictDoNothing();
  }

  const styleRows = data.info.participants.flatMap((p: ParticipantData) =>
    (p.perks?.styles ?? []).map((style) => ({
      matchId,
      participantId: p.participantId!,
      description: style.description,
      style: style.style,
    })),
  );
  if (styleRows.length > 0) {
    await db
      .insert(matchParticipantPerkStyles)
      .values(styleRows)
      .onConflictDoNothing();
  }

  const selectionRows = data.info.participants.flatMap((p: ParticipantData) =>
    (p.perks?.styles ?? []).flatMap((style) =>
      style.selections.map((sel, selectionOrder) => ({
        matchId,
        participantId: p.participantId!,
        description: style.description,
        selectionOrder,
        perk: sel.perk,
        var1: sel.var1 ?? null,
        var2: sel.var2 ?? null,
        var3: sel.var3 ?? null,
      })),
    ),
  );
  if (selectionRows.length > 0) {
    await db
      .insert(matchParticipantPerkSelections)
      .values(selectionRows)
      .onConflictDoNothing();
  }
}
