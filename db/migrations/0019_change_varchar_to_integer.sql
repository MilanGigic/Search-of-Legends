ALTER TABLE match_participants
ALTER COLUMN queue_id TYPE integer USING queue_id::integer;