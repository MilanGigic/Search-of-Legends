import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  console.log("Received GET request:", req.url);

  const { searchParams } = new URL(req.url);
  const puuid = searchParams.get("puuid");
}
