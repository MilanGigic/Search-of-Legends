import { pgTable, varchar } from "drizzle-orm/pg-core";
import { accounts } from "./accounts";

export const matches = pgTable("matches", {
  matchId: varchar("match_id").primaryKey(),
  puuid: varchar("puuid").references(() => accounts.puuid),
});
