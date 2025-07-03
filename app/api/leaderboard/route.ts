// File: app/api/leaderboard/route.ts (or pages/api/leaderboard.ts if using Pages Router)
import { NextResponse } from "next/server";
import { db } from "@/db";
import { leaderboardPlayers } from "@/db/schema";
import { asc, desc } from "drizzle-orm";

export async function GET() {
  try {
    const players = await db
      .select()
      .from(leaderboardPlayers)
      .orderBy(asc(leaderboardPlayers.rank))
      .limit(500); // Get top 500 players

    return NextResponse.json(players);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
