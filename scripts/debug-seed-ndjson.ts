import "dotenv/config";
import fs from "fs";
import readline from "readline";
import path from "path";
import { db } from "@/db";
import { matchParticipants } from "@/db/schema";

const DEFAULT_BATCH_SIZE = 500;
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

// Debug function to inspect raw data
function debugRawData(raw: any, lineNo: number) {
  console.log(`\n=== DEBUG LINE ${lineNo} ===`);
  console.log("Raw object keys:", Object.keys(raw));
  console.log("Sample values:");
  console.log("  assists:", raw.assists, "type:", typeof raw.assists);
  console.log(
    "  champion_id:",
    raw.champion_id,
    "type:",
    typeof raw.champion_id
  );
  console.log("  match_id:", raw.match_id, "type:", typeof raw.match_id);
  console.log(
    "  bounty_level:",
    raw.bounty_level,
    "type:",
    typeof raw.bounty_level
  );

  // Check if the object has the expected structure
  const expectedFields = ["match_id", "assists", "champion_id", "queue_id"];
  const missingFields = expectedFields.filter((field) => !(field in raw));
  if (missingFields.length > 0) {
    console.log("Missing expected fields:", missingFields);
  }

  // Show first few entries of the raw object
  const entries = Object.entries(raw).slice(0, 10);
  console.log("First 10 raw entries:", entries);
}

// map raw row -> DB shape
function mapRow(raw: any, lineNo: number) {
  // Debug the first few rows
  if (lineNo <= 3) {
    debugRawData(raw, lineNo);
  }

  const mapped = {
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
    summonerName: safeString(raw.summoner_name),
    profileIcon: safeNumber(raw.profile_icon),
    riotIdGameName: safeString(raw.riot_id_game_name),
    riotIdTagline: safeString(raw.riot_id_tagline),
    summoner1Id: safeNumber(raw.summoner_1_id),
    summoner2Id: safeNumber(raw.summoner_2_id),
    teamId: safeNumber(raw.team_id),
    teamEarlySurrendered: safeNumber(raw.team_early_surrendered),
    win: safeNumber(raw.win),
    timePlayed: safeNumber(raw.time_played),
    totalMinionsKilled: safeNumber(raw.total_minions_killed),
    neutralMinionsKilled: safeNumber(raw.neutral_minions_killed),
    sightWardsBoughtInGame: safeNumber(raw.sight_wards_bought_in_game),
    visionScore: safeNumber(raw.vision_score),
    visionWardsBoughtInGame: safeNumber(raw.vision_wards_bought),
    wardsKilled: safeNumber(raw.wards_killed),
    wardsPlaced: safeNumber(raw.wards_placed),
    detectorWardsPlaced: safeNumber(raw.detector_wards_placed),
  };

  // Debug the mapping for first few rows
  if (lineNo <= 3) {
    console.log("Mapped values:");
    console.log("  matchId:", mapped.matchId);
    console.log("  assists:", mapped.assists);
    console.log("  championId:", mapped.championId);
    console.log("  bountyLevel:", mapped.bountyLevel);

    // Count how many fields are null
    const nullFields = Object.entries(mapped).filter(
      ([_, value]) => value === null
    );
    console.log(
      `Null fields count: ${nullFields.length}/${Object.keys(mapped).length}`
    );
    if (nullFields.length > 0) {
      console.log(
        "Some null fields:",
        nullFields.slice(0, 5).map(([key]) => key)
      );
    }
  }

  return mapped;
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
  let batch: any[] = [];

  // fast-skip lines if resuming
  for await (const line of rl) {
    lineNo++;
    if (lineNo < startAtLine) continue;

    if (!line.trim()) continue;

    let row: any;
    try {
      row = JSON.parse(line);
    } catch (e) {
      console.error(`Invalid JSON at line ${lineNo}:`, e);
      console.error("Line content:", line.substring(0, 200) + "...");
      continue; // skip bad line
    }

    const mappedRow = mapRow(row, lineNo);
    batch.push(mappedRow);

    if (batch.length >= batchSize) {
      await insertBatch(batch, lineNo);
      saveCheckpoint(ndjsonFile, lineNo);
      batch = [];
    }

    // Stop after processing 3 lines for debugging
    if (lineNo >= 3) {
      console.log("\n=== STOPPING AFTER 3 LINES FOR DEBUG ===");
      break;
    }
  }

  // flush last batch
  if (batch.length) {
    await insertBatch(batch, lineNo);
    saveCheckpoint(ndjsonFile, lineNo);
  }

  console.log("Debug seeding complete");
}

async function insertBatch(batch: any[], lineNo: number) {
  try {
    console.log(
      `\n=== ATTEMPTING TO INSERT BATCH OF ${batch.length} RECORDS ===`
    );

    // Debug the first record in the batch
    if (batch.length > 0) {
      console.log("First record in batch:");
      const firstRecord = batch[0];
      Object.entries(firstRecord).forEach(([key, value]) => {
        if (value === null || value === undefined || Number.isNaN(value)) {
          console.log(`  ${key}: ${value} (problematic)`);
        }
      });
    }

    await db.transaction(async (tx) => {
      await tx.insert(matchParticipants).values(batch).onConflictDoNothing();
    });
    console.log(
      `✅ Successfully inserted up to line ${lineNo} (+${batch.length})`
    );
  } catch (error) {
    console.error(`❌ Insert failed at ~line ${lineNo}:`, error);
    throw error;
  }
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
