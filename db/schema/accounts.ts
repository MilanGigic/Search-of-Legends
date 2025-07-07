import {
  bigint,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const accounts = pgTable("accounts", {
  puuid: varchar("puuid").primaryKey(),
  gameName: varchar("game_name").notNull(),
  tagLine: varchar("tag_line").notNull(),
  region: varchar("region").notNull(),
  // Summoner info
  summonerId: varchar("summoner_id").notNull(),
  summonerLevel: integer("summoner_level").notNull(),
  profileIconId: integer("profile_icon_id").notNull(),
  tier: varchar("tier").notNull(),
  rank: varchar("rank").notNull(),
  leaguePoints: integer("league_points").notNull(),
  wins: integer("wins").notNull(),
  losses: integer("losses").notNull(),
  revisionDate: bigint("revision_date", { mode: "number" }).notNull(),
  lastUpdated: bigint("last_updated", { mode: "number" }).notNull(),
});
