INSERT INTO accounts (
  puuid,
  game_name,
  tag_line,
  summoner_id,
  summoner_level,
  profile_icon_id,
  tier,
  league_points,
  wins,
  losses
)
SELECT
  puuid,
  game_name,
  tag_line,
  summoner_id,
  summoner_level,
  profile_icon_id,
  tier,
  league_points,
  wins,
  losses
FROM leaderboard_players
ON CONFLICT (puuid) DO UPDATE
SET
  tier = EXCLUDED.tier,
  league_points = EXCLUDED.league_points,
  wins = EXCLUDED.wins,
  losses = EXCLUDED.losses;

DROP TABLE leaderboard_players;

