"use client";

import { ChampionSummary } from "@/actions/champions/fetchSelectedChampion";
import Image from "next/image";

export default function HeroSection({
  selectedChampion,
}: {
  selectedChampion: ChampionSummary;
}) {
  if (!selectedChampion) {
    return (
      <div>
        <h1 className="text-white">No champion found</h1>
      </div>
    );
  }

  const getChampionImageUrl = (championName: string) => {
    const championMap: { [key: string]: string } = {
      "Aurelion Sol": "AurelionSol",
      "Bel'Veth": "Belveth",
      "Cho'Gath": "Chogath",
      "Dr. Mundo": "DrMundo",
      "Jarvan IV": "JarvanIV",
      "Kai'Sa": "Kaisa",
      "Kog'Maw": "Kogmaw",
      "Kha'Zix": "Khazix",
      "K'Sante": "KSante",
      LeBlanc: "Leblanc",
      "Lee Sin": "LeeSin",
      "Master Yi": "MasterYi",
      "Miss Fortune": "MissFortune",
      Wukong: "MonkeyKing",
      "Nunu & Willump": "Nunu",
      "Rek'Sai": "RekSai",
      "Tahm Kench": "TahmKench",
      "Twisted Fate": "TwistedFate",
      "Vel'Koz": "Velkoz",
      "Xin Zhao": "XinZhao",
      FiddleSticks: "Fiddlesticks",
    };

    const mappedName = championMap[championName] || championName;
    return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${mappedName}_0.jpg`;
  };

  return (
    <section
      style={{
        color: selectedChampion.accentColor ?? "#edeae2",
      }}
      className="border-b border-[#EDEAE2]/17"
    >
      <div className="flex gap-[60px] items-center px-10 max-w-[1140px] m-auto">
        <div>
          <p className="font-mono uppercase tracking-[0.16rem]">
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

        <div className="relative w-full h-[380px] rounded-tr-md overflow-hidden bg-[radial-gradient(circle_at_65%_35%,var(--accent-deep)_0%,var(--surface)_70%)] flex items-center justify-center">
          <span className="font-display text-[340px] font-light text-[#edeae2]/[0.06] leading-none select-none">
            {selectedChampion.championName.charAt(0)}
          </span>
          <Image
            src={getChampionImageUrl(selectedChampion.championName)}
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
