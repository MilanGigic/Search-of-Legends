-- Up migration: convert integer columns to boolean

ALTER TABLE match_participants
ALTER COLUMN first_blood_assist TYPE boolean
USING first_blood_assist::boolean,

ALTER COLUMN first_blood_kill TYPE boolean
USING first_blood_kill::boolean,

ALTER COLUMN first_tower_assist TYPE boolean
USING first_tower_assist::boolean,

ALTER COLUMN first_tower_kill TYPE boolean
USING first_tower_kill::boolean,

ALTER COLUMN team_early_surrendered TYPE boolean
USING team_early_surrendered::boolean,

ALTER COLUMN win TYPE boolean
USING win::boolean;

