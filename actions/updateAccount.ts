"use server";

import { db } from "@/db";
import { accounts, rankedStats, rankedHistory } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { updateTag } from "next/cache";

const UPDATE_COOLDOWN_MS = 60_000;

async function riotFetch<T>(url: string): Promise<T> {
  const apiKey = process.env.RIOT_API_KEY;
  if (!apiKey) throw new Error("RIOT_API_KEY is not configured");

  const res = await fetch(url, {
    headers: { "X-Riot-Token": apiKey },
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

  // Enforce the cooldown using the most recent ranked update for this account.
  const [latest] = await db
    .select({ updatedAt: rankedStats.updatedAt })
    .from(rankedStats)
    .where(eq(rankedStats.puuid, puuid))
    .orderBy(desc(rankedStats.updatedAt))
    .limit(1);

  if (latest) {
    const elapsed = Date.now() - latest.updatedAt.getTime();
    if (elapsed < UPDATE_COOLDOWN_MS) {
      const wait = Math.ceil((UPDATE_COOLDOWN_MS - elapsed) / 1000);
      return {
        ok: false as const,
        error: `Updated recently. Try again in ${wait}s.`,
      };
    }
  }

  try {
    const platform = existing.region.toLowerCase();

    const [summoner, entries] = await Promise.all([
      riotFetch<SummonerInfo>(
        `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      ),
      riotFetch<Entries[]>(
        `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`,
      ),
    ]);

    const now = new Date();

    await db.transaction(async (tx) => {
      await tx
        .update(accounts)
        .set({
          summonerLevel: summoner.summonerLevel,
          profileIconId: summoner.profileIconId,
          revisionDate: summoner.revisionDate,
        })
        .where(eq(accounts.puuid, puuid));

      for (const entry of entries) {
        const [previous] = await tx
          .select()
          .from(rankedStats)
          .where(
            and(
              eq(rankedStats.puuid, puuid),
              eq(rankedStats.queueType, entry.queueType),
            ),
          )
          .limit(1);

        const values = {
          tier: entry.tier,
          rank: entry.rank,
          leaguePoints: entry.leaguePoints,
          wins: entry.wins,
          losses: entry.losses,
        };

        await tx
          .insert(rankedStats)
          .values({
            puuid,
            queueType: entry.queueType,
            region: existing.region,
            ...values,
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: [rankedStats.puuid, rankedStats.queueType],
            set: { ...values, updatedAt: now },
          });

        // Only snapshot when something actually changed.
        const changed =
          !previous ||
          previous.tier !== entry.tier ||
          previous.rank !== entry.rank ||
          previous.leaguePoints !== entry.leaguePoints ||
          previous.wins !== entry.wins ||
          previous.losses !== entry.losses;

        if (changed) {
          await tx.insert(rankedHistory).values({
            puuid,
            queueType: entry.queueType,
            ...values,
            capturedAt: now,
          });
        }
      }
    });

    updateTag(`account-${existing.gameName}-${existing.tagLine}`);

    return { ok: true as const };
  } catch (err) {
    console.error("[updateAccountAction] failed:", err);
    return {
      ok: false as const,
      error: "Something went wrong. Please try again.",
    };
  }
}
