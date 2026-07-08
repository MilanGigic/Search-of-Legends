import { getCompletedName } from "@/lib/riot";
import Image from "next/image";
import Link from "next/link";

const TopFiveChampions = ({
  version,
  champions,
}: {
  version: string;
  champions: TopFiveChampions[];
}) => {
  return (
    <div className="py-2 px-1 border border-gray-700/70 text-slate-300 rounded-md flex flex-col gap-1 bg-gradient-to-b from-[#1B1F35] to-[#121624] ">
      <div className="shadow-2xl shadow-[#12162499]">
        <ul className="grid grid-cols-5 text-slate-300 font-semibold">
          <li className="text-center col-span-2">Champion</li>
          <li className="text-center">Tier</li>
          <li className="text-center">Winrate</li>
          <li className="text-center">Games</li>
        </ul>
        {champions.map((champion, index) => (
          <div key={index} className="h-[50px]">
            <ul className="px-1 py-1.5">
              <Link
                href={`/champions/${getCompletedName(champion.championName)}`}
                className="text-center grid grid-cols-5 hover:bg-[#2A2A40] transition-colors py-1 duration-200 rounded-md cursor-pointer"
              >
                <div className="flex items-center justify-start col-span-2 gap-2">
                  <div className="overflow-hidden rounded-full bg-black-700 shrink-0">
                    <Image
                      src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.championImage}`}
                      alt={champion.championName}
                      width={40}
                      height={40}
                      className="object-cover ml-1.5 inset-0 bg-transparent"
                    />
                  </div>
                  <h1 className="text-[#E2E6F2] flex flex-col items-center justify-center w-full">
                    {champion.championName}
                  </h1>
                </div>
                <p className="items-center flex flex-col text-center justify-center text-yellow-300 tracking-tighter">
                  {champion.tier === "S_PLUS" ? "S+" : champion.tier}
                </p>
                <p className="flex flex-col items-center justify-center text-slate-300">
                  {champion.winRate}%
                </p>
                <p className="flex flex-col items-center justify-center">
                  {champion.gamesPlayed}
                </p>
              </Link>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
export default TopFiveChampions;
