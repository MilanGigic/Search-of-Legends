import ChampionPerformanceCard from "./ChampionPerformanceCard";
import LastThirtyGames from "./LastThirtyGames";
import RolesPerformanceCard from "./RolesPerformanceCard";

interface UserStatsProps {
  riotId: string;
  puuid: string;
}

const UserStats = ({ riotId, puuid }: UserStatsProps) => {
  return (
    <div className="h-full w-full md:w-[300px] flex flex-col gap-2">
      <div className="sm:mr-4 rounded-md mt-5 shadow-sm shadow-slate-800">
        <LastThirtyGames puuid={puuid} />
      </div>
      <div className="sm:mr-4 rounded-md shadow-sm shadow-slate-800">
        <ChampionPerformanceCard puuid={puuid} riotId={riotId} />
      </div>
      <div className="sm:mr-4 rounded-md shadow-sm shadow-slate-800">
        <RolesPerformanceCard puuid={puuid} />
      </div>
    </div>
  );
};
export default UserStats;
