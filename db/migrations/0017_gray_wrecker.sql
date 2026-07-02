ALTER TABLE "match_details" DROP CONSTRAINT "match_details_pkey";
ALTER TABLE "match_details" ADD CONSTRAINT "match_details_match_id_game_version_pk" PRIMARY KEY("match_id","game_version");