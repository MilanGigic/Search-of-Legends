import {
  pgTable,
  varchar,
  integer,
  text,
  real,
  timestamp,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";

export const champions = pgTable("champions", {
  id: varchar("id").primaryKey(), // e.g., "Aatrox"
  key: integer("key").notNull(), // e.g., "266"
  name: varchar("name").notNull(), // e.g., "Aatrox"
  title: text("title").notNull(), // e.g., "The Darkin Blade"
  blurb: text("blurb").notNull(), // Short description
  image: text("image").notNull(), // Full image URL
  tags: text("tags").array().notNull(), // e.g., ["Fighter", "Tank"]
  accentColor: text("accent_color"),
});

export const championPatchStats = pgTable(
  "champion_patch_stats",
  {
    patch: text("patch").notNull(),
    championId: integer("champion_id").notNull(),

    games: integer("games").notNull(),
    wins: integer("wins").notNull(),

    pickRate: real("pick_rate").notNull(),
    winRate: real("win_rate").notNull(),
    banRate: real("ban_rate").notNull(),

    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.patch, table.championId],
    }),

    patchIdx: index("champion_patch_stats_patch_idx").on(table.patch),
  }),
);
