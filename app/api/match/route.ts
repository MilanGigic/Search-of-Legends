import { db } from "@/db";
import { accounts, matches } from "@/db/schema";
import { fetchMatchDetailsInBatch } from "@/lib/actions/match-history/fetchMatchDetails";
import fetchAllMatchIds from "@/lib/actions/match-history/fetchMatchIds";
import getRegionalEndpoint from "@/lib/actions/match-history/getRegionalEndpoint";
import { eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const RIOT_API_KEY = process.env.RIOT_API_KEY;
  if (!RIOT_API_KEY) {
    return new Response("Riot API key is not set", { status: 500 });
  }

  console.log("Received GET request:", req.url);
  const { searchParams } = new URL(req.url);
  const puuid = searchParams.get("puuid");

  if (!puuid) {
    return new Response("Missing puuid parameter", { status: 400 });
  }

  const account = await db.query.accounts.findFirst({
    where: eq(accounts.puuid, puuid),
  });

  let region;

  if (account) {
    region = account.region;
    console.log("Region found in database:", region);
  }

  const REGION = getRegionalEndpoint(region!);
  if (!REGION) {
    return new Response("Invalid region", { status: 400 });
  }

  try {
    // 1. Get ALL match IDs for this puuid
    const allMatchIds = await fetchAllMatchIds(puuid, REGION);

    // 2. Check existing match IDs in DB
    const existing = await db
      .select({ matchId: matches.matchId })
      .from(matches)
      .where(inArray(matches.matchId, allMatchIds));

    const existingIds = new Set(existing.map((m) => m.matchId));
    const newMatchIds = allMatchIds.filter((id) => !existingIds.has(id));

    console.log({
      allMatchIdsCount: allMatchIds.length,
      existingIdsCount: existingIds.size,
      newMatchIdsCount: newMatchIds.length,
      sampleNewMatchIds: newMatchIds.slice(0, 5),
    });

    console.log("All matchIds, existing, newMatchIds", {
      allMatchIds,
      existing,
      newMatchIds,
    });
    const matchDetails = await fetchMatchDetailsInBatch(
      newMatchIds,
      REGION,
      puuid
    );

    return NextResponse.json({ matchDetails }, { status: 200 });
  } catch (error) {
    console.error("Error fetching match details:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch match details",
      },
      { status: 500 }
    );
  }
}
