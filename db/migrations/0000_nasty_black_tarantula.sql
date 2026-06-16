CREATE TABLE "accounts" (
	"puuid" text PRIMARY KEY NOT NULL,
	"game_name" text NOT NULL,
	"tag_line" text NOT NULL,
	"region" text NOT NULL,
	"summoner_level" integer NOT NULL,
	"profile_icon_id" integer NOT NULL,
	"revision_date" bigint NOT NULL,
	"last_updated" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ranked_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"puuid" text NOT NULL,
	"queue_type" text NOT NULL,
	"tier" text NOT NULL,
	"rank" text NOT NULL,
	"league_points" integer NOT NULL,
	"wins" integer NOT NULL,
	"losses" integer NOT NULL,
	"captured_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ranked_stats" (
	"puuid" text NOT NULL,
	"queue_type" text NOT NULL,
	"tier" text NOT NULL,
	"rank" text NOT NULL,
	"league_points" integer NOT NULL,
	"wins" integer NOT NULL,
	"losses" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ranked_stats_puuid_queue_type_pk" PRIMARY KEY("puuid","queue_type")
);
--> statement-breakpoint
CREATE TABLE "match_bans" (
	"match_id" text PRIMARY KEY NOT NULL,
	"champion_id" integer,
	"pick_turn" integer
);
--> statement-breakpoint
CREATE TABLE "match_details" (
	"match_id" text PRIMARY KEY NOT NULL,
	"game_creation" timestamp with time zone NOT NULL,
	"game_mode" text,
	"game_type" text,
	"game_version" text,
	"map_id" integer,
	"platform_id" text,
	"queue_id" integer NOT NULL,
	"tournament_code" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "match_objectives" (
	"match_id" text PRIMARY KEY NOT NULL,
	"baron" text NOT NULL,
	"champion" text NOT NULL,
	"dragon" text NOT NULL,
	"inhibitor" text NOT NULL,
	"rift_herald" text NOT NULL,
	"tower" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "match_participants" (
	"match_id" text NOT NULL,
	"queue_id" integer NOT NULL,
	"assists" integer,
	"baron_kills" integer,
	"champ_experience" integer,
	"champ_level" integer,
	"champion_id" integer,
	"champion_name" text,
	"champion_transform" integer,
	"damage_dealt_to_buildings" integer,
	"damage_dealt_to_objectives" integer,
	"damage_dealt_to_turrets" integer,
	"damage_self_mitigated" integer,
	"deaths" integer,
	"magic_damage_dealt" integer,
	"magic_damage_dealt_to_champions" integer,
	"magic_damage_taken" integer,
	"physical_damage_dealt" integer,
	"physical_damage_dealt_to_champions" integer,
	"physical_damage_taken" integer,
	"true_damage_dealt" integer,
	"true_damage_dealt_to_champions" integer,
	"true_damage_taken" integer,
	"total_damage_dealt" integer,
	"total_damage_dealt_to_champions" integer,
	"total_damage_taken" integer,
	"double_kills" integer,
	"dragon_kills" integer,
	"first_blood_assist" integer,
	"first_blood_kill" integer,
	"first_tower_assist" integer,
	"first_tower_kill" integer,
	"killing_sprees" integer,
	"kills" integer,
	"largest_killing_spree" integer,
	"largest_multi_kill" integer,
	"penta_kills" integer,
	"quadra_kills" integer,
	"triple_kills" integer,
	"gold_earned" integer,
	"gold_spent" integer,
	"items_purchased" integer,
	"item0" integer,
	"item1" integer,
	"item2" integer,
	"item3" integer,
	"item4" integer,
	"item5" integer,
	"item6" integer,
	"individual_position" text,
	"team_position" text,
	"lane" text,
	"role" text,
	"participant_id" integer,
	"puuid" text,
	"summoner_level" integer,
	"profile_icon" integer,
	"riot_id_game_name" text,
	"riot_id_tagline" text,
	"summoner_1_id" integer,
	"summoner_2_id" integer,
	"team_id" integer,
	"team_early_surrendered" integer,
	"win" integer,
	"detector_wards_placed" integer,
	"sight_wards_bought_in_game" integer,
	"vision_score" integer,
	"vision_wards_bought_in_game" integer,
	"wards_killed" integer,
	"wards_placed" integer,
	"time_played" integer,
	"total_minions_killed" integer,
	"neutral_minions_killed" integer,
	CONSTRAINT "match_participants_match_id_participant_id_pk" PRIMARY KEY("match_id","participant_id")
);
--> statement-breakpoint
CREATE TABLE "match_teams" (
	"match_id" text PRIMARY KEY NOT NULL,
	"team_id" integer,
	"win" integer
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"match_id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "champions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"key" varchar NOT NULL,
	"name" varchar NOT NULL,
	"title" text NOT NULL,
	"blurb" text NOT NULL,
	"image" text NOT NULL,
	"tags" text[] NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ranked_history" ADD CONSTRAINT "ranked_history_puuid_accounts_puuid_fk" FOREIGN KEY ("puuid") REFERENCES "public"."accounts"("puuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ranked_stats" ADD CONSTRAINT "ranked_stats_puuid_accounts_puuid_fk" FOREIGN KEY ("puuid") REFERENCES "public"."accounts"("puuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_bans" ADD CONSTRAINT "match_bans_match_id_matches_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("match_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_details" ADD CONSTRAINT "match_details_match_id_matches_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("match_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_objectives" ADD CONSTRAINT "match_objectives_match_id_matches_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("match_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_participants" ADD CONSTRAINT "match_participants_match_id_matches_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("match_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_teams" ADD CONSTRAINT "match_teams_match_id_matches_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("match_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ranked_history_puuid_queue_idx" ON "ranked_history" USING btree ("puuid","queue_type","captured_at");--> statement-breakpoint
CREATE INDEX "match_participants_puuid_idx" ON "match_participants" USING btree ("puuid","match_id");--> statement-breakpoint
CREATE INDEX "champion_queue_idx" ON "match_participants" USING btree ("champion_id","queue_id");