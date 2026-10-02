import { db } from "@/db";
import { accounts, rankedStats } from "@/db/schema";
import fetchSummonerFromAnyRegion from "@/actions/region";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const LOG = "[API][GET /api/account]";
const ONE_HOUR = 60 * 60 * 1000; // Ranked stats are refreshed after 1 hour
const SOLO_QUEUE = "RANKED_SOLO_5x5";
const ACCOUNT_CLUSTERS = ["europe", "americas", "asia"] as const;

type AccountRow = typeof accounts.$inferSelect;
type StatsRow = typeof rankedStats.$inferSelect;

// The key goes in a header, so it never ends up in URLs or logs.
function riotFetch(url: string) {
  return fetch(url, {
    headers: { "X-Riot-Token": process.env.RIOT_API_KEY! },
  });
}

// Tries each routing cluster. Returns the first response that isn't a 404
// (success, 429, or a real error), or null if no cluster knows the account.
async function fetchAccountByRiotId(gameName: string, tagLine: string) {
  for (const cluster of ACCOUNT_CLUSTERS) {
    const res = await riotFetch(
      `https://${cluster}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
    );
    if (res.status !== 404) return res;
  }
  return null;
}

// Returns the solo queue entry, or null if the player is unranked.
async function getSoloEntry(region: string, puuid: string) {
  const res = await riotFetch(
    `https://${region}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`,
  );
  if (!res.ok) throw new Error(`Entries fetch failed: ${res.statusText}`);
  const entries: SummonerRankInfo[] = await res.json();
  return entries.find((e) => e.queueType === SOLO_QUEUE) ?? null;
}

// Upserts on the composite key (puuid, queueType) and returns the saved row.
// updatedAt is set explicitly because defaultNow() only applies on insert.
async function saveSoloStats(
  puuid: string,
  region: string,
  entry: SummonerRankInfo,
) {
  const values = {
    region,
    tier: entry.tier,
    rank: entry.rank,
    leaguePoints: entry.leaguePoints,
    wins: entry.wins,
    losses: entry.losses,
  };

  const [row] = await db
    .insert(rankedStats)
    .values({ puuid, queueType: entry.queueType, ...values })
    .onConflictDoUpdate({
      target: [rankedStats.puuid, rankedStats.queueType],
      set: { ...values, updatedAt: new Date() },
    })
    .returning();

  return row;
}

// Unranked players get an object with null ranked fields.
function buildResponse(account: AccountRow, stats: StatsRow | null) {
  return {
    puuid: account.puuid,
    gameName: account.gameName,
    tagLine: account.tagLine,
    region: account.region,
    profileIconId: account.profileIconId,
    revisionDate: account.revisionDate,
    summonerLevel: account.summonerLevel,
    tier: stats?.tier ?? null,
    rank: stats?.rank ?? null,
    leaguePoints: stats?.leaguePoints ?? null,
    wins: stats?.wins ?? null,
    losses: stats?.losses ?? null,
    lastUpdated: stats?.updatedAt ?? null, // ISO string once serialized
  };
}

export async function GET(req: NextRequest) {
  console.log(`${LOG} - Incoming request`, req.nextUrl.pathname);

  const { searchParams } = new URL(req.url);
  const gameName = searchParams.get("gameName");
  const tagLine = searchParams.get("tagLine");

  if (!gameName || !tagLine) {
    return NextResponse.json(
      { error: "Both gameName and tagLine are required" },
      { status: 400 },
    );
  }

  if (!process.env.RIOT_API_KEY) {
    console.error(`${LOG} - Riot API key is not configured`);
    return NextResponse.json(
      { error: "Riot API key is not configured" },
      { status: 500 },
    );
  }

  try {
    // 1. Known account: serve from the DB, refreshing stale or missing stats.
    const existingAccount = await db.query.accounts.findFirst({
      where: and(
        eq(accounts.gameName, gameName),
        eq(accounts.tagLine, tagLine),
      ),
    });

    if (existingAccount) {
      let stats =
        (await db.query.rankedStats.findFirst({
          where: and(
            eq(rankedStats.puuid, existingAccount.puuid),
            eq(rankedStats.queueType, SOLO_QUEUE),
          ),
        })) ?? null;

      const isStale =
        stats !== null && Date.now() - stats.updatedAt.getTime() > ONE_HOUR;

      if (!stats || isStale) {
        try {
          const entry = await getSoloEntry(
            existingAccount.region,
            existingAccount.puuid,
          );
          // No entry (unranked or season reset) keeps whatever row we have.
          if (entry) {
            stats = await saveSoloStats(
              existingAccount.puuid,
              existingAccount.region,
              entry,
            );
          }
        } catch (error) {
          // With no stats at all we have nothing to serve; otherwise
          // fall back to the stale row.
          if (!stats) throw error;
          console.warn(`${LOG} - Refresh failed, serving stale stats`, error);
        }
      }

      return NextResponse.json(buildResponse(existingAccount, stats));
    }

    // 2. New account: look it up on Riot.
    const accountRes = await fetchAccountByRiotId(gameName, tagLine);

    if (!accountRes) {
      return NextResponse.json(
        { error: "Riot account not found" },
        { status: 404 },
      );
    }

    if (!accountRes.ok) {
      const errorData = await accountRes.json().catch(() => null);
      const retryAfter = accountRes.headers.get("Retry-After");
      console.error(`${LOG} - Account fetch failed`, accountRes.status);

      // Rate limited: pass it through and let the client retry.
      return NextResponse.json(
        { error: errorData?.status?.message || "Failed to fetch account" },
        {
          status: accountRes.status,
          headers: retryAfter ? { "Retry-After": retryAfter } : undefined,
        },
      );
    }

    const accountData: Account = await accountRes.json();

    const summonerResult = await fetchSummonerFromAnyRegion(accountData.puuid);

    if (!summonerResult) {
      return NextResponse.json(
        { error: "No summoner found for the given PUUID in any region." },
        { status: 404 },
      );
    }

    const summonerData: SummonerInfo = summonerResult.data;
    const soloEntry = await getSoloEntry(
      summonerResult.region,
      accountData.puuid,
    );

    // Always save the account, ranked or not.
    const accountValues: AccountRow = {
      puuid: accountData.puuid,
      gameName: accountData.gameName,
      tagLine: accountData.tagLine,
      region: summonerResult.region,
      profileIconId: summonerData.profileIconId,
      revisionDate: summonerData.revisionDate,
      summonerLevel: summonerData.summonerLevel,
    };

    await db
      .insert(accounts)
      .values(accountValues)
      .onConflictDoUpdate({
        target: [accounts.puuid],
        set: accountValues,
      });

    // Only the ranked data depends on the entry existing.
    const savedStats = soloEntry
      ? await saveSoloStats(accountData.puuid, summonerResult.region, soloEntry)
      : null;

    return NextResponse.json(buildResponse(accountValues, savedStats), {
      status: 200,
    });
  } catch (error) {
    console.error(`${LOG} - Fatal error:`, error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
