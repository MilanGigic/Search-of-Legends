ALTER TABLE "accounts" ADD COLUMN "region" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "summoner_id" varchar;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "account_id" varchar;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "summoner_level" integer;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "profile_icon_id" integer;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "revision_date" bigint;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "last_updated" bigint;