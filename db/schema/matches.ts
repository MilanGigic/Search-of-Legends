import { bigint, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { accounts } from "./accounts";

export const matches = pgTable("matches", {
  matchId: text("match_id").primaryKey(),
  puuid: text("puuid")
    .references(() => accounts.puuid, {
      onDelete: "cascade",
    })
    .notNull(),
});

export const matchDetails = pgTable("match_details", {
  matchId: text("match_id")
    .references(() => matches.matchId, { onDelete: "cascade" })
    .notNull(),
  gameCreation: bigint("game_creation", { mode: "number" }).notNull(),
  gameDuration: bigint("game_duration", { mode: "number" }).notNull(),
  gameEndTimestamp: bigint("game_end_timestamp", { mode: "number" }),
  gameMode: text("game_mode").notNull(),
  gameType: text("game_type").notNull(),
  gameVersion: text("game_version"),
  mapId: integer("map_id"),
  platformId: text("platform_id"),
  queueId: integer("queue_id").notNull(),
  tournamentCode: text("tournament_code"),
  createdAt: timestamp("created_at").defaultNow(),
});

// FIGURE THIS SHIT OUT IM TIRED

export const matchParticipants = pgTable("match_participants", {
  matchId: text("match_id")
    .references(() => matches.matchId, { onDelete: "cascade" })
    .notNull(),

  // Performance metrics
  assists: integer("assists"),
  baronKills: integer("baron_kills"),
  bountyLevel: integer("bounty_level"),
  champExperience: integer("champ_experience"),
  champLevel: integer("champ_level"),
  championId: integer("champion_id"),
  championName: text("champion_name"),
  championTransform: integer("champion_transform"),

  // Damage-related fields
  damageDealtToBuildings: integer("damage_dealt_to_buildings"),
  damageDealtToObjectives: integer("damage_dealt_to_objectives"),
  damageDealtToTurrets: integer("damage_dealt_to_turrets"),
  damageSelfMitigated: integer("damage_self_mitigated"),
  deaths: integer("deaths"),

  // Damage breakdown
  magicDamageDealt: integer("magic_damage_dealt"),
  magicDamageDealtToChampions: integer("magic_damage_dealt_to_champions"),
  magicDamageTaken: integer("magic_damage_taken"),
  physicalDamageDealt: integer("physical_damage_dealt"),
  physicalDamageDealtToChampions: integer("physical_damage_dealt_to_champions"),
  physicalDamageTaken: integer("physical_damage_taken"),
  trueDamageDealt: integer("true_damage_dealt"),
  trueDamageDealtToChampions: integer("true_damage_dealt_to_champions"),
  trueDamageTaken: integer("true_damage_taken"),
  totalDamageDealt: integer("total_damage_dealt"),
  totalDamageDealtToChampions: integer("total_damage_dealt_to_champions"),
  totalDamageTaken: integer("total_damage_taken"),

  // Kill-related fields
  doubleKills: integer("double_kills"),
  dragonKills: integer("dragon_kills"),
  firstBloodAssist: integer("first_blood_assist"), // boolean as integer (0/1)
  firstBloodKill: integer("first_blood_kill"), // boolean as integer (0/1)
  firstTowerAssist: integer("first_tower_assist"), // boolean as integer (0/1)
  firstTowerKill: integer("first_tower_kill"), // boolean as integer (0/1)
  killingSprees: integer("killing_sprees"),
  kills: integer("kills"),
  largestKillingSpree: integer("largest_killing_spree"),
  largestMultiKill: integer("largest_multi_kill"),
  pentaKills: integer("penta_kills"),
  quadraKills: integer("quadra_kills"),
  tripleKills: integer("triple_kills"),

  // Economic fields
  goldEarned: integer("gold_earned"),
  goldSpent: integer("gold_spent"),
  itemsPurchased: integer("items_purchased"),

  // Items
  item0: integer("item0"),
  item1: integer("item1"),
  item2: integer("item2"),
  item3: integer("item3"),
  item4: integer("item4"),
  item5: integer("item5"),
  item6: integer("item6"),

  // Position and lane
  individualPosition: text("individual_position"),
  teamPosition: text("team_position"),
  lane: text("lane"),
  role: text("role"),

  // Summoner-related fields
  participantId: integer("participant_id"),
  puuid: text("puuid"),
  summonerId: text("summoner_id"),
  summonerLevel: integer("summoner_level"),
  summonerName: text("summoner_name"),
  profileIcon: integer("profile_icon"),
  riotIdGameName: text("riot_id_game_name"),
  riotIdTagline: text("riot_id_tagline"),

  summoner1Id: integer("summoner_1_id"),
  summoner2Id: integer("summoner_2_id"),

  // Team-related
  teamId: integer("team_id"),
  teamEarlySurrendered: integer("team_early_surrendered"), // boolean as integer (0/1)
  win: integer("win"), // boolean as integer (0/1)

  // Vision-related
  detectorWardsPlaced: integer("detector_wards_placed"),
  sightWardsBoughtInGame: integer("sight_wards_bought_in_game"),
  visionScore: integer("vision_score"),
  visionWardsBoughtInGame: integer("vision_wards_bought_in_game"),

  // Miscellaneous
  timePlayed: integer("time_played"),
  totalMinionsKilled: integer("total_minions_killed"),
});

export const matchObjectives = pgTable("match_objectives", {
  matchId: text("match_id")
    .references(() => matches.matchId, { onDelete: "cascade" })
    .notNull(),
  baron: text("baron").notNull(),
  champion: text("champion").notNull(),
  dragon: text("dragon").notNull(),
  inhibitor: text("inhibitor").notNull(),
  riftHerald: text("rift_herald").notNull(),
  tower: text("tower").notNull(),
});

export const matchTeams = pgTable("match_teams", {
  matchId: text("match_id")
    .references(() => matches.matchId, { onDelete: "cascade" })
    .notNull(),
  teamId: integer("team_id"),
  win: integer("win"), // Boolean as integer (0/1)
});

export const matchBans = pgTable("match_bans", {
  matchId: text("match_id")
    .references(() => matches.matchId, { onDelete: "cascade" })
    .notNull(),
  championId: integer("champion_id"),
  pickTurn: integer("pick_turn"),
});
