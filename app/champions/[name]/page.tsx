"use client";

import SpellCard from "@/components/champions-page/SpellCard";
import { fetchLatestVersion } from "@/lib/riot";
import { useSearchStore } from "@/lib/store/useSearchStore";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const ChampionPage = () => {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const params = useParams();
  const championId = params.name as string;

  const [champion, setChampion] = useState<ChampionDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [championVideoKey, setChampionVideoKey] = useState<string | null>(null);
  const [championVideoSpell, setChampionVideoSpell] = useState<string | null>(
    "P"
  );

  const championVideoKeySpell = useSearchStore(
    (state) => state.championVideoKeySpell
  );

  useEffect(() => {
    if (championVideoKeySpell !== null) {
      if (championVideoKeySpell === "passive") {
        setChampionVideoSpell("P");
      } else {
        setChampionVideoSpell(championVideoKeySpell.slice(-1));
      }
    }
  }, [championVideoKeySpell]);

  // Switch cases for image url bug for names like: Dr. Mundo, Kai'Sa = Transformed to DrMundo, Kaisa
  const [completedName, setCompletedName] = useState<string>(championId);
  useEffect(() => {
    switch (champion?.name) {
      case "Aurelion Sol":
        setCompletedName("AurelionSol");
        break;
      case "Bel'Veth":
        setCompletedName("Belveth");
        break;
      case "Cho'Gath":
        setCompletedName("Chogath");
        break;
      case "Dr. Mundo":
        setCompletedName("DrMundo");
        break;
      case "Jarvan IV":
        setCompletedName("JarvanIV");
        break;
      case "Kai'Sa":
        setCompletedName("Kaisa");
        break;
      case "Kog'Maw":
        setCompletedName("KogMaw");
        break;
      case "Kha'Zix":
        setCompletedName("Khazix");
        break;
      case "K'Sante":
        setCompletedName("KSante");
        break;
      case "LeBlanc":
        setCompletedName("Leblanc");
        break;
      case "Lee Sin":
        setCompletedName("LeeSin");
        break;
      case "Master Yi":
        setCompletedName("MasterYi");
        break;
      case "Miss Fortune":
        setCompletedName("MissFortune");
        break;
      case "Wukong":
        setCompletedName("MonkeyKing");
        break;
      case "Nunu & Willump":
        setCompletedName("Nunu");
        break;
      case "Rek'Sai":
        setCompletedName("RekSai");
        break;
      case "Renata Glasc":
        setCompletedName("Renata");
        break;
      case "Tahm Kench":
        setCompletedName("TahmKench");
        break;
      case "Twisted Fate":
        setCompletedName("TwistedFate");
        break;
      case "Vel'Koz":
        setCompletedName("Velkoz");
        break;
      case "Xin Zhao":
        setCompletedName("XinZhao");
        break;
    }
  }, [champion?.name]);

  useEffect(() => {
    const fetchChampionDetails = async () => {
      if (!championId) return;


      const version = await fetchLatestVersion();
      try {
        setIsLoading(true);

        const res = await fetch(
          `https://ddragon.leagueoflegends.com/cdn/${version!}/data/en_US/champion/${completedName}.json`
        );
        if (!res.ok) {
          throw new Error(`Failed to fetch, ${res.status} ${res.statusText}`);
        }
        const data: ChampionDetailData = await res.json();
        setChampion(data.data[championId]);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          error instanceof Error ? error.message : "Unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchChampionDetails();
  }, [championId]);

  const [shadowColor, setShadowColor] = useState<string | null>(null);
  useEffect(() => {
    switch (champion?.tags[0]) {
      case "Marksman":
        setShadowColor("shadow-amber-400");
        break;
      case "Fighter":
        setShadowColor("shadow-red-800");
        break;
      case "Support":
        setShadowColor("shadow-pink-800");
        break;
      case "Tank":
        setShadowColor("shadow-orange-800");
        break;
      case "Mage":
        setShadowColor("shadow-blue-800");
        break;
      case "Assassin":
        setShadowColor("shadow-sky-800");
        break;
    }
  }, [champion?.tags[0]]);

  useEffect(() => {
    if (!champion || champion === null) {
      return;
    }
    switch (champion.key.length) {
      case 1:
        setChampionVideoKey(`000${champion?.key}`);
        break;
      case 2:
        setChampionVideoKey(`00${champion?.key}`);
        break;
      case 3:
        setChampionVideoKey(`0${champion?.key}`);
        break;
      case 4:
        setChampionVideoKey(`${champion?.key}`);
        break;
      default:
        setChampionVideoKey(`${champion?.key}`);
        break;
    }
  }, [champion?.key]);

  const videoUrl = useMemo(() => {
    if (!championVideoKey || !championVideoSpell) return null;
    return `https://d28xe8vt774jo5.cloudfront.net/champion-abilities/${championVideoKey}/ability_${championVideoKey}_${championVideoSpell}1.mp4`;
  }, [championVideoKey, championVideoSpell]);

  // VIDEO URL SAMPLE https://d28xe8vt774jo5.cloudfront.net/champion-abilities/0084/ability_0084_R1.mp4

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
                  spell.id === championVideoKeySpell
              )
              .map((spell, index) => (
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
};
export default ChampionPage;

// TODO:
// Fix the UI so it matches the rest of the app
// Write the logic for getting the match timeline
// Find the PROs builds, runes, skill paths
