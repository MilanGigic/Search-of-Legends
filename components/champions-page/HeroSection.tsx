"use client";

import { useDataStore } from "@/lib/store/useConstantDataStore";
import Image from "next/image";

export default function HeroSection() {
  const { selectedChampion } = useDataStore();

  if (!selectedChampion) {
    console.error("No champion found");
    return;
  }

  return (
    <section
      style={{
        color: selectedChampion.accentColor!,
      }}
      className="border-b border-[#EDEAE2]/17"
    >
      <div className="flex gap-[60px] items-center px-10 py-[72px] min-h-[420px] max-w-[1120px] m-auto p-10">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16rem]">
            {selectedChampion.lane} -{" "}
            <span>
              {selectedChampion.tier === "S_PLUS"
                ? "S+"
                : selectedChampion.tier}{" "}
              tier
            </span>
          </p>
          <h1 className="font-display text-[clamp(56px,7vw,104px)] leading-[0.95] text-white/75 tracking-[-0.01em] mb-9">
            {selectedChampion.championName}
          </h1>

          <div className="flex gap-11">
            <div className="font-mono text-[40px] block">
              <span className="font-mono text-[40px] block">
                {Math.round(
                  (selectedChampion.wins / selectedChampion.gamesPlayed) * 100,
                )}
                %
              </span>
              <span className="text-xs text-[#726e78] uppercase leading-[0.95] mt-1.5 block">
                Win rate
              </span>
            </div>
            <div className="stat-secondary">
              <span className="font-mono text-[40px] block">
                {selectedChampion.gamesPlayed}
              </span>
              <span className="text-xs text-[#726e78] uppercase leading-[0.95] mt-1.5 block">
                Games
              </span>
            </div>
            <div>
              <span className="font-mono text-[40px] block">
                {Math.round(
                  (selectedChampion.gamesPlayed / selectedChampion.totalGames) *
                    100,
                )}
                %
              </span>
              <span className="text-xs text-[#726e78] uppercase leading-[0.95] mt-1.5 block">
                Pick rate
              </span>
            </div>
          </div>
        </div>

        <div className="relative w-full h-[380px] rounded-r-md overflow-hidden bg-[radial-gradient(circle_at_65%_35%,var(--accent-deep)_0%,var(--surface)_70%)] flex items-center justify-center">
          <span className="font-display text-[340px] font-light text-[#edeae2]/[0.06] leading-none select-none">
            {selectedChampion.championName.charAt(0)}
          </span>
          <Image
            src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${selectedChampion.championName}_0.jpg`}
            alt={selectedChampion.championName}
            fill
            className="object-cover"
            style={{
              maskImage: "linear-gradient(to right, transparent 2%, black 85%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, black 45%)",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
            }}
          />
        </div>
      </div>
    </section>
  );
}
