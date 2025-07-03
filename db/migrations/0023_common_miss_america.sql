CREATE TABLE "leaderboard_players" (
	"summoner_id" varchar PRIMARY KEY NOT NULL,
	"puuid" varchar NOT NULL,
	"tier" text,
	"league_points" integer NOT NULL,
	"wins" integer NOT NULL,
	"losses" integer NOT NULL,
	"rank" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DROP TABLE "challenger_players" CASCADE;