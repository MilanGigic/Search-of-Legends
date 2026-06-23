import { db } from "@/db";
import { accounts, rankedStats } from "@/db/schema";
import fetchSummonerFromAnyRegion from "@/actions/region";
import { delay } from "@/lib/riot";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log("[API][GET /api/account] - Incoming request", req.url);

  const { searchParams } = new URL(req.url);
  const gameName = searchParams.get("gameName");
  const tagLine = searchParams.get("tagLine");

  console.log("[API][GET /api/account] - Params:", { gameName, tagLine });

  if (!gameName || !tagLine) {
    console.log("[API][GET /api/account] - Missing required params");
    return NextResponse.json(
      { error: "Both gameName and tagLine are required" },
      { status: 400 },
    );
  }

  const API_KEY = process.env.RIOT_API_KEY!;

  if (!API_KEY) {
    console.error("[API][GET /api/account] - Riot API key is not configured");
    return NextResponse.json(
      { error: "Riot API key is not configured" },
      { status: 500 },
    );
  }

  try {
    // Check if account already exists in database
    console.log(
      "[API][GET /api/account] - Checking for existing account in DB...",
    );
    const existingAccount = await db.query.accounts.findFirst({
      where: and(
        eq(accounts.gameName, gameName),
        eq(accounts.tagLine, tagLine),
      ),
    });

    console.log("[API][GET /api/account] - Existing account:", existingAccount);

    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000; // Cache for 1 hour

    if (existingAccount?.puuid) {
      console.log("[API][GET /api/account] - Returning cached account info");

      const existingRankedStats = await db.query.rankedStats.findFirst({
        where: eq(rankedStats.puuid, existingAccount.puuid),
      });

      console.log(
        "[API][GET /api/account] - Existing ranked stats:",
        existingRankedStats,
      );

      if (!existingRankedStats) {
        const rankedStatsRes = await fetch(
          `https://${existingAccount.region}.api.riotgames.com/lol/league/v4/entries/by-puuid/${existingAccount.puuid}?api_key=${API_KEY}`,
        );

        if (!rankedStatsRes.ok) {
          console.error(
            `[API][GET /api/account] - Fetching ranked stats for ${existingAccount.puuid} went wrong: ${rankedStatsRes.statusText}`,
          );
          throw new Error("Missing ranked stats");
        }

        const rankedStatsData = await rankedStatsRes.json();

        const rankedEntry: Entries = rankedStatsData.find(
          (stats: Entries) => stats.queueType === "RANKED_SOLO_5x5",
        );

        await db.insert(rankedStats).values({
          puuid: rankedEntry.puuid,
          leaguePoints: rankedEntry.leaguePoints,
          losses: rankedEntry.losses,
          wins: rankedEntry.wins,
          queueType: rankedEntry.queueType,
          rank: rankedEntry.rank,
          region: existingAccount.region,
          tier: rankedEntry.tier,
        });

        if (rankedStatsData) {
          return NextResponse.json({
            puuid: existingAccount?.puuid,
            gameName: existingAccount?.gameName,
            tagLine: existingAccount?.tagLine,
            region: existingAccount.region,
            profileIconId: existingAccount.profileIconId,
            revisionDate: existingAccount.revisionDate,
            summonerLevel: existingAccount.summonerLevel,
            tier: rankedStatsData.tier,
            rank: rankedStatsData.rank,
            leaguePoints: rankedStatsData.leaguePoints,
            wins: rankedStatsData.wins,
            losses: rankedStatsData.losses,
            lastUpdated: rankedStatsData.updatedAt,
          });
        }
      } else {
        return NextResponse.json({
          puuid: existingAccount?.puuid,
          gameName: existingAccount?.gameName,
          tagLine: existingAccount?.tagLine,
          region: existingAccount.region,
          profileIconId: existingAccount.profileIconId,
          revisionDate: existingAccount.revisionDate,
          summonerLevel: existingAccount.summonerLevel,
          tier: existingRankedStats.tier,
          rank: existingRankedStats.rank,
          leaguePoints: existingRankedStats.leaguePoints,
          wins: existingRankedStats.wins,
          losses: existingRankedStats.losses,
          lastUpdated: existingRankedStats.updatedAt,
        });
      }
    }

    const accountUrl = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${API_KEY}`;
    console.log(
      "[API][GET /api/account] - Fetching from RIOT API:",
      accountUrl,
    );

    const accountResponse = await fetch(accountUrl);

    if (accountResponse.status === 429) {
      console.warn(
        "[API][GET /api/account] - Rate limited (429). Delaying 2 minutes...",
      );
      await delay(60 * 1000 * 2);
    }

    if (!accountResponse.ok) {
      const errorData = await accountResponse.json();
      console.error(
        "[API][GET /api/account] - Failed fetch",
        accountResponse.status,
        errorData,
      );
      return NextResponse.json(
        { error: errorData.status?.message || "Failed to fetch account" },
        { status: accountResponse.status },
      );
    }

    const accountData: Account = await accountResponse.json();
    console.log(
      "[API][GET /api/account] - RIOT API Account Data:",
      accountData,
    );

    let completeData: DbSummonerInfo | null = null;

    try {
      console.log("[API][GET /api/account] - Fetching summoner for region...");
      const summonerResult = await fetchSummonerFromAnyRegion(
        accountData.puuid,
      );

      console.log("[API][GET /api/account] - Summoner Result:", summonerResult);

      if (!summonerResult) {
        console.error("[API][GET /api/account] - No summoner found for puuid");
        return NextResponse.json(
          { error: "No summoner found for the given PUUID in any region." },
          { status: 404 },
        );
      }
      const summonerData: SummonerInfo = summonerResult.data;
      console.log("[API][GET /api/account] - Summoner Data:", summonerData);

      const entriesUrl = `https://${summonerResult.region}.api.riotgames.com/lol/league/v4/entries/by-puuid/${accountData.puuid}?api_key=${API_KEY}`;
      console.log(
        "[API][GET /api/account] - Fetching ranked entries:",
        entriesUrl,
      );
      const entriesRes = await fetch(entriesUrl);

      if (!entriesRes.ok) {
        console.error(
          "[API][GET /api/account] - Error fetching entries:",
          entriesRes.status,
          entriesRes.statusText,
        );
        throw new Error(
          `Something went wrong while fetching entries: ${entriesRes.statusText}`,
        );
      }

      const entries: SummonerRankInfo[] = await entriesRes.json();
      console.log(
        "[API][GET /api/account] - Summoner ranked entries:",
        entries,
      );

      // Find the ranked solo queue entry
      const soloQueueEntry = entries.find(
        (entry) => entry.queueType === "RANKED_SOLO_5x5",
      );
      console.log(
        "[API][GET /api/account] - Solo ranked entry:",
        soloQueueEntry,
      );

      if (summonerResult && soloQueueEntry) {
        completeData = {
          puuid: accountData.puuid,
          gameName: accountData.gameName,
          tagLine: accountData.tagLine,
          region: summonerResult.region,
          profileIconId: summonerData.profileIconId,
          summonerLevel: summonerData.summonerLevel,
          tier: soloQueueEntry.tier,
          rank: soloQueueEntry.rank,
          leaguePoints: soloQueueEntry.leaguePoints,
          wins: soloQueueEntry.wins,
          losses: soloQueueEntry.losses,
          revisionDate: summonerData.revisionDate,
          lastUpdated: Date.now(),
        };

        console.log(
          "[API][GET /api/account] - Complete Data for DB insert/update:",
          completeData,
        );

        if (accountData && soloQueueEntry && summonerData) {
          console.log("[API][GET /api/account] - Upserting account to DB...");
          await db
            .insert(accounts)
            .values({
              puuid: accountData.puuid,
              gameName: accountData.gameName,
              tagLine: accountData.tagLine,
              region: summonerResult.region,
              profileIconId: summonerData.profileIconId,
              revisionDate: summonerData.revisionDate,
              summonerLevel: summonerData.summonerLevel,
            })
            .onConflictDoUpdate({
              target: [accounts.puuid],
              set: {
                gameName: accountData.gameName,
                tagLine: accountData.tagLine,
                region: summonerResult.region,
                profileIconId: summonerData.profileIconId,
                revisionDate: summonerData.revisionDate,
                summonerLevel: summonerData.summonerLevel,
              },
            });
        }
      }
    } catch (error) {
      console.error(
        "[API][GET /api/account] - Error inside summoner/entry fetch block",
        error,
      );
      throw error;
    }

    console.log(
      "[API][GET /api/account] - Returning complete data:",
      completeData,
    );
    return NextResponse.json(completeData, { status: 200 });
  } catch (error) {
    console.error("[API][GET /api/account] - Fatal error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
