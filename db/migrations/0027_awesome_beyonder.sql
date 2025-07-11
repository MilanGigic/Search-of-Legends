ALTER TABLE "perks" ALTER COLUMN "match_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "perk_stats" ADD COLUMN "match_id" text;--> statement-breakpoint
ALTER TABLE "perk_style_selections" ADD COLUMN "match_id" text;--> statement-breakpoint
ALTER TABLE "perk_styles" ADD COLUMN "match_id" text;--> statement-breakpoint
ALTER TABLE "perk_stats" ADD CONSTRAINT "perk_stats_match_id_matches_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("match_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perk_style_selections" ADD CONSTRAINT "perk_style_selections_match_id_matches_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("match_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perk_styles" ADD CONSTRAINT "perk_styles_match_id_matches_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("match_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perks" ADD CONSTRAINT "perks_match_id_matches_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("match_id") ON DELETE no action ON UPDATE no action;