interface Account {
  puuid: string;
  gameName: string;
  tagLine: string;
  region: string;
}
interface AccountData {
  puuid: string;
  gameName: string;
  tagLine: string;
}

interface SummonerInfo {
  id: string;
  accountId: string;
  puuid: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

interface SummonerRankInfo {
  leagueId: string;
  summonerId: string;
  puuid: string;
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  hotStreak: boolean;
  veteran: boolean;
  freshBlood: boolean;
  inactive: boolean;
  miniSeries?: MiniSeriesDTO; // Optional in case the player isn't in a promo series
}

interface LeagueEntry {
  summonerId: string;
  puuid: string;
  leaguePoints: number;
  rank: string;
  wins: number;
  losses: number;
  veteran: boolean;
  inactive: boolean;
  freshBlood: boolean;
  hotStreak: boolean;
}

interface LeagueData {
  tier: string;
  leagueId: string;
  queue: string;
  name: string;
  entries: LeagueEntry[];
}

interface CompleteSummonerInfo extends SummonerInfo {
  summoner: SummonerRankInfo;
}

interface CompleteAccountInfo extends Account {
  summonerInfo?: SummonerInfo;
}

interface DbSummonerInfo {
  puuid: string;
  gameName: string;
  tagLine: string;
  region: string;
  summonerId: string;
  summonerLevel: number;
  profileIconId: number;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  revisionDate: number;
  lastUpdated: number;
}

interface DbGameInfo {
  info: {
    matchId: string;
    gameCreation: Date | null;
    gameMode: string;
    gameType: string;
    gameVersion: string | null;
    mapId: number | null;
    platformId: string | null;
    queueId: number;
    tournamentCode: string | null;
    createdAt: Date | null;
  };
  participants: (ParticipantData & { matchId: string })[];
  objectives: {
    matchId: string;
    baron: string;
    champion: string;
    dragon: string;
    inhibitor: string;
    riftHerald: string;
    tower: string;
  }[];
  teams: {
    matchId: string;
    teamId: number | null;
    win: number | null;
  }[];
  bans: {
    matchId: string;
    championId: number | null;
    pickTurn: number | null;
  }[];
}

interface MatchHistoryParams {
  puuid: string;
  region: string;
  count?: number;
  start?: number;
  queue?: number;
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

interface GameDataProps {
  id: string;
  data: DbGameInfo | null;
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
  gameCreation: Date;

  // End of Game Details
  endOfGameResult: string;

  // Match Participants and Teams
  participants: ParticipantData[];
  teams: TeamDto[];
}

// Main Participant Interface
interface ParticipantData {
  // Performance metrics
  assists: number | null;
  baronKills: number | null;
  bountyLevel: number | null;
  champExperience: number | null;
  champLevel: number | null;
  championId: number | null;
  championName: string | null;
  championTransform: number | null;

  // Damage-related fields
  damageDealtToBuildings: number | null;
  damageDealtToObjectives: number | null;
  damageDealtToTurrets: number | null;
  damageSelfMitigated: number | null;
  deaths: number | null;

  // Damage breakdown
  magicDamageDealt: number | null;
  magicDamageDealtToChampions: number | null;
  magicDamageTaken: number | null;
  physicalDamageDealt: number | null;
  physicalDamageDealtToChampions: number | null;
  physicalDamageTaken: number | null;
  trueDamageDealt: number | null;
  trueDamageDealtToChampions: number | null;
  trueDamageTaken: number | null;
  totalDamageDealt: number | null;
  totalDamageDealtToChampions: number | null;
  totalDamageTaken: number | null;

  // Kill-related fields
  doubleKills: number | null;
  dragonKills: number | null;
  firstBloodAssist: number | null;
  firstBloodKill: number | null;
  firstTowerAssist: number | null;
  firstTowerKill: number | null;
  killingSprees: number | null;
  kills: number | null;
  largestKillingSpree: number | null;
  largestMultiKill: number | null;
  pentaKills: number | null;
  quadraKills: number | null;
  tripleKills: number | null;

  // Economic fields
  goldEarned: number | null;
  goldSpent: number | null;
  itemsPurchased: number | null;

  // Items
  item0: number | null;
  item1: number | null;
  item2: number | null;
  item3: number | null;
  item4: number | null;
  item5: number | null;
  item6: number | null;

  // Position and lane
  individualPosition: string | null;
  teamPosition: string | null;
  lane: string | null;
  role: string | null;

  // Summoner-related fields
  participantId: number | null;
  puuid: string | null;
  summonerId: string | null;
  summonerLevel: number | null;
  summonerName: string | null;
  profileIcon: number | null;
  riotIdGameName: string | null;
  riotIdTagline: string | null;
  queueId: number;

  summoner1Id: number | null;
  summoner2Id: number | null;

  // Team-related
  teamId: number | null;
  teamEarlySurrendered: number | null;
  win: number | null;

  // Miscellaneous
  timePlayed: number | null;
  totalMinionsKilled: number | null;
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

interface ChampionDetailData {
  type: string;
  format: string;
  version: string;
  data: {
    [key: string]: ChampionDetail;
  };
}

interface ChampionDetail {
  id: string;
  key: string;
  name: string;
  title: string;
  image: {
    full: string;
    sprite: string;
    group: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
  skins: Array<{
    id: string;
    num: number;
    name: string;
    chromas: boolean;
  }>;
  lore: string;
  blurb: string;
  allytips: string[];
  enemytips: string[];
  tags: string[];
  partype: string;
  info: {
    attack: number;
    defense: number;
    magic: number;
    difficulty: number;
  };
  stats: {
    [key: string]: number;
  };
  spells: Array<{
    id: string;
    name: string;
    description: string;
    tooltip: string;
    maxrank: number;
    cooldown: number[];
    cost: number[];
    datavalues: {};
    image: {
      full: string;
      sprite: string;
      group: string;
      x: number;
      y: number;
      w: number;
      h: number;
    };
  }>;
  passive: {
    name: string;
    description: string;
    image: {
      full: string;
      sprite: string;
      group: string;
      x: number;
      y: number;
      w: number;
      h: number;
    };
  };
}
interface MiniSeriesDTO {
  losses: number;
  progress: string;
  target: number;
  wins: number;
}
