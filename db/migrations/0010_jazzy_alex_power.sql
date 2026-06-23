/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'match_bans'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "match_bans" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'match_teams'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "match_teams" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "match_teams" ALTER COLUMN "team_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ALTER COLUMN "current_gold" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ALTER COLUMN "total_gold" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ALTER COLUMN "gold_per_second" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ALTER COLUMN "level" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ALTER COLUMN "xp" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ALTER COLUMN "minions_killed" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ALTER COLUMN "jungle_minions_killed" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ALTER COLUMN "time_enemy_spent_controlled" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ALTER COLUMN "position_x" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ALTER COLUMN "position_y" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "match_teams" ADD CONSTRAINT "match_teams_match_id_team_id_pk" PRIMARY KEY("match_id","team_id");--> statement-breakpoint
ALTER TABLE "match_bans" ADD CONSTRAINT "match_bans_match_id_champion_id_pk" PRIMARY KEY("match_id","champion_id");--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "cs_ability_haste" real NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "cs_ability_power" real NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "cs_armor" real NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "cs_armor_pen" real NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "cs_armor_pen_percent" real NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "cs_attack_damage" real NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "cs_attack_speed" real NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "cs_bonus_armor_pen_percent" real NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "cs_bonus_magic_pen_percent" real NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "cs_cc_reduction" real NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "cs_cooldown_reduction" real NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "cs_health" real NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "cs_health_max" real NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "cs_health_regen" real NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "cs_lifesteal" real NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "cs_magic_pen" real NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "cs_magic_pen_percent" real NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "cs_magic_resist" real NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "cs_movement_speed" real NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "cs_omnivamp" real NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "cs_physical_vamp" real NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "cs_power" real NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "cs_power_max" real NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "cs_power_regen" real NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "cs_spell_vamp" real NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "ds_magic_damage_done" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "ds_magic_damage_done_to_champions" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "ds_magic_damage_taken" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "ds_physical_damage_done" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "ds_physical_damage_done_to_champions" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "ds_physical_damage_taken" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "ds_total_damage_done" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "ds_total_damage_done_to_champions" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "ds_total_damage_taken" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "ds_true_damage_done" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "ds_true_damage_done_to_champions" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "match_timeline_participant_frames" ADD COLUMN "ds_true_damage_taken" integer NOT NULL;