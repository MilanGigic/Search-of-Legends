"use client";

import { fetchTopFivePerRegion } from "@/actions/fetchTopFivePerRegion";
import { useDataStore } from "@/lib/store/useConstantDataStore";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Spinner } from "../ui/spinner";

const TopFivePlayers = ({
  version,
  selectedRegion,
}: {
  version: string;
  selectedRegion: string;
}) => {
  const { topFive, setTopFive } = useDataStore();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const data = await fetchTopFivePerRegion(selectedRegion);

      if (data.length > 0) {
        setTopFive(data as TopFivePerRegion[]);
        setIsLoading(false);
      }
    })();
  }, [selectedRegion]);

  return (
    <div className="py-2 px-1 border border-gray-700/70 text-sm text-slate-300 rounded-md flex flex-col bg-gradient-to-b from-[#1B1F35] to-[#121624]">
      <ul className="grid grid-cols-6 text-slate-300 font-semibold">
        <li className="text-center font-semibold">Rank</li>
        <li className="col-span-3 font-semibold text-center">Player</li>
        <li className="text-center font-semibold">Winrate</li>
        <li className="text-center font-semibold">LP</li>
      </ul>
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Spinner className="w-16 h-16" />
        </div>
      ) : (
        <div>
          {topFive.map((account) => (
            <div className="shadow-2xl shadow-[#12162499]" key={account.puuid}>
              <ul className="px-1 py-1.5">
                <Link
                  href={`/${encodeURIComponent(
                    account.gameName!,
                  )}-${encodeURIComponent(account.tagLine!)}`}
                  className="text-center grid grid-cols-6 hover:bg-[#2A2A40] transition-colors py-1 duration-200 rounded-md cursor-pointer"
                >
                  <h1 className="text-center flex flex-col items-center justify-center">
                    {account.rank}
                  </h1>
                  <div className="flex items-center justify-start col-span-3 gap-0.5">
                    <Image
                      src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${account.profileIconId}.png`}
                      alt={`Rank 1`}
                      width={30}
                      height={30}
                      className="border border-gray-500 rounded-full"
                    />
                    <h1 className="text-[#E2E6F2] flex flex-col text-sm items-start justify-start w-full">
                      {account.gameName}
                    </h1>
                  </div>
                  <p className="flex flex-col items-center text-xs justify-center text-slate-300 tracking-tighter">
                    {Math.round(
                      (account.wins! / (account.wins! + account.losses!)) * 100,
                    )}
                    %
                    <span className="text-[11px] flex text-gray-400">
                      {account.wins}W / {account.losses}L
                    </span>
                  </p>
                  <p className="flex flex-col items-center justify-center">
                    {account.leaguePoints}
                  </p>
                </Link>
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default TopFivePlayers;
