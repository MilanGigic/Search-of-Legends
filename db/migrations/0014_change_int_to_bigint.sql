ALTER TABLE match_details
ALTER COLUMN game_creation TYPE bigint USING game_creation::bigint,
ALTER COLUMN game_duration TYPE bigint USING game_duration::bigint,
ALTER COLUMN game_end_timestamp TYPE bigint USING (EXTRACT(EPOCH FROM game_end_timestamp) * 1000)::bigint;

