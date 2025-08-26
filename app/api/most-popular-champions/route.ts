import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { chain } from "stream-chain";
import { parser } from "stream-json";
import { streamArray } from "stream-json/streamers/StreamArray";

export async function GET() {
  const filePath = path.join(
    process.cwd(),
    "public",
    "joined-match_participants.json"
  );

  return new Promise((resolve, reject) => {
    const championCount: Record<string, number> = {};

    const pipeline = chain([
      fs.createReadStream(filePath),
      parser(),
      streamArray(), // stream over array elements
    ]);

    pipeline.on("data", ({ value }) => {
      const champId = value.championId;
      if (champId) {
        championCount[champId] = (championCount[champId] || 0) + 1;
      }
    });

    pipeline.on("end", () => {
      const top10 = Object.entries(championCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([championId, count]) => ({ championId, count }));

      resolve(NextResponse.json({ top10 }));
    });

    pipeline.on("error", (err) => reject(err));
  });
}
