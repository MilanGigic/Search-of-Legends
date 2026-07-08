"use client";

import { useSearchStore } from "@/lib/store/useSearchStore";
import SpellCard from "./SpellCard";
import { useEffect, useMemo, useState } from "react";

function getChampionAbilityVideoUrl(
  championKey: number,
  abilityCode: string, // e.g. "R1", "Q", "W1", etc.
): string {
  const paddedKey = String(championKey).padStart(4, "0");
  return `https://d28xe8vt774jo5.cloudfront.net/champion-abilities/${paddedKey}/ability_${paddedKey}_${abilityCode}.mp4`;
}

export default function ClientChampionPage({
  champion,
}: {
  champion: ChampionDetail;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [championVideoSpell, setChampionVideoSpell] = useState<string | null>(
    "P",
  );

  const championVideoKeySpell = useSearchStore(
    (state) => state.championVideoKeySpell,
  );
  const videoKey = getChampionAbilityVideoUrl(
    champion!.key,
    championVideoSpell!,
  );

  const videoUrl = useMemo(() => {
    if (!videoKey || !championVideoSpell) return null;
    return `https://d28xe8vt774jo5.cloudfront.net/champion-abilities/${videoKey}/ability_${videoKey}_${championVideoSpell}1.mp4`;
  }, [videoKey, championVideoSpell]);

  useEffect(() => {
    if (championVideoKeySpell !== null) {
      if (championVideoKeySpell === "passive") {
        setChampionVideoSpell("P");
      } else {
        setChampionVideoSpell(championVideoKeySpell.slice(-1));
      }
    }
  }, [championVideoKeySpell]);
  return (
    <div className="flex items-center justify-center text-gray-100">
      <div
        className={`container border-x bg-gradient-to-b from-[#121624] to-[#1B1F35] shadow-sm shadow-[#2A2A40] border-gray-700/70 min-h-screen z-10 flex flex-col py-8`}
      >
        {isLoading && (
          <div className="loader animate-spin ease-linear rounded-full border-y-4 border-cyan-500 h-12 w-12" />
        )}
        <div className="grid grid-cols-3 w-full">
          <div className="mt-10 flex flex-col justify-between items-center pl-20">
            <h1 className="font-bold text-3xl">Spells</h1>
            <SpellCard champion={champion} />
            <section className="h-full p-0 w-full flex my-2 flex-col items-center justify-center rounded-lg">
              {videoUrl && (
                <video
                  key={videoUrl}
                  autoPlay
                  className="w-full h-full rounded-lg p-0 m-0"
                  controls
                  loop
                  muted
                  preload="auto"
                >
                  <source src={videoUrl} type="video/mp4" />
                </video>
              )}
            </section>

            {championVideoKeySpell === "passive" && (
              <div className="flex flex-col items-center border-t-2">
                <p className="text-start text-[#EAEAEA]  h-[150px] text-sm tracking-tight">
                  {champion?.passive.name} -{" "}
                  <strong>{champion?.passive.description}</strong>
                </p>
              </div>
            )}
            {champion?.spells
              .filter(
                (spell) =>
                  championVideoKeySpell !== null &&
                  spell.id === championVideoKeySpell,
              )
              .map((spell) => (
                <div
                  className="flex flex-col items-center border-t-2"
                  key={spell.id}
                >
                  <div className="text-start text-[#EAEAEA] h-[150px] text-sm tracking-tight">
                    {spell.name} - <strong>{spell.description}</strong>
                    <p className="text-start text-gray-300 italic text-sm">
                      Cooldown -{" "}
                      {spell.cooldown.map((cd, index) => (
                        <span
                          key={index}
                          className="text-sm text-yellow-500 font-semibold"
                        >
                          {cd}
                          {index < spell.cooldown.length - 1 ? "/" : ""}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              ))}
          </div>
          <div></div>
          <div className="mt-10 flex flex-col justify-between items-center pr-20">
            <h1 className="font-bold text-3xl">Builds</h1>
          </div>
        </div>
        <div className="mt-20 py-8 border-t-2 flex flex-col justify-between items-center">
          <h1 className="font-bold text-3xl">PROs</h1>
        </div>
      </div>
    </div>
  );
}
