// File: app/api/leaderboard/route.ts (or pages/api/leaderboard.ts if using Pages Router)
import { NextResponse } from "next/server";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { asc, desc, eq, or } from "drizzle-orm";

export async function GET() {
  try {
    const players = await db
      .select()
      .from(accounts)
      .where(
        or(eq(accounts.tier, "CHALLENGER"), eq(accounts.tier, "GRANDMASTER"))
      )
      .orderBy(asc(accounts.rank))
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
