import ChampionPerformanceCard from "./ChampionPerformanceCard";
import RolesPerformanceCard from "./RolesPerformanceCard";

interface UserStatsProps {
  matchHistory: string[];
  puuid: string;
}

const UserStats = ({ matchHistory, puuid }: UserStatsProps) => {
  return (
    <div className="h-full flex flex-col gap-2">
      <div className="mr-4 rounded-md mt-2 shadow-md shadow-slate-800">
        <ChampionPerformanceCard puuid={puuid} />
      </div>
      <div className="mr-4 rounded-md shadow-md shadow-slate-800">
        <RolesPerformanceCard puuid={puuid} />
      </div>
    </div>
  );
};
export default UserStats;
