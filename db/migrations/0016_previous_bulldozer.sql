ALTER TABLE "match_timeline_events" ALTER COLUMN "timestamp" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "match_timeline_events" ALTER COLUMN "real_timestamp" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "match_timelines" ALTER COLUMN "frame_interval" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "match_timelines" ADD COLUMN "game_id" bigint NOT NULL;