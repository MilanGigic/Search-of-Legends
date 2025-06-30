import ChampionPerformanceCard from "./ChampionPerformanceCard";
import RolesPerformanceCard from "./RolesPerformanceCard";

interface UserStatsProps {
  matchHistory: string[];
  puuid: string;
}

const UserStats = ({ matchHistory, puuid }: UserStatsProps) => {
  return (
    <div className="h-full w-full md:w-[300px] flex flex-col gap-2">
      <div className=" sm:mr-4 rounded-md mt-2 shadow-sm shadow-slate-800">
        <ChampionPerformanceCard puuid={puuid} />
      </div>
      <div className="sm:mr-4 rounded-md shadow-sm shadow-slate-800">
        <RolesPerformanceCard puuid={puuid} />
      </div>
    </div>
  );
};
export default UserStats;
