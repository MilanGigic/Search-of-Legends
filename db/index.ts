import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema/index"; // ✅ import your schema

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

console.log("Loaded DB URL:", process.env.DATABASE_URL);

export const db = drizzle(pool, { schema }); // ✅ include schema
