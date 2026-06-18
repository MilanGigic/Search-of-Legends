"use client";

import { fetchTopFivePerRegion } from "@/actions/fetchTopFivePerRegion";
import { useDataStore } from "@/lib/store/useConstantDataStore";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Spinner } from "../ui/spinner";

const TopFivePlayers = ({
  version,
  selectedRegion,
}: {
  version: string;
  selectedRegion: string;
}) => {
  const { topFive, setTopFive } = useDataStore();

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    startTransition(async () => {
      const data = await fetchTopFivePerRegion(selectedRegion);
      if (cancelled) return;
      setTopFive(data as TopFivePerRegion[]);
    });

    return () => {
      cancelled = true;
    };
  }, [selectedRegion]);

  const isInitialLoad = topFive.length === 0 && isPending;

  return (
    <div className="py-2 px-1 border border-gray-700/70 text-sm text-slate-300 rounded-md flex flex-col bg-gradient-to-b from-[#1B1F35] to-[#121624]">
      <ul className="grid grid-cols-6 text-slate-300 font-semibold">
        <li className="text-center font-semibold">Rank</li>
        <li className="col-span-3 font-semibold text-center">Player</li>
        <li className="text-center font-semibold">Winrate</li>
        <li className="text-center font-semibold">LP</li>
      </ul>
      {isInitialLoad ? (
        <div className="flex items-center justify-center py-4">
          <Spinner className="w-16 h-16" />
        </div>
      ) : (
        <div
          className={`transition-opacity duration-150 ${isPending ? "opacity-50" : "opacity-100"}`}
        >
          {topFive.map((account, index) => (
            <div className="shadow-2xl shadow-[#12162499]" key={account.puuid}>
              <ul className="px-1 py-1.5">
                <Link
                  href={`/${encodeURIComponent(
                    account.gameName!,
                  )}-${encodeURIComponent(account.tagLine!)}`}
                  className="text-center grid grid-cols-6 hover:bg-[#2A2A40] transition-colors py-1 duration-200 rounded-md cursor-pointer"
                >
                  <h1 className="text-center flex flex-col items-center justify-center">
                    {index + 1} {/* Rank */}
                  </h1>
                  <div className="flex items-center justify-start col-span-3 gap-4">
                    <Image
                      src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${account.profileIconId}.png`}
                      alt={`Rank 1`}
                      width={30}
                      height={30}
                      className="border border-gray-500 rounded-full"
                    />
                    <h1 className="text-[#E2E6F2] flex flex-col text-sm items-start justify-start w-full">
                      {account.gameName} {/* Name */}
                    </h1>
                  </div>
                  <p className="flex flex-col items-center text-xs justify-center text-slate-300 tracking-tighter">
                    {Math.round(
                      (account.wins! / (account.wins! + account.losses!)) * 100,
                    )}
                    % {/* Win rate */}
                    <span className="text-[11px] flex text-gray-400">
                      {account.wins}W / {account.losses}L {/* Wins & Losses */}
                    </span>
                  </p>
                  <p className="flex flex-col items-center justify-center">
                    {account.leaguePoints} {/* LP */}
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
