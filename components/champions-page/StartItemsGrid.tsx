"use client";

import { ChampionSummary } from "@/actions/champions/fetchSelectedChampion";
import { ChampionStartItemsResult } from "@/actions/champions/getChampionStartItems";
import Image from "next/image";

export default function StartItemsGrid({
  data,
  version,
  selectedChampion,
}: {
  data: ChampionStartItemsResult[];
  version: string;
  selectedChampion: ChampionSummary | null;
}) {
  if (!selectedChampion) {
    return (
      <div>
        <h1 className="text-white">No champion found</h1>
      </div>
    );
  }

  const itemIds = data.flatMap((d) => d.itemIds).slice(0, 2);

  console.log("item ids:", itemIds);
  return (
    <div className="text-white py-4 flex flex-col items-end gap-4 w-full">
      <h1
        style={{
          color: selectedChampion.accentColor ?? "#edeae2",
        }}
        className="text-lg text-[#726e78] uppercase leading-[0.95] mt-1.5 block tracking-widest font-semibold"
      >
        Starting Items
      </h1>
      <div className="flex flex-col w-full items-end gap-4">
        {itemIds.map((item, index) => {
          const stat = data[index];

          if (!stat) return null;

          return (
            <div key={index} className="flex w-full items-end justify-end">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <span className="font-mono text-2xl block">
                    {stat.gamesPlayed.toLocaleString()}
                  </span>
                  <span className="text-xs text-[#726e78] uppercase mt-1 block">
                    Games
                  </span>
                </div>
                <div>
                  <span className="font-mono text-2xl block">
                    {stat.pickRate}%
                  </span>
                  <span className="text-xs text-[#726e78] uppercase mt-1 block">
                    Pick rate
                  </span>
                </div>
                <div>
                  <span className="font-mono text-2xl text-[#d1a24a] block">
                    {stat.winRate}%
                  </span>
                  <span className="text-xs text-[#726e78] uppercase mt-1 block">
                    Win rate
                  </span>
                </div>
                <Image
                  src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item}.png`}
                  alt="Item"
                  width={48}
                  height={48}
                  className="object-cover rounded-full"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
