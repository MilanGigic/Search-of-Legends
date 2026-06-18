import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { accounts, rankedStats } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const players = await db
      .select({
        puuid: accounts.puuid,
        gameName: accounts.gameName,
        tagLine: accounts.tagLine,
        region: accounts.region,
        summonerLevel: accounts.summonerLevel,
        profileIconId: accounts.profileIconId,

        queueType: rankedStats.queueType,
        tier: rankedStats.tier,
        rank: rankedStats.rank,
        leaguePoints: rankedStats.leaguePoints,
        wins: rankedStats.wins,
        losses: rankedStats.losses,

        revisionDate: accounts.revisionDate,
        updatedAt: rankedStats.updatedAt,
      })
      .from(rankedStats)
      .innerJoin(accounts, eq(rankedStats.puuid, accounts.puuid))
      .orderBy(desc(rankedStats.leaguePoints))
      .limit(500); // Get top 500 players

    return NextResponse.json(players);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 },
    );
  }
}
