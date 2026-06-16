CREATE TABLE "top_five_per_region" (
	"puuid" text PRIMARY KEY NOT NULL,
	"game_name" text NOT NULL,
	"tag_line" text NOT NULL,
	"region" text NOT NULL,
	"summoner_level" integer NOT NULL,
	"profile_icon_id" integer NOT NULL,
	"rank" text NOT NULL,
	"league_points" integer NOT NULL,
	"wins" integer NOT NULL,
	"losses" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
