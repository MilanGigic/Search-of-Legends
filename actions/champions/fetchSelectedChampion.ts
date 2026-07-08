"use server";

export async function fetchSelectedChampion(name: string, version: string) {
  if (!name) return null;

  const res = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion/${name}.json`,
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch ${name}: ${res.statusText}`);
  }

  const data: ChampionDetailData = await res.json();

  const championData = data.data[name];

  return championData;
}
