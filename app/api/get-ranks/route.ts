import { NextRequest, NextResponse } from "next/server";
import { fetchSoloRank } from "@/lib/riot-rank";

const PLATFORMS = new Set([
  "br1",
  "eun1",
  "euw1",
  "jp1",
  "kr",
  "la1",
  "la2",
  "na1",
  "oc1",
  "tr1",
  "ru",
  "ph2",
  "sg2",
  "th2",
  "tw2",
  "vn2",
]);

export async function POST(req: NextRequest) {
  const { puuids, region } = await req.json();

  if (!PLATFORMS.has(region) || !Array.isArray(puuids)) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const unique = [...new Set<string>(puuids.filter(Boolean))].slice(0, 10);

  const entries = await Promise.all(
    unique.map(async (puuid) => {
      try {
        return [puuid, await fetchSoloRank(puuid, region)] as const;
      } catch {
        return [puuid, null] as const;
      }
    }),
  );

  return NextResponse.json(Object.fromEntries(entries));
}
