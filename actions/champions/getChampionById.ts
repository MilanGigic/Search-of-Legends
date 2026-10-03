"use server";

import fetchChampions from "./fetchChampions";
import { ChampionSummary } from "./fetchSelectedChampion";

type Champion = {
  id: string;
  key: number;
  name: string;
  title: string;
  blurb: string;
  image: string;
  tags: string[];
  accentColor: string | null;
};

export async function getChampionById(
  championId: number,
): Promise<Champion | null> {
  const champions = await fetchChampions();
  const champion = champions.find((c) => c.key === championId);

  if (!champion) {
    console.warn(`Champion with ID ${championId} not found.`);
    return null;
  }
  return champion;
}
