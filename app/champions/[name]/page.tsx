"use server";

import { fetchSelectedChampion } from "@/actions/champions/fetchSelectedChampion";
import { getChampionBoots } from "@/actions/champions/getChampionBoots";
import { getChampionBuild } from "@/actions/champions/getChampionBuild";
import { getChampionMatchups } from "@/actions/champions/getChampionMatchups";
import { getChampionSkillOrder } from "@/actions/champions/getChampionSkillOrder";
import { getChampionStartItems } from "@/actions/champions/getChampionStartItems";
import BootsGrid from "@/components/champions-page/BootsGrid";
import BuildBanner from "@/components/champions-page/BuildBanner";
import HeroSection from "@/components/champions-page/HeroSection";
import MatchupsPanel from "@/components/champions-page/MatchupsPanel";
import SpellOrderCard from "@/components/champions-page/SpellOrderCard";
import StartItemsGrid from "@/components/champions-page/StartItemsGrid";
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

  const [matchups, builds, skillOrder, startItems, boots] = await Promise.all([
    getChampionMatchups(champ.key, role),
    getChampionBuild(champ.key, role),
    getChampionSkillOrder(champ.key, role),
    getChampionStartItems(champ.key, role),
    getChampionBoots(champ.key, role),
  ]);

  return (
    <div className="flex flex-col">
      <HeroSection />

      <BuildBanner data={builds} version={version} />
      <MatchupsPanel data={matchups} />
      <SummonerSpellsGrid data={builds} />
      <SpellOrderCard data={skillOrder} />
      <StartItemsGrid data={startItems} />
      <BootsGrid data={boots} />
    </div>
  );
};
export default ChampionPage;
