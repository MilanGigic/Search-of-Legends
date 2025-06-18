import { db } from "@/db";
import { accounts } from "@/db/schema";
import fetchSummonerFromAnyRegion from "@/lib/actions/region";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log("Received GET request:", req.url);

  const { searchParams } = new URL(req.url);
  const gameName = searchParams.get("gameName");
  const tagLine = searchParams.get("tagLine");

  console.log("Query params:", { gameName, tagLine });

  if (!gameName || !tagLine) {
    console.log("Missing gameName or tagLine");
    return NextResponse.json(
      { error: "Both gameName and tagLine are required" },
      { status: 400 }
    );
  }

  const API_KEY = process.env.RIOT_API_KEY!;

  if (!API_KEY) {
    console.log("Riot API key is not configured");
    return NextResponse.json(
      { error: "Riot API key is not configured" },
      { status: 500 }
    );
  }

  try {
    // Check if account already exists in database
    const existingAccount = await db
      .select()
      .from(accounts)
      .where(
        and(eq(accounts.gameName, gameName), eq(accounts.tagLine, tagLine))
      )
      .then((rows) => rows[0]);

    console.log("Existing account in DB:", existingAccount);

    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000; // Cache for 1 hour

    if (
      existingAccount?.summonerId &&
      existingAccount?.lastUpdated &&
      now - existingAccount?.lastUpdated < ONE_HOUR
    ) {
      console.log("Returning cached complete account data");
      return NextResponse.json({
        puuid: existingAccount?.puuid,
        gameName: existingAccount?.gameName,
        tagLine: existingAccount?.tagLine,
        id: existingAccount.summonerId,
        region: existingAccount.region,
        accountId: existingAccount.accountId,
        profileIconId: existingAccount.profileIconId,
        revisionDate: existingAccount.revisionDate,
        summonerLevel: existingAccount.summonerLevel,
        tier: existingAccount.tier,
        rank: existingAccount.rank,
        leaguePoints: existingAccount.leaguePoints,
        wins: existingAccount.wins,
        losses: existingAccount.losses,
        lastUpdated: existingAccount.lastUpdated,
      });
    }
    ``;

    const accountUrl = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${API_KEY}`;

    console.log("Constructed Riot API URL:", accountUrl);

    const accountResponse = await fetch(accountUrl);
    console.log("Riot API accountResponse status:", accountResponse.status);

    if (!accountResponse.ok) {
      const errorData = await accountResponse.json();
      console.log("Riot API error:", errorData);
      return NextResponse.json(
        { error: errorData.status.message || "Failed to fetch account" },
        { status: accountResponse.status }
      );
    }

    const accountData: Account = await accountResponse.json();
    console.log("Fetched account data:", accountData);

    let completeData: DbSummonerInfo | null = null;

    try {
      const summonerResult = await fetchSummonerFromAnyRegion(
        accountData.puuid
      );
      const summonerData: SummonerInfo = summonerResult.data;

      console.log(`Found summoner in region: ${summonerResult.region}`);

      const entriesRes = await fetch(
        `https://${summonerResult.region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerData.id}?api_key=${API_KEY}`
      );

      console.log("Entries response status:", entriesRes.status);

      if (!entriesRes.ok) {
        console.log(
          "Fetching summoner entries failed:",
          entriesRes.status,
          entriesRes.statusText
        );
      }

      const entries: SummonerRankInfo[] = await entriesRes.json();

      // Find the ranked solo queue entry
      const soloQueueEntry = entries.find(
        (entry) => entry.queueType === "RANKED_SOLO_5x5"
      );

      console.log("Riot entries:", entries);

      if (summonerResult && soloQueueEntry) {
        completeData = {
          puuid: accountData.puuid,
          gameName: accountData.gameName,
          tagLine: accountData.tagLine,
          region: accountData.region,
          accountId: summonerData.accountId,
          profileIconId: summonerData.profileIconId,
          summonerLevel: summonerData.summonerLevel,
          summonerId: summonerData.id,
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
              summonerId: summonerData.id,
              accountId: summonerData.accountId,
              profileIconId: summonerData.profileIconId,
              tier: soloQueueEntry.tier,
              rank: soloQueueEntry.rank,
              leaguePoints: soloQueueEntry.leaguePoints,
              wins: soloQueueEntry.wins,
              losses: soloQueueEntry.losses,
              revisionDate: summonerData.revisionDate,
              summonerLevel: summonerData.summonerLevel,
              lastUpdated: Date.now(),
            })
            .onConflictDoUpdate({
              target: [accounts.puuid],
              set: {
                gameName: accountData.gameName,
                tagLine: accountData.tagLine,
                region: summonerResult.region,
                summonerId: summonerData.id,
                accountId: summonerData.accountId,
                profileIconId: summonerData.profileIconId,
                tier: soloQueueEntry.tier,
                rank: soloQueueEntry.rank,
                leaguePoints: soloQueueEntry.leaguePoints,
                wins: soloQueueEntry.wins,
                losses: soloQueueEntry.losses,
                revisionDate: summonerData.revisionDate,
                summonerLevel: summonerData.summonerLevel,
                lastUpdated: Date.now(),
              },
            });
        }
      }

      // Store the region in your database for future use
      // You can add a 'region' column to your accounts table
    } catch (error) {
      console.log("Failed to fetch summoner from any region:", error);
    }

    return NextResponse.json(completeData, { status: 200 });
  } catch (error) {
    console.log("Error occurred:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
