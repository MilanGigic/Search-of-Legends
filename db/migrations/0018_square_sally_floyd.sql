ALTER TABLE "match_participants" ADD COLUMN "queue_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "match_details" DROP COLUMN "queue_type";