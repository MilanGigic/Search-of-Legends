CREATE INDEX "match_bans_champion_id_idx" ON "match_bans" USING btree ("champion_id");--> statement-breakpoint
CREATE INDEX "details_version_queue_id" ON "match_details" USING btree ("game_version","queue_id");--> statement-breakpoint
CREATE INDEX "participant_match_id_idx" ON "match_participants" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "champion_id_idx" ON "match_participants" USING btree ("champion_id");--> statement-breakpoint
CREATE INDEX "participant_win_idx" ON "match_participants" USING btree ("win");