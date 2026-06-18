ALTER TABLE "ranked_stats" DROP CONSTRAINT "ranked_stats_puuid_accounts_puuid_fk";
--> statement-breakpoint
ALTER TABLE "ranked_stats" ADD CONSTRAINT "ranked_stats_puuid_queue_type_pk" PRIMARY KEY("puuid","queue_type");