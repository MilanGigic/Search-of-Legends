import { integer, jsonb, pgTable, text } from "drizzle-orm/pg-core";

export const items = pgTable("items", {
  itemId: integer("item_id").primaryKey(),
  name: text("name").notNull(),
  image: text("image").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull(),
  totalGold: integer("total_gold").notNull(),
  gameVersion: text("game_version").notNull(),
});
