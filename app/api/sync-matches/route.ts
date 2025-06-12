// app/api/sync-matches/route.ts
import { NextResponse } from "next/server";
import { syncAllPlayersMatches } from "@/lib/actions/riot-sync-services";

export async function POST() {
  try {
    await syncAllPlayersMatches(); // 🔁 Sync all players in the DB
    return NextResponse.json({ message: "Sync started" });
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
