ALTER TABLE match_details
ALTER COLUMN game_creation TYPE timestamptz USING to_timestamp(game_creation / 1000.0),
ALTER COLUMN game_duration TYPE timestamptz USING to_timestamp(game_duration / 1000.0),
ALTER COLUMN game_end_timestamp TYPE timestamptz USING to_timestamp(game_end_timestamp / 1000.0);
