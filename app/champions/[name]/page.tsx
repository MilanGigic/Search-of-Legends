"use server";

import { fetchSelectedChampion } from "@/actions/champions/fetchSelectedChampion";
import { getChampionBuild } from "@/actions/champions/getChampionBuild";
import { getChampionMatchups } from "@/actions/champions/getChampionMatchups";
import { getChampionSkillOrder } from "@/actions/champions/getChampionSkillOrder";
import BuildBanner from "@/components/champions-page/BuildBanner";
import MatchupsPanel from "@/components/champions-page/MatchupsPanel";
import SpellOrderCard from "@/components/champions-page/SpellOrderCard";
import SummonerSpellsGrid from "@/components/champions-page/SummonerSpellsGrid";
import { fetchLatestVersion } from "@/lib/riot";

const ChampionPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ role: string }>;
}) => {
  const { name } = await params;
  const { role } = await searchParams;

  const version = await fetchLatestVersion();
  if (!version) {
    console.log("No version found, exiting.");
    return;
  }

  const champ = await fetchSelectedChampion(name, version);
  if (!champ) {
    console.log("No champion data found, exiting.");
    return;
  }

  const [matchups, builds, skillOrder] = await Promise.all([
    getChampionMatchups(champ.key, role),
    getChampionBuild(champ.key, role),
    getChampionSkillOrder(champ.key, role),
  ]);

  return (
    <div className="w-5xl mx-auto flex flex-col gap-4">
      <BuildBanner data={builds} />
      <MatchupsPanel data={matchups} />
      <SummonerSpellsGrid data={builds} />
      <SpellOrderCard data={skillOrder} />
    </div>
  );
};
export default ChampionPage;
