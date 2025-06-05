CREATE TABLE "match_details" (
	"match_id" text NOT NULL,
	"game_creation" text NOT NULL,
	"game_duration" text NOT NULL,
	"game_end_timestamp" timestamp,
	"game_mode" text NOT NULL,
	"game_type" text NOT NULL,
	"game_version" text,
	"map_id" integer,
	"platform_id" text,
	"queue_id" integer NOT NULL,
	"tournament_code" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "match_objectives" (
	"match_id" text NOT NULL,
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
	"assists" integer,
	"baron_kills" integer,
	"bounty_level" integer,
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
	"summoner_id" text,
	"summoner_level" integer,
	"summoner_name" text,
	"profile_icon" integer,
	"riot_id_game_name" text,
	"riot_id_tagline" text,
	"team_id" integer,
	"team_early_surrendered" integer,
	"win" integer,
	"detector_wards_placed" integer,
	"sight_wards_bought_in_game" integer,
	"vision_score" integer,
	"vision_wards_bought_in_game" integer,
	"time_played" integer,
	"total_minions_killed" integer
);
--> statement-breakpoint
ALTER TABLE "matches" DROP CONSTRAINT "matches_puuid_accounts_puuid_fk";
--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "match_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "puuid" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "puuid" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "match_details" ADD CONSTRAINT "match_details_match_id_matches_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("match_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_objectives" ADD CONSTRAINT "match_objectives_match_id_matches_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("match_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_participants" ADD CONSTRAINT "match_participants_match_id_matches_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("match_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_puuid_accounts_puuid_fk" FOREIGN KEY ("puuid") REFERENCES "public"."accounts"("puuid") ON DELETE cascade ON UPDATE no action;