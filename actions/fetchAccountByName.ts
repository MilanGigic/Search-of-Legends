"use server";

import { db } from "@/db";
import { rankedHistory } from "@/db/schema";
import { eq, desc, gte, and } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

const HISTORY_WINDOW_DAYS = 30;
const DEFAULT_QUEUE_TYPE = "RANKED_SOLO_5x5";

export interface RankedHistoryEntry {
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  capturedAt: Date;
}

export interface AccountWithHistory extends DbSummonerInfo {
  rankedHistory: RankedHistoryEntry[];
}

export async function fetchAccountByName(
  gameName: string,
  tagLine: string,
  queueType: string = DEFAULT_QUEUE_TYPE,
): Promise<AccountWithHistory> {
  "use cache";
  cacheLife("hours");
  cacheTag("account-data", `account-${gameName}-${tagLine}`);

  if (!gameName || !tagLine) throw new Error("Name required!");

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const url = `${BASE_URL}/api/account?gameName=${gameName}&tagLine=${tagLine}`;

  const accountRes = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });

  if (!accountRes.ok) {
    throw new Error(
      `Fetching ${gameName}#${tagLine} account went wrong: ${accountRes.status} ${accountRes.statusText}`,
    );
  }

  const accountData: DbSummonerInfo = await accountRes.json();

  const windowStart = new Date(
    Date.now() - HISTORY_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  );

  const history = await db
    .select({
      tier: rankedHistory.tier,
      rank: rankedHistory.rank,
      leaguePoints: rankedHistory.leaguePoints,
      wins: rankedHistory.wins,
      losses: rankedHistory.losses,
      capturedAt: rankedHistory.capturedAt,
    })
    .from(rankedHistory)
    .where(
      and(
        eq(rankedHistory.puuid, accountData.puuid),
        eq(rankedHistory.queueType, queueType),
        gte(rankedHistory.capturedAt, windowStart),
      ),
    )
    .orderBy(desc(rankedHistory.capturedAt));

  return {
    ...accountData,
    rankedHistory: history,
  };
}
