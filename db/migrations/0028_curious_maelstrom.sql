DROP TABLE "perk_stats" CASCADE;--> statement-breakpoint
DROP TABLE "perk_style_selections" CASCADE;--> statement-breakpoint
DROP TABLE "perk_styles" CASCADE;--> statement-breakpoint
DROP TABLE "perks" CASCADE;--> statement-breakpoint
ALTER TABLE "match_participants" ADD COLUMN "wards_killed" integer;--> statement-breakpoint
ALTER TABLE "match_participants" ADD COLUMN "wards_placed" integer;--> statement-breakpoint
ALTER TABLE "match_participants" ADD COLUMN "neutral_minions_killed" integer;--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "summoner_id";--> statement-breakpoint
ALTER TABLE "match_participants" DROP COLUMN "summoner_id";