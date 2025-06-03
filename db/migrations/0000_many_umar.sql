CREATE TABLE "accounts" (
	"puuid" varchar PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"match_id" varchar PRIMARY KEY NOT NULL,
	"puuid" varchar
);
--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_puuid_accounts_puuid_fk" FOREIGN KEY ("puuid") REFERENCES "public"."accounts"("puuid") ON DELETE no action ON UPDATE no action;