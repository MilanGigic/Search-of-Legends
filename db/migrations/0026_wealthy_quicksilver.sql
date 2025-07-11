CREATE TABLE "perk_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"defense" integer NOT NULL,
	"flex" integer NOT NULL,
	"offense" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "perk_style_selections" (
	"id" serial PRIMARY KEY NOT NULL,
	"perk" integer NOT NULL,
	"var1" integer DEFAULT 0,
	"var2" integer DEFAULT 0,
	"var3" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "perk_styles" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" text,
	"style" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "perks" (
	"id" serial PRIMARY KEY NOT NULL,
	"match_id" text NOT NULL,
	"puuid" text NOT NULL,
	"stat_perks_id" integer,
	"primary_style_id" integer,
	"secondary_style_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DROP TABLE "leaderboard_players" CASCADE;--> statement-breakpoint
ALTER TABLE "perks" ADD CONSTRAINT "perks_stat_perks_id_perk_stats_id_fk" FOREIGN KEY ("stat_perks_id") REFERENCES "public"."perk_stats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perks" ADD CONSTRAINT "perks_primary_style_id_perk_styles_id_fk" FOREIGN KEY ("primary_style_id") REFERENCES "public"."perk_styles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perks" ADD CONSTRAINT "perks_secondary_style_id_perk_styles_id_fk" FOREIGN KEY ("secondary_style_id") REFERENCES "public"."perk_styles"("id") ON DELETE no action ON UPDATE no action;