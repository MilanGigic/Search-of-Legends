import ChampionPerformanceCard from "./ChampionPerformanceCard";
import RolesPerformanceCard from "./RolesPerformanceCard";

interface UserStatsProps {
  matchHistory: string[];
  puuid: string;
}

const UserStats = ({ matchHistory, puuid }: UserStatsProps) => {
  return (
    <div className="h-full flex flex-col gap-2">
      <div className="m-2 shadow-md shadow-slate-800">
        <ChampionPerformanceCard puuid={puuid} />
      </div>
      <div>
        <RolesPerformanceCard />
      </div>
    </div>
  );
};
export default UserStats;
