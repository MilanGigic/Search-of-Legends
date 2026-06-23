import UserCard from "@/components/UserCard";
import { notFound } from "next/navigation";
import getRegionalEndpoint from "@/actions/match-history/getRegionalEndpoint";
import { getChampionPerformance } from "@/actions/performance/getChampionPerformance";
import ChampionStatsClient from "@/components/riotIdPage/champions/ChampionStatsClient";
import { fetchLatestVersion } from "@/lib/riot";
import { fetchAccountByName } from "@/actions/fetchAccountByName";

interface AccountPageProps {
  params: Promise<{ riotId: string }>; // params is now a Promise
}

const ChampionsPage = async ({ params }: AccountPageProps) => {
  const { riotId } = await params;
  const decodedRiotId = decodeURIComponent(riotId);
  const separator = decodedRiotId.lastIndexOf("-");
  if (separator === -1) return notFound();
  const gameName = decodedRiotId.slice(0, separator);
  const tagLine = decodedRiotId.slice(separator + 1);
  console.log("Parsed gameName and tagLine:", { gameName, tagLine });

  if (!gameName || !tagLine) {
    console.error("Error: Invalid riotId format");
    return notFound();
  }

  const accountData = await fetchAccountByName(gameName, tagLine);

  const version = await fetchLatestVersion();

  if (!accountData?.region) {
    console.error("Missing region for account:", accountData);
    return notFound();
  }
  const puuid = accountData.puuid;

  const champions = await getChampionPerformance(puuid);
  return (
    <div className="relative z-10 min-h-screen p-4 text-slate-300">
      <div className="pt-5 border border-gray-700/70 sm:mt-3 max-w-5xl mx-auto rounded-md flex flex-col gap-1 bg-gradient-to-b from-[#121624] to-[#1B1F35]  shadow-sm shadow-[#2A2A40]">
        <ChampionStatsClient champions={champions} version={version!} />
      </div>
    </div>
  );
};
export default ChampionsPage;
