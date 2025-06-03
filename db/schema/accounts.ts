import { pgTable, varchar } from "drizzle-orm/pg-core";

export const accounts = pgTable("accounts", {
  puuid: varchar("puuid").primaryKey(),
  gameName: varchar("game_name").notNull(),
  tagLine: varchar("tag_line").notNull(),
});
