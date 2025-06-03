import { pgTable, varchar } from "drizzle-orm/pg-core";

export const accounts = pgTable("accounts", {
  puuid: varchar("puuid").primaryKey(),
});
