"use client";

import { getRolePerformance } from "@/actions/performance/getRolePerformance";
import Image from "next/image";
import { useEffect, useState } from "react";
import RoleStatsSkeleton from "../../RoleStatsSkeleton";
import { useAccountData } from "../../hooks/useAccountData";
import { winRateColor, winRatePercent } from "@/lib/winrate";

const ROLE_META: Record<string, { label: string; icon: string }> = {
  TOP: {
    label: "TOP",
    icon: "https://wiki.leagueoflegends.com/en-us/images/Top_icon.png?58442",
  },
  JUNGLE: {
    label: "JUNGLE",
    icon: "https://wiki.leagueoflegends.com/en-us/images/Jungle_icon.png?9225d",
  },
  MIDDLE: {
    label: "MID",
    icon: "https://wiki.leagueoflegends.com/en-us/images/Middle_icon.png?fa3f0",
  },
  BOTTOM: {
    label: "ADC",
    icon: "https://wiki.leagueoflegends.com/en-us/images/Bottom_icon.png?6d4b2",
  },
  UTILITY: {
    label: "SUPPORT",
    icon: "https://wiki.leagueoflegends.com/en-us/images/Support_icon.png?af1ff",
  },
};

const RolesPerformanceCard = ({ puuid }: { puuid: string }) => {
  const { data, error, isLoading } = useAccountData(puuid, getRolePerformance);

  if (isLoading) {
    return <RoleStatsSkeleton />;
  }

  if (!data) {
    return (
      <div className="p-5 py-3 border border-gray-700/70 rounded-md text-sm text-red-400">
        {error}
      </div>
    );
  }

  const rows = data.flatMap((role) => {
    const meta = role.role ? ROLE_META[role.role] : undefined;
    return meta ? [{ ...role, meta }] : [];
  });

  return (
    <div className="p-5 py-3 border border-gray-700/70 text-slate-300 rounded-md flex flex-col gap-1 bg-gradient-to-b from-[#1B1F35] to-[#121624]  shadow-sm shadow-[#2A2A40]">
      <div>
        <ul className="grid grid-cols-4 text-slate-300 font-semibold">
          <li className="text-center col-span-2">Role</li>
          <li className="text-center">Games</li>
          <li className="text-center">WR</li>
        </ul>

        <ul className="mt-1">
          {rows.map((role, index) => {
            const winRate = winRatePercent(role.wins, role.gamesPlayed);

            return (
              <li
                key={role.role}
                className={`text-center grid grid-cols-4 py-1 ${
                  index < rows.length - 1 ? "border-b" : ""
                }`}
              >
                <div className="col-span-2 w-full">
                  <div className="flex items-center w-full">
                    {/* Decorative: the label next to it carries the meaning. */}
                    <Image src={role.meta.icon} alt="" width={30} height={30} />
                    <h2 className="font-semibold text-slate-300 flex w-full justify-center mr-8">
                      {role.meta.label}
                    </h2>
                  </div>
                </div>
                <div>
                  <p>{role.gamesPlayed}</p>
                </div>
                <div>
                  <p
                    className={`${winRateColor(winRate)} flex items-center justify-center`}
                  >
                    {winRate}
                    <span className="text-gray-300 text-xs">%</span>
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
export default RolesPerformanceCard;
