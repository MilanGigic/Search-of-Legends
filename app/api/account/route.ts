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

  const url = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
    gameName
  )}/${encodeURIComponent(tagLine)}?api_key=${API_KEY}`;

  console.log("Constructed Riot API URL:", url);

  if (!url) {
    console.log("Failed to construct API URL");
    return NextResponse.json(
      { error: "Failed to construct API URL" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(url);
    console.log("Riot API response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.log("Riot API error:", errorData);
      return NextResponse.json(
        { error: errorData.status.message || "Failed to fetch account" },
        { status: response.status }
      );
    }

    const data: Account = await response.json();
    console.log("Fetched account data:", data);

    // Check if account already exists in database
    const existingAccount = await db.query.accounts.findFirst({
      where: eq(accounts.puuid, data.puuid),
    });

    console.log("Existing account in DB:", existingAccount);

    if (!existingAccount) {
      console.log(
        "Account not found in DB, inserting new account",
        data.puuid,
        data.gameName,
        data.tagLine
      );
      await db.insert(accounts).values({
        puuid: data.puuid,
        gameName: data.gameName,
        tagLine: data.tagLine,
      });
      console.log("Inserted new account into DB");
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.log("Error occurred:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
