interface Account {
  puuid: string;
  gameName: string;
  tagLine: string;
  region: string;
}

interface SummonerInfo {
  id: string;
  accountId: string;
  puuid: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

interface CompleteAccountInfo extends Account {
  summonerInfo?: SummonerInfo;
}

interface MatchHistoryParams {
  puuid: string;
  region: string;
  count?: number;
  start?: number;
  queue?: number;
}

interface RiotMatch {
  metadata: {
    matchId: string;
    participants: string[];
  };
  info: {
    gameCreation: number;
    gameDuration: number;
    gameMode: string;
    gameType: string;
    queueId: number;
    // ... other match info
    participants: Array<{
      puuid: string;
      championId: number;
      championName: string;
      kills: number;
      deaths: number;
      assists: number;
      // ... other participant data
    }>;
  };
}

interface RiotMatchDto {
  metadata: MetadataDto;
  info: InfoDto;
}

// Metadata Interfaces
interface MetadataDto {
  dataVersion?: string;
  matchId?: string;
  participants?: string[]; // List of participant PUUIDs
}

// Expanded Info Interface
interface InfoDto {
  // Game Identification and Metadata
  gameId: number;
  gameMode: string;
  gameName: string;
  gameType: string;
  gameVersion: string;
  mapId: number;
  platformId: string;
  queueId: number;
  tournamentCode: string;

  // Timestamps
  gameCreation: number;
  gameStartTimestamp: number;
  gameEndTimestamp: number;
  gameDuration: number;

  // End of Game Details
  endOfGameResult: string;

  // Match Participants and Teams
  participants: ParticipantData[];
  teams: TeamDto[];
}

// Main Participant Interface
interface ParticipantData {
  // Ping-related fields
  allInPings?: number;
  assistMePings?: number;
  commandPings?: number;
  enemyMissingPings?: number;
  enemyVisionPings?: number;
  holdPings?: number;
  getBackPings?: number;
  needVisionPings?: number;
  onMyWayPings?: number;
  pushPings?: number;
  visionClearedPings?: number;

  // Performance metrics
  assists?: number;
  baronKills?: number;
  bountyLevel?: number;
  champExperience?: number;
  champLevel?: number;
  championId?: number;
  championName?: string;
  championTransform?: number;

  // Damage-related fields
  damageDealtToBuildings?: number;
  damageDealtToObjectives?: number;
  damageDealtToTurrets?: number;
  damageSelfMitigated?: number;
  deaths?: number;

  // Damage breakdown
  magicDamageDealt?: number;
  magicDamageDealtToChampions?: number;
  magicDamageTaken?: number;
  physicalDamageDealt?: number;
  physicalDamageDealtToChampions?: number;
  physicalDamageTaken?: number;
  trueDamageDealt?: number;
  trueDamageDealtToChampions?: number;
  trueDamageTaken?: number;
  totalDamageDealt?: number;
  totalDamageDealtToChampions?: number;
  totalDamageTaken?: number;

  // Kill-related fields
  doubleKills?: number;
  dragonKills?: number;
  firstBloodAssist?: boolean;
  firstBloodKill?: boolean;
  firstTowerAssist?: boolean;
  firstTowerKill?: boolean;
  killingSprees?: number;
  kills?: number;
  largestKillingSpree?: number;
  largestMultiKill?: number;
  pentaKills?: number;
  quadraKills?: number;
  tripleKills?: number;

  // Economic fields
  goldEarned?: number;
  goldSpent?: number;
  itemsPurchased?: number;

  // Items
  item0?: number;
  item1?: number;
  item2?: number;
  item3?: number;
  item4?: number;
  item5?: number;
  item6?: number;

  // Position and lane
  individualPosition?: string;
  teamPosition?: string;
  lane?: string;
  role?: string;

  // Summoner-related fields
  participantId?: number;
  puuid?: string;
  summonerId?: string;
  summonerLevel?: number;
  summonerName?: string;
  profileIcon?: number;
  riotIdGameName?: string;
  riotIdTagline?: string;

  // Team-related
  teamId?: number;
  teamEarlySurrendered?: boolean;
  win?: boolean;

  // Vision-related
  detectorWardsPlaced?: number;
  sightWardsBoughtInGame?: number;
  visionScore?: number;
  visionWardsBoughtInGame?: number;
  wardsKilled?: number;
  wardsPlaced?: number;

  // Spell casts
  spell1Casts?: number;
  spell2Casts?: number;
  spell3Casts?: number;
  spell4Casts?: number;
  summoner1Casts?: number;
  summoner1Id?: number;
  summoner2Casts?: number;
  summoner2Id?: number;

  // Miscellaneous
  challenges?: ChallengesDto;
  perks?: PerksDto;
  timePlayed?: number;
  totalMinionsKilled?: number;
  totalTimeCCDealt?: number;
}

// Team-related Interfaces
interface TeamDto {
  bans?: BanDto[];
  objectives?: ObjectivesDto;
  teamId?: number;
  win?: boolean;
}

interface BanDto {
  championId?: number;
  pickTurn?: number;
}

interface ObjectivesDto {
  baron?: ObjectiveDto;
  champion?: ObjectiveDto;
  dragon?: ObjectiveDto;
  horde?: ObjectiveDto;
  inhibitor?: ObjectiveDto;
  riftHerald?: ObjectiveDto;
  tower?: ObjectiveDto;
}

interface ObjectiveDto {
  first?: boolean;
  kills?: number;
}

// Challenges Interface
interface ChallengesDto {
  twelveAssistStreakCount?: number;
  baronBuffGoldAdvantageOverThreshold?: number;
  controlWardTimeCoverageInRiverOrEnemyHalf?: number;
  earliestBaron?: number;
  earliestDragonTakedown?: number;
  earliestElderDragon?: number;
  earlyLaningPhaseGoldExpAdvantage?: number;
  highestChampionDamage?: number;
  killsOnLanersEarlyJungleAsJungler?: number;
  legendaryCount?: number;
  takedownsFirst25Minutes?: number;
  // Add other challenge fields as needed
}

// Perks Interface (minimal example, expand as needed)
interface PerksDto {
  // Define perks structure based on your specific needs
  statPerks: PerkStatsDto;
}

interface PerkStatsDto {
  defense: number;
  flex: number;
  offense: number;
}
