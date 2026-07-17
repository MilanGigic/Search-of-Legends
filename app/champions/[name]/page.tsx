import fetchChampions from "@/actions/champions/fetchChampions";
import {
  ChampionSummary,
  getChampionSummary,
} from "@/actions/champions/fetchSelectedChampion";
import { getChampionBuild } from "@/actions/champions/getChampionBuild";
import { getChampionMatchups } from "@/actions/champions/getChampionMatchups";
import { getChampionSkillOrder } from "@/actions/champions/getChampionSkillOrder";
import { getChampionStartItems } from "@/actions/champions/getChampionStartItems";
import BuildBanner from "@/components/champions-page/BuildBanner";
import HeroSection from "@/components/champions-page/HeroSection";
import MatchupsPanel from "@/components/champions-page/MatchupsPanel";
import SpellOrderCard from "@/components/champions-page/SpellOrderCard";
import StartItemsGrid from "@/components/champions-page/StartItemsGrid";
import { fetchLatestVersion } from "@/lib/riot-server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export async function generateStaticParams() {
  const champions = await fetchChampions();
  // Ensure you use champion.id (e.g., "AurelionSol") instead of display name if using DDragon slugs
  return champions.map((champion) => ({ name: champion.id || champion.name }));
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

async function BuildBannerLoader({
  id,
  version,
  defaultRole,
  champ,
}: {
  id: number;
  version: string;
  defaultRole: string;
  champ: ChampionSummary | null;
}) {
  const data = await getChampionBuild(id, defaultRole);
  return <BuildBanner data={data} version={version} selectedChampion={champ} />;
}

async function MatchupsPanelLoader({
  id,
  defaultRole,
  version,
  champ,
}: {
  id: number;
  defaultRole: string;
  version: string;
  champ: ChampionSummary | null;
}) {
  const data = await getChampionMatchups(id, defaultRole);

  if (!data) {
    return <div>No matchup data available</div>;
  }
  return (
    <MatchupsPanel
      data={data}
      lane={defaultRole}
      selectedChampion={champ}
      version={version}
    />
  );
}

async function SpellOrderLoader({
  id,
  defaultRole,
  champ,
}: {
  id: number;
  defaultRole: string;
  champ: ChampionSummary | null;
}) {
  const data = await getChampionSkillOrder(id, defaultRole);
  return <SpellOrderCard data={data} selectedChampion={champ} />;
}

async function StartItemsGridLoader({
  id,
  defaultRole,
  version,
  champ,
}: {
  id: number;
  defaultRole: string;
  version: string;
  champ: ChampionSummary | null;
}) {
  const data = await getChampionStartItems(id, defaultRole);
  return (
    <StartItemsGrid data={data} version={version} selectedChampion={champ} />
  );
}

const ChampionPage = async ({
  params,
}: {
  params: Promise<{ name: string }>;
}) => {
  const { name } = await params;

  const [version, champ] = await Promise.all([
    fetchLatestVersion(),
    getChampionSummary(name),
  ]);

  if (!version) {
    console.error("No version found, exiting.");
    return null; // Must return null or notFound(), NEVER an empty return;
  }

  if (!champ) {
    console.error("No champion data found for:", name);
    notFound(); // Triggers the Next.js 404 page cleanly without breaking prerender
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
          <SpellOrderLoader
            id={champ.championId!}
            defaultRole={role}
            champ={champ}
          />
        </Suspense>
        <Suspense fallback={<SectionSkeleton label="Start items" />}>
          <StartItemsGridLoader
            id={champ.championId!}
            defaultRole={role}
            version={version}
            champ={champ}
          />
        </Suspense>
      </div>
      <Suspense fallback={<SectionSkeleton label="Build" />}>
        <BuildBannerLoader
          id={champ.championId!}
          version={version}
          defaultRole={role}
          champ={champ}
        />
      </Suspense>
      <Suspense fallback={<SectionSkeleton label="Matchups" />}>
        <MatchupsPanelLoader
          id={champ.championId!}
          defaultRole={role}
          version={version}
          champ={champ}
        />
      </Suspense>
    </div>
  );
};

export default ChampionPage;
