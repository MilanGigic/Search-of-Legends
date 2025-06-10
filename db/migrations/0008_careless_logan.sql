ALTER TABLE "accounts" ALTER COLUMN "tier" SET DEFAULT 'UNRANKED';--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "rank" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "league_points" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "wins" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "losses" SET DEFAULT 0;