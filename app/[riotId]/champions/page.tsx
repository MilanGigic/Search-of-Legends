import { notFound } from "next/navigation";
import { getChampionPerformance } from "@/actions/performance/getChampionPerformance";
import ChampionStatsClient from "@/components/riotIdPage/champions/ChampionStatsClient";
import { fetchLatestVersion } from "@/lib/riot-server";
import { fetchAccountByName } from "@/actions/fetchAccountByName";
import { Suspense } from "react";
import ChampionsTableSkeleton from "@/components/riotIdPage/champions/ChampionsTableSkeleton";

interface AccountPageProps {
  params: Promise<{ riotId: string }>;
}

export default function ChampionsPage({ params }: AccountPageProps) {
  return (
    <Suspense fallback={<ChampionsTableSkeleton />}>
      <ChampionsContent params={params} />
    </Suspense>
  );
}

async function ChampionsContent({ params }: AccountPageProps) {
  const { riotId } = await params;
  const decodedRiotId = decodeURIComponent(riotId);
  const separator = decodedRiotId.lastIndexOf("-");
  if (separator === -1) return notFound();

  const gameName = decodedRiotId.slice(0, separator);
  const tagLine = decodedRiotId.slice(separator + 1);
  if (!gameName || !tagLine) return notFound();

  const accountData = await fetchAccountByName(gameName, tagLine);
  const version = await fetchLatestVersion();

  if (!accountData?.region) return notFound();

  const champions = await getChampionPerformance(accountData.puuid);

  return (
    <div className="relative z-10 min-h-screen p-4 text-slate-300">
      <div className="pt-5 border border-gray-700/70 sm:mt-3 max-w-5xl mx-auto rounded-md flex flex-col gap-1 bg-gradient-to-b from-[#121624] to-[#1B1F35] shadow-sm shadow-[#2A2A40]">
        <ChampionStatsClient champions={champions} version={version!} />
      </div>
    </div>
  );
}
