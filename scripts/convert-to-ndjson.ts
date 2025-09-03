import fs from "fs";
import { pipeline } from "stream";
import { parser } from "stream-json";
import { streamArray } from "stream-json/streamers/StreamArray";

const input = process.argv[2];
const output = process.argv[3] || input.replace(/\.json$/i, ".ndjson");

if (!input) {
  console.error(
    "Usage: tsx scripts/convert-to-ndjson.ts <input.json> [output.ndjson]"
  );
  process.exit(1);
}

const out = fs.createWriteStream(output, { encoding: "utf-8" });

pipeline(
  fs.createReadStream(input),
  parser(),
  streamArray(),
  async function (source) {
    for await (const { value } of source as any) {
      out.write(JSON.stringify(value) + "\n");
    }
    out.end();
    console.log(`Wrote NDJSON to ${output}`);
  },
  (err) => {
    if (err) {
      console.error("Conversion failed:", err);
      process.exit(1);
    }
  }
);
