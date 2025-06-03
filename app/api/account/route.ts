import { db } from "@/db";
import { accounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

interface Account {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gameName = searchParams.get("gameName");
  const tagLine = searchParams.get("tagLine");

  if (!gameName || !tagLine) {
    return NextResponse.json(
      { error: "Both gameName and tagLine are required" },
      { status: 400 }
    );
  }

  const API_KEY = process.env.RIOT_API_KEY!;

  if (!API_KEY) {
    return NextResponse.json(
      { error: "Riot API key is not configured" },
      { status: 500 }
    );
  }

  const url = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
    gameName
  )}/${encodeURIComponent(tagLine)}?api_key=${API_KEY}`;

  if (!url) {
    return NextResponse.json(
      { error: "Failed to construct API URL" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.status.message || "Failed to fetch account" },
        { status: response.status }
      );
    }

    const data: Account = await response.json();

    // Check if account already exists in database
    const existingAccount = await db.query.accounts.findFirst({
      where: eq(accounts.puuid, data.puuid),
    });

    if (!existingAccount) {
      await db.insert(accounts).values({
        puuid: data.puuid,
        gameName: data.gameName,
        tagLine: data.tagLine,
      });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
