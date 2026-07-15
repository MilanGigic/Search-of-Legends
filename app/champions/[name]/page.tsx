import fetchChampions from "@/actions/champions/fetchChampions";
import { fetchSelectedChampion } from "@/actions/champions/fetchSelectedChampion";
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
  searchParams,
}: {
  id: number;
  version: string;
  defaultRole: string;
  searchParams: SearchParamsPromise;
}) {
  const { role } = await searchParams;
  const data = await getChampionBuild(id, role ?? defaultRole);
  return <BuildBanner data={data} version={version} />;
}

async function MatchupsPanelLoader({
  id,
  defaultRole,
  searchParams,
  version,
}: {
  id: number;
  defaultRole: string;
  searchParams: SearchParamsPromise;
  version: string;
}) {
  const { role } = await searchParams;
  const effectiveRole = role ?? defaultRole;
  const data = await getChampionMatchups(id, effectiveRole);
  return <MatchupsPanel data={data!} lane={effectiveRole} version={version} />;
}

async function SpellOrderLoader({
  id,
  defaultRole,
  searchParams,
}: {
  id: number;
  defaultRole: string;
  searchParams: SearchParamsPromise;
}) {
  const { role } = await searchParams;
  const data = await getChampionSkillOrder(id, role ?? defaultRole);
  return <SpellOrderCard data={data} />;
}

async function StartItemsGridLoader({
  id,
  defaultRole,
  searchParams,
  version,
}: {
  id: number;
  defaultRole: string;
  searchParams: SearchParamsPromise;
  version: string;
}) {
  const { role } = await searchParams;
  const data = await getChampionStartItems(id, role ?? defaultRole);
  return <StartItemsGrid data={data} version={version} />;
}

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

  return (
    <div className="flex flex-col p-8">
      <HeroSection version={version} />

      <div className="flex w-full justify-between px-10 border-b border-[#EDEAE2]/17">
        <Suspense fallback={<SectionSkeleton label="Spell order" />}>
          <SpellOrderLoader
            id={champ.key}
            defaultRole={role}
            searchParams={searchParams}
          />
        </Suspense>
        <Suspense fallback={<SectionSkeleton label="Start items" />}>
          <StartItemsGridLoader
            id={champ.key}
            defaultRole={role}
            version={version}
            searchParams={searchParams}
          />
        </Suspense>
      </div>
      <Suspense fallback={<SectionSkeleton label="Build" />}>
        <BuildBannerLoader
          id={champ.key}
          version={version}
          defaultRole={role}
          searchParams={searchParams}
        />
      </Suspense>
      <Suspense fallback={<SectionSkeleton label="Matchups" />}>
        <MatchupsPanelLoader
          id={champ.key}
          defaultRole={role}
          version={version}
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  );
};
export default ChampionPage;
