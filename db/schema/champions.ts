import { pgTable, varchar, integer, text } from "drizzle-orm/pg-core";

export const champions = pgTable("champions", {
  id: varchar("id").primaryKey(), // e.g., "Aatrox"
  key: varchar("key").notNull(), // e.g., "266"
  name: varchar("name").notNull(), // e.g., "Aatrox"
  title: text("title").notNull(), // e.g., "The Darkin Blade"
  blurb: text("blurb").notNull(), // Short description
  image: text("image").notNull(), // Full image URL
  tags: text("tags").array().notNull(), // e.g., ["Fighter", "Tank"]
});
