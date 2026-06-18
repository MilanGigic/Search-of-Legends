import {
  bigint,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const accounts = pgTable("accounts", {
  puuid: text("puuid").primaryKey(),
  gameName: text("game_name").notNull(),
  tagLine: text("tag_line").notNull(),
  region: text("region").notNull(),
  // Summoner info
  summonerLevel: integer("summoner_level").notNull(),
  profileIconId: integer("profile_icon_id").notNull(),

  revisionDate: bigint("revision_date", { mode: "number" }).notNull(),
});

export const topFivePerRegion = pgTable(
  "top_five_per_region",
  {
    puuid: text("puuid").primaryKey(),
    gameName: text("game_name").notNull(),
    tagLine: text("tag_line").notNull(),
    region: text("region").notNull(),

    summonerLevel: integer("summoner_level").notNull(),
    profileIconId: integer("profile_icon_id").notNull(),

    rank: text("rank").notNull(),
    leaguePoints: integer("league_points").notNull(),

    wins: integer("wins").notNull(),
    losses: integer("losses").notNull(),

    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    regionIdx: index("top_five_per_region_region_idx").on(table.region),
  }),
);

export const rankedStats = pgTable(
  "ranked_stats",
  {
    puuid: text("puuid").notNull(),

    queueType: text("queue_type").notNull(),
    region: text("region").notNull(),

    tier: text("tier").notNull(),
    rank: text("rank").notNull(),
    leaguePoints: integer("league_points").notNull(),

    wins: integer("wins").notNull(),
    losses: integer("losses").notNull(),

    leaderboardPosition: integer("leaderboard_position"),

    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.puuid, t.queueType] }),
  }),
);

export const rankedHistory = pgTable(
  "ranked_history",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    puuid: text("puuid")
      .references(() => accounts.puuid)
      .notNull(),
    queueType: text("queue_type").notNull(),

    tier: text("tier").notNull(),
    rank: text("rank").notNull(),
    leaguePoints: integer("league_points").notNull(),

    wins: integer("wins").notNull(),
    losses: integer("losses").notNull(),

    capturedAt: timestamp("captured_at").notNull().defaultNow(),
  },
  (t) => {
    return {
      rankedHistoryPuuidQueueIndex: index("ranked_history_puuid_queue_idx").on(
        t.puuid,
        t.queueType,
        t.capturedAt,
      ),
    };
  },
);
