import fetchChampions from "@/actions/champions/fetchChampions";
import { NextResponse } from "next/server";

export async function GET() {
  const champions = await fetchChampions();

  const slim = champions.map((c) => ({
    name: c.name,
    image: c.image,
  }));

  return NextResponse.json(slim);
}
