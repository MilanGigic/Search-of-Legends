"use server";

import { db } from "@/db";
import { matches } from "@/db/schema";
import { inArray } from "drizzle-orm";

export default async function checkDbGames(puuid: string, matchIds: string[]) {
  if (!puuid || !matchIds) {
    throw new Error("Invalid parameters");
  }

  const matchIdsCheck = await db
    .select()
    .from(matches)
    .where(inArray(matches.matchId, matchIds));

  try {
  } catch (error) {}
}
