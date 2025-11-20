import "dotenv/config";
import fs from "fs";
import readline from "readline";
import path from "path";
import { db } from "@/db";
import { matchDetails } from "@/db/schema";

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

function sanitizeTimestamp(value: any): Date | null {
  if (!value || typeof value !== "string") return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}
// Debug function to inspect raw data
function debugRawData(raw: any, lineNo: number) {

  console.log("Raw object keys:", Object.keys(raw));
  // Check if the object has the expected structure
  const expectedFields = [
    "match_id",
    "game_creation",
    "game_mode",
    "game_type",
    "game_version",
    "map_id",
    "platform_id",
    "queue_id",
    "tournament_code",
    "created_at",
  ];
  const missingFields = expectedFields.filter((field) => !(field in raw));
  if (missingFields.length > 0) {

  }

  // Show first few entries of the raw object
  const entries = Object.entries(raw).slice(0, 10);

}

// map raw row -> DB shape
function mapRow(raw: any, lineNo: number) {
  // Debug the first few rows
  if (lineNo <= 3) {
    debugRawData(raw, lineNo);
  }

  const mapped = {
    matchId: safeString(raw.match_id),
    gameCreation: sanitizeTimestamp(raw.game_creation),
    gameMode: safeString(raw.game_mode),
    gameType: safeString(raw.game_type),
    gameVersion: safeString(raw.game_version),
    mapId: safeNumber(raw.map_id),
    platformId: safeString(raw.platform_id),
    queueId: safeNumber(raw.queue_id),
    tournamentCode: safeString(raw.tournament_code),
    createdAt: sanitizeTimestamp(raw.created_at),
  };

  // Debug the mapping for first few rows
  if (lineNo <= 3) {












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
  }

  // flush last batch
  if (batch.length) {
    await insertBatch(batch, lineNo);
    saveCheckpoint(ndjsonFile, lineNo);
  }


}

async function insertBatch(batch: any[], lineNo: number) {
  try {
    // Debug the first record in the batch
    if (batch.length > 0) {

      const firstRecord = batch[0];
      Object.entries(firstRecord).forEach(([key, value]) => {
        if (value === null || value === undefined || Number.isNaN(value)) {
          console.log(`  ${key}: ${value} (problematic)`);
        }
      });
    }

    await db.transaction(async (tx) => {
      await tx.insert(matchDetails).values(batch).onConflictDoNothing();
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
