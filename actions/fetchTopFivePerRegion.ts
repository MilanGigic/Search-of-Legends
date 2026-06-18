"use server";
import { db } from "@/db";
import { topFivePerRegion } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function fetchTopFivePerRegion(selectedRegion: string) {
  return await db
    .select()
    .from(topFivePerRegion)
    .where(eq(topFivePerRegion.region, selectedRegion))
    .limit(5);
}
