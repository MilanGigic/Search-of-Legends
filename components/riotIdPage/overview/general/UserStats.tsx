"use client";

import ChampionPerformanceCard from "./ChampionPerformanceCard";
import LastThirtyGames from "./LastThirtyGames";
import RolesPerformanceCard from "./RolesPerformanceCard";

interface UserStatsProps {
  riotId: string;
  puuid: string;
  version: string;
}

const UserStats = ({ riotId, puuid, version }: UserStatsProps) => {
  return (
    <div className="h-full w-full md:w-[300px] flex flex-col gap-2">
      <div className="sm:mr-4 rounded-md mt-5 shadow-sm shadow-slate-800">
        <LastThirtyGames puuid={puuid} version={version} />
      </div>
      <div className="sm:mr-4 rounded-md shadow-sm shadow-slate-800">
        <ChampionPerformanceCard
          puuid={puuid}
          riotId={riotId}
          version={version}
        />
      </div>
      <div className="sm:mr-4 rounded-md shadow-sm shadow-slate-800">
        <RolesPerformanceCard puuid={puuid} />
      </div>
    </div>
  );
};
export default UserStats;
