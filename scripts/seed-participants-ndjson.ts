import "dotenv/config";
import fs from "fs";
import readline from "readline";
import path from "path";
import { db } from "@/db";
import { matchParticipants } from "@/db/schema";

const DEFAULT_BATCH_SIZE = 100;
const CHECKPOINT_DIR = ".seed";
const CHECKPOINT_FILE = path.join(
  CHECKPOINT_DIR,
  "participants.checkpoint.json"
);

// Safe number conversion that handles empty strings, null, undefined, and NaN
function safeNumber(value: any): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const num = Number(value);
  return isNaN(num) ? null : num;
}

// Safe string conversion that handles undefined and null
function safeString(value: any): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  return String(value);
}

// map raw row -> DB shape
function mapRow(raw: any) {
  return {
    matchId: safeString(raw.match_id),
    queueId: safeNumber(raw.queue_id),
    assists: safeNumber(raw.assists),
    baronKills: safeNumber(raw.baron_kills),
    bountyLevel: safeNumber(raw.bounty_level),
    champExperience: safeNumber(raw.champ_experience),
    champLevel: safeNumber(raw.champ_level),
    championId: safeNumber(raw.champion_id),
    championName: safeString(raw.champion_name),
    championTransform: safeNumber(raw.champion_transform),
    damageDealtToBuildings: safeNumber(raw.damage_dealt_to_buildings),
    damageDealtToObjectives: safeNumber(raw.damage_dealt_to_objectives),
    damageDealtToTurrets: safeNumber(raw.damage_dealt_to_turrets),
    damageSelfMitigated: safeNumber(raw.damage_self_mitigated),
    deaths: safeNumber(raw.deaths),
    magicDamageDealt: safeNumber(raw.magic_damage_dealt),
    magicDamageDealtToChampions: safeNumber(
      raw.magic_damage_dealt_to_champions
    ),
    magicDamageTaken: safeNumber(raw.magic_damage_taken),
    physicalDamageDealt: safeNumber(raw.physical_damage_dealt),
    physicalDamageDealtToChampions: safeNumber(
      raw.physical_damage_dealt_to_champions
    ),
    physicalDamageTaken: safeNumber(raw.physical_damage_taken),
    trueDamageDealt: safeNumber(raw.true_damage_dealt),
    trueDamageDealtToChampions: safeNumber(raw.true_damage_dealt_to_champions),
    trueDamageTaken: safeNumber(raw.true_damage_taken),
    totalDamageDealt: safeNumber(raw.total_damage_dealt),
    totalDamageDealtToChampions: safeNumber(
      raw.total_damage_dealt_to_champions
    ),
    totalDamageTaken: safeNumber(raw.total_damage_taken),
    doubleKills: safeNumber(raw.double_kills),
    dragonKills: safeNumber(raw.dragon_kills),
    firstBloodAssist: safeNumber(raw.first_blood_assist),
    firstBloodKill: safeNumber(raw.first_blood_kill),
    firstTowerAssist: safeNumber(raw.first_tower_assist),
    firstTowerKill: safeNumber(raw.first_tower_kill),
    killingSprees: safeNumber(raw.killing_sprees),
    kills: safeNumber(raw.kills),
    largestKillingSpree: safeNumber(raw.largest_killing_spree),
    largestMultiKill: safeNumber(raw.largest_multi_kill),
    pentaKills: safeNumber(raw.penta_kills),
    quadraKills: safeNumber(raw.quadra_kills),
    tripleKills: safeNumber(raw.triple_kills),
    goldEarned: safeNumber(raw.gold_earned),
    goldSpent: safeNumber(raw.gold_spent),
    itemsPurchased: safeNumber(raw.items_purchased),
    item0: safeNumber(raw.item0),
    item1: safeNumber(raw.item1),
    item2: safeNumber(raw.item2),
    item3: safeNumber(raw.item3),
    item4: safeNumber(raw.item4),
    item5: safeNumber(raw.item5),
    item6: safeNumber(raw.item6),
    individualPosition: safeString(raw.individual_position),
    teamPosition: safeString(raw.team_position),
    lane: safeString(raw.lane),
    role: safeString(raw.role),
    participantId: safeNumber(raw.participant_id),
    puuid: safeString(raw.puuid),
    summonerLevel: safeNumber(raw.summoner_level),
    profileIcon: safeNumber(raw.profile_icon),
    riotIdGameName: safeString(raw.riot_id_game_name),
    riotIdTagline: safeString(raw.riot_id_tagline),
    summonerName: safeString(raw.summoner_name),
    summoner1Id: safeNumber(raw.summoner1_id),
    summoner2Id: safeNumber(raw.summoner2_id),
    teamId: safeNumber(raw.team_id),
    teamEarlySurrendered: safeNumber(raw.team_early_surrendered),
    win: safeNumber(raw.win),
    timePlayed: safeNumber(raw.time_played),
    totalMinionsKilled: safeNumber(raw.total_minions_killed),
    neutralMinionsKilled: safeNumber(raw.neutral_minions_killed),
    sightWardsBoughtInGame: safeNumber(raw.sight_wards_bought_in_game),
    visionScore: safeNumber(raw.vision_score),
    visionWardsBoughtInGame: safeNumber(raw.vision_wards_bought_in_game),
    wardsKilled: safeNumber(raw.wards_killed),
    wardsPlaced: safeNumber(raw.wards_placed),
    detectorWardsPlaced: safeNumber(raw.detector_wards_placed),
  };
}

type Checkpoint = { file: string; lastLine: number };

function loadCheckpoint(file: string): number {
  try {
    const raw = fs.readFileSync(CHECKPOINT_FILE, "utf-8");
    const cp: Checkpoint = JSON.parse(raw);

    if (cp.file === file) return cp.lastLine;

    return 0;
  } catch (error) {
    return 0;
  }
}

function saveCheckpoint(file: string, lastLine: number) {
  if (!fs.existsSync(CHECKPOINT_DIR))
    fs.mkdirSync(CHECKPOINT_DIR, { recursive: true });
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify({ file, lastLine }));
}

async function main() {
  const ndjsonFile = process.argv[2];
  const batchSize = Number(process.argv[3] || DEFAULT_BATCH_SIZE);

  if (!ndjsonFile) {
    console.error(
      "Usage: tsx scripts/seed-ndjson.ts <input.ndjson> [batchSize]"
    );
    process.exit(1);
  }

  const startAtLine = loadCheckpoint(ndjsonFile);
  console.log(
    `Seeding from ${ndjsonFile} (resume at line ${startAtLine} with batch size = ${batchSize})`
  );

  const rl = readline.createInterface({
    input: fs.createReadStream(ndjsonFile, { encoding: "utf-8" }),
    crlfDelay: Infinity,
  });

  let lineNo = 0;
  let batch: any[] = 0 ? [] : [];
  batch = [];

  // fast-skip lines if resuming
  for await (const _ of rl as any) {
    lineNo++;
    if (lineNo < startAtLine) continue;

    const line = _;
    if (!line.trim()) continue;

    let row: any;
    try {
      row = JSON.parse(line);
    } catch (e) {
      console.error(`Invalid JSON at line ${lineNo}:`, e);
      continue; // skip bad line
    }

    batch.push(mapRow(row));

    if (batch.length >= batchSize) {
      await insertBatch(batch, lineNo);
      saveCheckpoint(ndjsonFile, lineNo);
      batch = [];
    }
  }

  // flush last batch
  if (batch.length) {
    await insertBatch(batch, lineNo);
    saveCheckpoint(ndjsonFile, lineNo);
  }


}

async function insertBatch(batch: DbParticipantData[], lineNo: number) {
  try {
    await db.transaction(async (tx) => {
      await tx.insert(matchParticipants).values(batch).onConflictDoNothing();
    });
    console.log(`Inserted up to line ${lineNo} (+${batch.length})`);
  } catch (error) {
    console.error(`Insert failed at ~line ${lineNo}:`, error);
    throw error;
  }
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
