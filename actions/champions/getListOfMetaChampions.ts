import { db } from "@/db";
import { matchParticipants } from "@/db/schema";

export async function getListOfMetaChampions() {
  const data = await db.select().from(matchParticipants);
}
