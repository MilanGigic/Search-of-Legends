// File: app/api/leaderboard/route.ts (or pages/api/leaderboard.ts if using Pages Router)
import { NextResponse } from "next/server";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { eq, or, sql } from "drizzle-orm";

export async function GET() {
  try {
    const players = await db
      .select()
      .from(accounts)
      .where(
        or(eq(accounts.tier, "CHALLENGER"), eq(accounts.tier, "GRANDMASTER"))
      )
      .orderBy(
        sql`CASE 
        WHEN ${accounts.rank} ~ '^[0-9]+$' THEN CAST(${accounts.rank} AS INTEGER) END`
      )
      .limit(502); // Get top 500 players



    return NextResponse.json(players);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
