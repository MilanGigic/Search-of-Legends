CREATE TABLE "champion_patch_stats" (
	"patch" text NOT NULL,
	"champion_id" integer NOT NULL,
	"games" integer NOT NULL,
	"wins" integer NOT NULL,
	"pick_rate" real NOT NULL,
	"win_rate" real NOT NULL,
	"ban_rate" real NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "champion_patch_stats_patch_champion_id_pk" PRIMARY KEY("patch","champion_id")
);
--> statement-breakpoint
CREATE INDEX "champion_patch_stats_patch_idx" ON "champion_patch_stats" USING btree ("patch");