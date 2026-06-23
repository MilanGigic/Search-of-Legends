CREATE TABLE "match_participant_perk_selections" (
	"match_id" text NOT NULL,
	"participant_id" integer NOT NULL,
	"description" text NOT NULL,
	"selection_order" integer NOT NULL,
	"perk" integer NOT NULL,
	"var1" integer,
	"var2" integer,
	"var3" integer,
	CONSTRAINT "match_participant_perk_selections_match_id_participant_id_description_selection_order_pk" PRIMARY KEY("match_id","participant_id","description","selection_order")
);
--> statement-breakpoint
CREATE TABLE "match_participant_perk_styles" (
	"match_id" text NOT NULL,
	"participant_id" integer NOT NULL,
	"description" text NOT NULL,
	"style" integer NOT NULL,
	CONSTRAINT "match_participant_perk_styles_match_id_participant_id_description_pk" PRIMARY KEY("match_id","participant_id","description")
);
--> statement-breakpoint
CREATE TABLE "match_participant_perks" (
	"match_id" text NOT NULL,
	"participant_id" integer NOT NULL,
	"stat_perk_defense" integer,
	"stat_perk_flex" integer,
	"stat_perk_offense" integer,
	CONSTRAINT "match_participant_perks_match_id_participant_id_pk" PRIMARY KEY("match_id","participant_id")
);
--> statement-breakpoint
CREATE TABLE "match_timeline_events" (
	"match_id" text NOT NULL,
	"frame_index" integer NOT NULL,
	"event_order" integer NOT NULL,
	"timestamp" integer NOT NULL,
	"real_timestamp" integer,
	"type" text NOT NULL,
	"item_id" integer,
	"participant_id" integer,
	"skill_slot" integer,
	"ward_type" text,
	CONSTRAINT "match_timeline_events_match_id_frame_index_event_order_pk" PRIMARY KEY("match_id","frame_index","event_order")
);
--> statement-breakpoint
CREATE TABLE "match_timeline_frames" (
	"match_id" text NOT NULL,
	"frame_index" integer NOT NULL,
	"timestamp" integer NOT NULL,
	CONSTRAINT "match_timeline_frames_match_id_frame_index_pk" PRIMARY KEY("match_id","frame_index")
);
--> statement-breakpoint
CREATE TABLE "match_timeline_participant_frames" (
	"match_id" text NOT NULL,
	"frame_index" integer NOT NULL,
	"participant_id" integer NOT NULL,
	"current_gold" integer,
	"total_gold" integer,
	"gold_per_second" integer,
	"level" integer,
	"xp" integer,
	"minions_killed" integer,
	"jungle_minions_killed" integer,
	"time_enemy_spent_controlled" integer,
	"position_x" real,
	"position_y" real,
	CONSTRAINT "match_timeline_participant_frames_match_id_frame_index_participant_id_pk" PRIMARY KEY("match_id","frame_index","participant_id")
);
--> statement-breakpoint
CREATE TABLE "match_timelines" (
	"match_id" text PRIMARY KEY NOT NULL,
	"data_version" text,
	"end_of_game_result" text,
	"frame_interval" integer NOT NULL,
	"participant_puuids" jsonb
);
--> statement-breakpoint
ALTER TABLE "match_participant_perks" ADD CONSTRAINT "match_participant_perks_match_id_matches_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("match_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_timeline_frames" ADD CONSTRAINT "match_timeline_frames_match_id_match_timelines_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."match_timelines"("match_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_timelines" ADD CONSTRAINT "match_timelines_match_id_matches_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("match_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "match_participant_perk_selections_style_idx" ON "match_participant_perk_selections" USING btree ("match_id","participant_id","description");--> statement-breakpoint
CREATE INDEX "match_participant_perk_selections_perk_idx" ON "match_participant_perk_selections" USING btree ("perk");--> statement-breakpoint
CREATE INDEX "match_participant_perk_styles_perks_idx" ON "match_participant_perk_styles" USING btree ("match_id","participant_id");--> statement-breakpoint
CREATE INDEX "match_participant_perks_match_idx" ON "match_participant_perks" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "match_timeline_events_frame_idx" ON "match_timeline_events" USING btree ("match_id","frame_index");--> statement-breakpoint
CREATE INDEX "match_timeline_events_type_idx" ON "match_timeline_events" USING btree ("type");--> statement-breakpoint
CREATE INDEX "match_timeline_events_participant_idx" ON "match_timeline_events" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX "match_timeline_frames_match_idx" ON "match_timeline_frames" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "match_timeline_pframes_frame_idx" ON "match_timeline_participant_frames" USING btree ("match_id","frame_index");--> statement-breakpoint
CREATE INDEX "match_timeline_pframes_participant_idx" ON "match_timeline_participant_frames" USING btree ("participant_id");