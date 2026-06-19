import { db } from "@/db";
import { accounts, rankedStats } from "@/db/schema";
import fetchSummonerFromAnyRegion from "@/actions/region";
import { delay } from "@/lib/riot";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gameName = searchParams.get("gameName");
  const tagLine = searchParams.get("tagLine");

  if (!gameName || !tagLine) {
    return NextResponse.json(
      { error: "Both gameName and tagLine are required" },
      { status: 400 },
    );
  }

  const API_KEY = process.env.RIOT_API_KEY!;

  if (!API_KEY) {
    return NextResponse.json(
      { error: "Riot API key is not configured" },
      { status: 500 },
    );
  }

  try {
    // Check if account already exists in database
    const existingAccount = await db.query.accounts.findFirst({
      where: and(
        eq(accounts.gameName, gameName),
        eq(accounts.tagLine, tagLine),
      ),
    });

    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000; // Cache for 1 hour

    if (
      existingAccount?.puuid &&
      existingAccount?.revisionDate &&
      now - existingAccount?.revisionDate < ONE_HOUR
    ) {
      const existingRankedStats = await db.query.rankedStats.findFirst({
        where: eq(rankedStats.puuid, existingAccount.puuid),
      });

      if (!existingRankedStats) {
        throw new Error("Missing ranked stats");
      }
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

    const accountUrl = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${API_KEY}`;

    const accountResponse = await fetch(accountUrl);

    if (accountResponse.status === 429) {
      await delay(60 * 1000 * 2);
    }

    if (!accountResponse.ok) {
      const errorData = await accountResponse.json();

      return NextResponse.json(
        { error: errorData.status.message || "Failed to fetch account" },
        { status: accountResponse.status },
      );
    }

    const accountData: Account = await accountResponse.json();

    let completeData: DbSummonerInfo | null = null;

    try {
      const summonerResult = await fetchSummonerFromAnyRegion(
        accountData.puuid,
      );

      if (!summonerResult) {
        return NextResponse.json(
          { error: "No summoner found for the given PUUID in any region." },
          { status: 404 },
        );
      }
      const summonerData: SummonerInfo = summonerResult.data;
      const entriesRes = await fetch(
        `https://${summonerResult.region}.api.riotgames.com/lol/league/v4/entries/by-puuid/${accountData.puuid}?api_key=${API_KEY}`,
      );

      if (!entriesRes.ok) {
        throw new Error(
          `Something went wrong while fetching entries: ${entriesRes.statusText}`,
        );
      }

      const entries: SummonerRankInfo[] = await entriesRes.json();

      // Find the ranked solo queue entry
      const soloQueueEntry = entries.find(
        (entry) => entry.queueType === "RANKED_SOLO_5x5",
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

        if (accountData && soloQueueEntry && summonerData) {
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
    } catch (error) {}

    return NextResponse.json(completeData, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
