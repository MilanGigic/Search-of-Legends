"use client";

import { ChampionSkillOrderResult } from "@/actions/champions/getChampionSkillOrder";
import { useDataStore } from "@/lib/store/useConstantDataStore";

const SKILL_LABELS: Record<number, string> = { 1: "Q", 2: "W", 3: "E" };

export default function SpellOrderCard({
  data,
}: {
  data: ChampionSkillOrderResult | null;
}) {
  const { selectedChampion } = useDataStore();

  if (!selectedChampion) {
    console.error("No champion found");
    return;
  }
  if (!data) {
    return (
      <div className="text-white p-16">
        <h1
          style={{
            color: selectedChampion.accentColor!,
          }}
          className="text-sm uppercase tracking-widest text-[#726e78] mb-5"
        >
          Spell order
        </h1>
        <p className="text-sm text-[#726e78]">No skill order data found.</p>
      </div>
    );
  }

  return (
    <div className="text-white py-4 flex flex-col gap-4">
      <h1
        style={{
          color: selectedChampion.accentColor!,
        }}
        className="text-lg text-[#726e78] uppercase leading-[0.95] mt-1.5 block tracking-widest font-semibold"
      >
        Spell order
      </h1>

      <div className="flex items-center gap-4">
        {data.order.map((skillSlot, index) => (
          <div key={skillSlot} className="flex items-center gap-3">
            <div
              className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-display text-xl sm:text-2xl border ${
                index === 0
                  ? "border-[#d1a24a] text-[#d1a24a]"
                  : "border-white/10 text-white/70"
              }`}
            >
              {SKILL_LABELS[skillSlot]}
            </div>
            {index < data.order.length - 1 && (
              <span className="text-[#726e78] font-mono text-sm">&#8594;</span>
            )}
          </div>
        ))}
        <p className="sr-only">{data.orderLabel} skill order</p>
      </div>

      <div className="flex gap-9">
        <div>
          <span className="font-mono text-2xl text-[#d1a24a] block">
            {data.winRate}%
          </span>
          <span className="text-xs text-[#726e78] uppercase mt-1 block">
            Win rate
          </span>
        </div>
        <div>
          <span className="font-mono text-2xl block">{data.pickRate}%</span>
          <span className="text-xs text-[#726e78] uppercase mt-1 block">
            Pick rate
          </span>
        </div>
        <div>
          <span className="font-mono text-2xl block">
            {data.gamesPlayed.toLocaleString()}
          </span>
          <span className="text-xs text-[#726e78] uppercase mt-1 block">
            Games
          </span>
        </div>
      </div>
    </div>
  );
}
