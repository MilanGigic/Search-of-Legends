import {
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const matches = pgTable("matches", {
  matchId: text("match_id").primaryKey(),
});

export const matchDetails = pgTable("match_details", {
  matchId: text("match_id")
    .primaryKey()
    .references(() => matches.matchId, { onDelete: "cascade" })
    .notNull(),
  gameCreation: timestamp("game_creation", { withTimezone: true }).notNull(),
  gameMode: text("game_mode"),
  gameType: text("game_type"),
  gameVersion: text("game_version"),
  mapId: integer("map_id"),
  platformId: text("platform_id"),
  queueId: integer("queue_id").notNull(),
  tournamentCode: text("tournament_code"),
  createdAt: timestamp("created_at").defaultNow(),
});

// PARTICIPANTS TABLE REWORK
// ====> I think matchId should be connected to gameId of match info
// ====> Riot changed the API a little, they added PlayerScore values

export const matchParticipants = pgTable(
  "match_participants",
  {
    matchId: text("match_id")
      .references(() => matches.matchId, { onDelete: "cascade" })
      .notNull(),
    queueId: integer("queue_id").notNull(),
    // Performance metrics
    assists: integer("assists"),
    baronKills: integer("baron_kills"),
    champExperience: integer("champ_experience"),
    champLevel: integer("champ_level"),
    championId: integer("champion_id"),
    championName: text("champion_name"),
    championTransform: integer("champion_transform"),

    // Damage-related fields`
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
    physicalDamageDealtToChampions: integer(
      "physical_damage_dealt_to_champions",
    ),
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
    summonerLevel: integer("summoner_level"),
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
    wardsKilled: integer("wards_killed"),
    wardsPlaced: integer("wards_placed"),

    // Miscellaneous
    timePlayed: integer("time_played"),
    totalMinionsKilled: integer("total_minions_killed"),
    neutralMinionsKilled: integer("neutral_minions_killed"),
  },
  (table) => {
    return {
      matchParticipantsPuuidIdx: index("match_participants_puuid_idx").on(
        table.puuid,
        table.matchId,
      ),
      championQueueIdx: index("champion_queue_idx").on(
        table.championId,
        table.queueId,
      ),
      pk: primaryKey({
        columns: [table.matchId, table.participantId],
      }),
    };
  },
);

export const matchObjectives = pgTable("match_objectives", {
  matchId: text("match_id")
    .primaryKey()
    .references(() => matches.matchId, { onDelete: "cascade" })
    .notNull(),
  baron: text("baron").notNull(),
  champion: text("champion").notNull(),
  dragon: text("dragon").notNull(),
  inhibitor: text("inhibitor").notNull(),
  riftHerald: text("rift_herald").notNull(),
  tower: text("tower").notNull(),
});

export const matchTeams = pgTable(
  "match_teams",
  {
    matchId: text("match_id")
      .references(() => matches.matchId, {
        onDelete: "cascade",
      })
      .notNull(),

    teamId: integer("team_id").notNull(),

    win: integer("win"),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.matchId, table.teamId],
    }),
  }),
);

export const matchBans = pgTable(
  "match_bans",
  {
    matchId: text("match_id")
      .references(() => matches.matchId, { onDelete: "cascade" })
      .notNull(),
    championId: integer("champion_id"),
    pickTurn: integer("pick_turn"),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.matchId, table.championId],
    }),
  }),
);

export const matchTimelines = pgTable("match_timelines", {
  matchId: text("match_id")
    .primaryKey()
    .references(() => matches.matchId, { onDelete: "cascade" })
    .notNull(),
  dataVersion: text("data_version"),
  endOfGameResult: text("end_of_game_result"),
  frameInterval: integer("frame_interval").notNull(),
  participantPuuids: jsonb("participant_puuids").$type<string[]>(),
});

export const matchTimelineFrames = pgTable(
  "match_timeline_frames",
  {
    matchId: text("match_id")
      .references(() => matchTimelines.matchId, { onDelete: "cascade" })
      .notNull(),
    frameIndex: integer("frame_index").notNull(),
    timestamp: integer("timestamp").notNull(), // ms into the game, from Riot
  },
  (table) => ({
    pk: primaryKey({ columns: [table.matchId, table.frameIndex] }),
    matchIdx: index("match_timeline_frames_match_idx").on(table.matchId),
  }),
);

export const matchTimelineEvents = pgTable(
  "match_timeline_events",
  {
    matchId: text("match_id").notNull(),
    frameIndex: integer("frame_index").notNull(),
    eventOrder: integer("event_order").notNull(), // position within frame.events[]
    timestamp: integer("timestamp").notNull(),
    realTimestamp: integer("real_timestamp"),
    type: text("type").notNull(), // EventType union, validated at the app layer
    itemId: integer("item_id"),
    participantId: integer("participant_id"),
    skillSlot: integer("skill_slot"),
    wardType: text("ward_type"),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.matchId, table.frameIndex, table.eventOrder],
    }),
    frameFk: index("match_timeline_events_frame_idx").on(
      table.matchId,
      table.frameIndex,
    ),
    typeIdx: index("match_timeline_events_type_idx").on(table.type),
    participantIdx: index("match_timeline_events_participant_idx").on(
      table.participantId,
    ),
  }),
);

export const matchTimelineParticipantFrames = pgTable(
  "match_timeline_participant_frames",
  {
    matchId: text("match_id").notNull(),
    frameIndex: integer("frame_index").notNull(),
    participantId: integer("participant_id").notNull(),
    currentGold: integer("current_gold").notNull(),
    totalGold: integer("total_gold").notNull(),
    goldPerSecond: integer("gold_per_second").notNull(),
    level: integer("level").notNull(),
    xp: integer("xp").notNull(),
    minionsKilled: integer("minions_killed").notNull(),
    jungleMinionsKilled: integer("jungle_minions_killed").notNull(),
    timeEnemySpentControlled: integer("time_enemy_spent_controlled").notNull(),
    positionX: real("position_x").notNull(),
    positionY: real("position_y").notNull(),

    // championStats — flat columns since it's always read/written as a
    // whole unit alongside the rest of the frame, never queried into alone.
    csAbilityHaste: real("cs_ability_haste").notNull(),
    csAbilityPower: real("cs_ability_power").notNull(),
    csArmor: real("cs_armor").notNull(),
    csArmorPen: real("cs_armor_pen").notNull(),
    csArmorPenPercent: real("cs_armor_pen_percent").notNull(),
    csAttackDamage: real("cs_attack_damage").notNull(),
    csAttackSpeed: real("cs_attack_speed").notNull(),
    csBonusArmorPenPercent: real("cs_bonus_armor_pen_percent").notNull(),
    csBonusMagicPenPercent: real("cs_bonus_magic_pen_percent").notNull(),
    csCcReduction: real("cs_cc_reduction").notNull(),
    csCooldownReduction: real("cs_cooldown_reduction").notNull(),
    csHealth: real("cs_health").notNull(),
    csHealthMax: real("cs_health_max").notNull(),
    csHealthRegen: real("cs_health_regen").notNull(),
    csLifesteal: real("cs_lifesteal").notNull(),
    csMagicPen: real("cs_magic_pen").notNull(),
    csMagicPenPercent: real("cs_magic_pen_percent").notNull(),
    csMagicResist: real("cs_magic_resist").notNull(),
    csMovementSpeed: real("cs_movement_speed").notNull(),
    csOmnivamp: real("cs_omnivamp").notNull(),
    csPhysicalVamp: real("cs_physical_vamp").notNull(),
    csPower: real("cs_power").notNull(),
    csPowerMax: real("cs_power_max").notNull(),
    csPowerRegen: real("cs_power_regen").notNull(),
    csSpellVamp: real("cs_spell_vamp").notNull(),

    // damageStats — same reasoning as championStats above.
    dsMagicDamageDone: integer("ds_magic_damage_done").notNull(),
    dsMagicDamageDoneToChampions: integer(
      "ds_magic_damage_done_to_champions",
    ).notNull(),
    dsMagicDamageTaken: integer("ds_magic_damage_taken").notNull(),
    dsPhysicalDamageDone: integer("ds_physical_damage_done").notNull(),
    dsPhysicalDamageDoneToChampions: integer(
      "ds_physical_damage_done_to_champions",
    ).notNull(),
    dsPhysicalDamageTaken: integer("ds_physical_damage_taken").notNull(),
    dsTotalDamageDone: integer("ds_total_damage_done").notNull(),
    dsTotalDamageDoneToChampions: integer(
      "ds_total_damage_done_to_champions",
    ).notNull(),
    dsTotalDamageTaken: integer("ds_total_damage_taken").notNull(),
    dsTrueDamageDone: integer("ds_true_damage_done").notNull(),
    dsTrueDamageDoneToChampions: integer(
      "ds_true_damage_done_to_champions",
    ).notNull(),
    dsTrueDamageTaken: integer("ds_true_damage_taken").notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.matchId, table.frameIndex, table.participantId],
    }),
    frameFk: index("match_timeline_pframes_frame_idx").on(
      table.matchId,
      table.frameIndex,
    ),
    participantIdx: index("match_timeline_pframes_participant_idx").on(
      table.participantId,
    ),
  }),
);

export const matchParticipantPerks = pgTable(
  "match_participant_perks",
  {
    matchId: text("match_id")
      .references(() => matches.matchId, { onDelete: "cascade" })
      .notNull(),
    participantId: integer("participant_id").notNull(),
    statPerkDefense: integer("stat_perk_defense"),
    statPerkFlex: integer("stat_perk_flex"),
    statPerkOffense: integer("stat_perk_offense"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.matchId, table.participantId] }),
    matchIdx: index("match_participant_perks_match_idx").on(table.matchId),
  }),
);

export const matchParticipantPerkStyles = pgTable(
  "match_participant_perk_styles",
  {
    matchId: text("match_id").notNull(),
    participantId: integer("participant_id").notNull(),
    description: text("description").notNull(), // "primaryStyle" | "subStyle"
    style: integer("style").notNull(), // rune tree id, e.g. Domination/Precision
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.matchId, table.participantId, table.description],
    }),
    perksFk: index("match_participant_perk_styles_perks_idx").on(
      table.matchId,
      table.participantId,
    ),
  }),
);

export const matchParticipantPerkSelections = pgTable(
  "match_participant_perk_selections",
  {
    matchId: text("match_id").notNull(),
    participantId: integer("participant_id").notNull(),
    description: text("description").notNull(), // links back to which style
    selectionOrder: integer("selection_order").notNull(), // 0-indexed position
    perk: integer("perk").notNull(), // the rune id itself
    var1: integer("var1"),
    var2: integer("var2"),
    var3: integer("var3"),
  },
  (table) => ({
    pk: primaryKey({
      columns: [
        table.matchId,
        table.participantId,
        table.description,
        table.selectionOrder,
      ],
    }),
    styleFk: index("match_participant_perk_selections_style_idx").on(
      table.matchId,
      table.participantId,
      table.description,
    ),
    perkIdx: index("match_participant_perk_selections_perk_idx").on(table.perk),
  }),
);
