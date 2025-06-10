CREATE TABLE "match_bans" (
	"match_id" text NOT NULL,
	"champion_id" integer,
	"pick_turn" integer
);
--> statement-breakpoint
CREATE TABLE "match_teams" (
	"match_id" text NOT NULL,
	"team_id" integer,
	"win" integer
);
--> statement-breakpoint
ALTER TABLE "match_bans" ADD CONSTRAINT "match_bans_match_id_matches_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("match_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_teams" ADD CONSTRAINT "match_teams_match_id_matches_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("match_id") ON DELETE cascade ON UPDATE no action;