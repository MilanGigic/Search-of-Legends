import fetchChampions from "@/actions/champions/fetchChampions";
import { getChampionSummary } from "@/actions/champions/fetchSelectedChampion";
import { getChampionBuild } from "@/actions/champions/getChampionBuild";
import { getChampionMatchups } from "@/actions/champions/getChampionMatchups";
import { getChampionSkillOrder } from "@/actions/champions/getChampionSkillOrder";
import { getChampionStartItems } from "@/actions/champions/getChampionStartItems";
import BuildBanner from "@/components/champions-page/BuildBanner";
import HeroSection from "@/components/champions-page/HeroSection";
import MatchupsPanel from "@/components/champions-page/MatchupsPanel";
import SpellOrderCard from "@/components/champions-page/SpellOrderCard";
import StartItemsGrid from "@/components/champions-page/StartItemsGrid";
import { fetchLatestVersion } from "@/lib/riot";
import { Suspense } from "react";

export async function generateStaticParams() {
  const champions = await fetchChampions();
  return champions.map((champion) => ({ name: champion.name }));
}

function SectionSkeleton({ label }: { label: string }) {
  return (
    <div className="p-16">
      <p className="text-sm uppercase tracking-widest text-[#726e78] mb-5">
        {label}
      </p>
      <div className="h-24 rounded-md bg-white/[0.03] animate-pulse" />
    </div>
  );
}

type SearchParamsPromise = Promise<{ role?: string }>;

async function BuildBannerLoader({
  id,
  version,
  defaultRole,
}: {
  id: number;
  version: string;
  defaultRole: string;
}) {
  const data = await getChampionBuild(id, defaultRole);
  return <BuildBanner data={data} version={version} />;
}

async function MatchupsPanelLoader({
  id,
  defaultRole,
  version,
}: {
  id: number;
  defaultRole: string;
  version: string;
}) {
  const data = await getChampionMatchups(id, defaultRole);
  return <MatchupsPanel data={data!} lane={defaultRole} version={version} />;
}

async function SpellOrderLoader({
  id,
  defaultRole,
}: {
  id: number;
  defaultRole: string;
}) {
  const data = await getChampionSkillOrder(id, defaultRole);
  return <SpellOrderCard data={data} />;
}

async function StartItemsGridLoader({
  id,
  defaultRole,
  version,
}: {
  id: number;
  defaultRole: string;
  version: string;
}) {
  const data = await getChampionStartItems(id, defaultRole);
  return <StartItemsGrid data={data} version={version} />;
}

const ChampionPage = async ({
  params,
}: {
  params: Promise<{ name: string }>;
}) => {
  const { name } = await params;

  const version = await fetchLatestVersion();
  if (!version) {
    console.log("No version found, exiting.");
    return;
  }

  const champ = await getChampionSummary(name);
  if (!champ) {
    console.log("No champion data found, exiting.");
    return;
  }

  const role = champ.lane;

  if (!role) {
    return (
      <div>
        <h1 className="text-white">No role found!</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-8">
      <HeroSection selectedChampion={champ} />

      <div className="flex w-full justify-between px-10 border-b border-[#EDEAE2]/17">
        <Suspense fallback={<SectionSkeleton label="Spell order" />}>
          <SpellOrderLoader id={champ.championId!} defaultRole={role} />
        </Suspense>
        <Suspense fallback={<SectionSkeleton label="Start items" />}>
          <StartItemsGridLoader
            id={champ.championId!}
            defaultRole={role}
            version={version}
          />
        </Suspense>
      </div>
      <Suspense fallback={<SectionSkeleton label="Build" />}>
        <BuildBannerLoader
          id={champ.championId!}
          version={version}
          defaultRole={role}
        />
      </Suspense>
      <Suspense fallback={<SectionSkeleton label="Matchups" />}>
        <MatchupsPanelLoader
          id={champ.championId!}
          defaultRole={role}
          version={version}
        />
      </Suspense>
    </div>
  );
};
export default ChampionPage;
