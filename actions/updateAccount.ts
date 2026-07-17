"use server";

import { db } from "@/db";
import { accounts, rankedStats, rankedHistory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

const UPDATE_COOLDOWN_MS = 60_000;
const RIOT_API_KEY = process.env.RIOT_API_KEY!;

// TODO: swap this for your existing rate-limited Riot fetch helper
// (the queueTail-based one in lib/riot.ts) if you have one — see note below.
async function riotFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "X-Riot-Token": RIOT_API_KEY },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Riot API request failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function updateAccountAction(puuid: string) {
  const existing = await db.query.accounts.findFirst({
    where: eq(accounts.puuid, puuid),
  });

  if (!existing) {
    return { ok: false as const, error: "Account not found." };
  }

  // if (existing.lastSyncedAt) {
  //   const msSinceLastUpdate = Date.now() - existing.lastSyncedAt.getTime();
  //   if (msSinceLastUpdate < UPDATE_COOLDOWN_MS) {
  //     const secondsLeft = Math.ceil(
  //       (UPDATE_COOLDOWN_MS - msSinceLastUpdate) / 1000,
  //     );
  //     return {
  //       ok: false as const,
  //       error: `Please wait ${secondsLeft}s before updating again.`,
  //     };
  //   }
  // }

  try {
    const platform = existing.region.toLowerCase();

    const summoner = await riotFetch<SummonerInfo>(
      `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
    );

    const entries = await riotFetch<Entries[]>(
      `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`,
    );

    const now = new Date();

    await db
      .update(accounts)
      .set({
        summonerLevel: summoner.summonerLevel,
        profileIconId: summoner.profileIconId,
        revisionDate: summoner.revisionDate,
      })
      .where(eq(accounts.puuid, puuid));

    for (const entry of entries) {
      await db
        .insert(rankedStats)
        .values({
          puuid,
          queueType: entry.queueType,
          region: existing.region,
          tier: entry.tier,
          rank: entry.rank,
          leaguePoints: entry.leaguePoints,
          wins: entry.wins,
          losses: entry.losses,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [rankedStats.puuid, rankedStats.queueType],
          set: {
            tier: entry.tier,
            rank: entry.rank,
            leaguePoints: entry.leaguePoints,
            wins: entry.wins,
            losses: entry.losses,
            updatedAt: now,
          },
        });

      // rankedHistory already exists specifically for this — one snapshot
      // per manual sync gives you a real LP-over-time trail for free
      await db.insert(rankedHistory).values({
        puuid,
        queueType: entry.queueType,
        tier: entry.tier,
        rank: entry.rank,
        leaguePoints: entry.leaguePoints,
        wins: entry.wins,
        losses: entry.losses,
        capturedAt: now,
      });
    }

    revalidateTag(
      "account-data",
      `account-${existing.gameName}-${existing.tagLine}`,
    );

    return { ok: true as const };
  } catch (err) {
    console.error("[updateAccountAction] failed:", err);
    return {
      ok: false as const,
      error: "Something went wrong. Please try again.",
    };
  }
}
