import fetchChampions from "@/lib/actions/fetchChampions";
import { getChampionPerformance } from "@/lib/actions/getChampionPerformance";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ChampionPerformanceCard = async ({ puuid }: { puuid: string }) => {
  const champions = await fetchChampions();
  console.log("Champions:", champions);

  const data = await getChampionPerformance(puuid);
  console.log("Champion performance data:", data);

  const top5 = data
    .sort((a, b) => Number(b.gamesPlayed) - Number(a.gamesPlayed))
    .slice(0, 5);

  console.log("Top 5", top5);
  return (
    <div className="pt-5 border border-gray-700/70 sm:mt-3 rounded-md flex flex-col gap-1 bg-gradient-to-b from-[#121624] to-[#1B1F35]  shadow-sm shadow-[#2A2A40]">
      <div>
        <ul className="grid grid-cols-4 text-slate-300 font-semibold">
          <li className="text-center col-start-2">KDA</li>
          <li className="text-center">Games</li>
          <li className="text-center">WR</li>
        </ul>
        <ul className="mt-1">
          {top5.map((champ, index) => (
            <li
              key={champ.championId}
              className={`text-center grid grid-cols-4 py-1 ${
                index < top5.length - 1 ? "border-b" : ""
              }`}
            >
              <div className="flex items-center justify-center">
                <Image
                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/${champ.championImage}`}
                  alt={champ.championName}
                  width={40}
                  height={40}
                  className="mt-1 border border-gray-500 rounded-full"
                />
              </div>

              <p className="items-center flex flex-col text-center text-slate-300 tracking-tighter">
                {champ.kda}
                <span className="text-sm text-gray-400">
                  {Math.round(champ.avgKills)}/
                  <span className="text-red-700">
                    {Math.round(champ.avgDeaths)}
                  </span>
                  /{Math.round(champ.avgAssists)}
                </span>
              </p>

              <p className="flex items-center justify-center text-slate-300">
                {champ.gamesPlayed}
              </p>

              <p
                className={`${
                  Math.round((champ.wins / champ.gamesPlayed) * 100) >= 50
                    ? "text-emerald-600"
                    : "text-red-700"
                }
                  ${
                    Math.round((champ.wins / champ.gamesPlayed) * 100) === 50 &&
                    "text-white"
                  }
                flex items-center justify-center`}
              >
                {Math.round((champ.wins / champ.gamesPlayed) * 100)}
                <span className="text-gray-300 text-xs">%</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
      <Link href="/#">
        <Button className="w-full items-center justify-center bg-[#2A2A40]/55 text-slate-300 hover:bg-[#2A2A40] rounded-t-none py-2 mt-2 cursor-pointer rounded-b-md">
          More Champions...
        </Button>
      </Link>
    </div>
  );
};
export default ChampionPerformanceCard;
