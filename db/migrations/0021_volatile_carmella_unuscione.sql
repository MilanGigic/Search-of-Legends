CREATE TABLE "challenger_players" (
	"summoner_id" varchar PRIMARY KEY NOT NULL,
	"summoner_name" varchar NOT NULL,
	"league_points" integer NOT NULL,
	"wins" integer NOT NULL,
	"losses" integer NOT NULL,
	"rank" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
