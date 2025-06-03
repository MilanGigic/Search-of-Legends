import { bigint, integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const accounts = pgTable("accounts", {
  puuid: varchar("puuid").primaryKey(),
  gameName: varchar("game_name").notNull(),
  tagLine: varchar("tag_line").notNull(),
  region: varchar("region").notNull(),
  // Summoner info
  summonerId: varchar("summoner_id"),
  accountId: varchar("account_id"),
  summonerLevel: integer("summoner_level"),
  profileIconId: integer("profile_icon_id"),
  revisionDate: bigint("revision_date", { mode: "number" }),
  lastUpdated: bigint("last_updated", { mode: "number" }),
});
