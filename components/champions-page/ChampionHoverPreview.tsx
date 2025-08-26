"use client";

import { useSearchStore } from "@/lib/store/useSearchStore";
import { useEffect, useMemo, useState } from "react";
import SpellCard from "./SpellCard";
import Image from "next/image";

const ChampionHoverPreview = ({
  championId,
  champion,
  completedName,
}: {
  championId: string;
  champion: ChampionDetail;
  completedName: string;
}) => {
  /* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
  const [championVideoKey, setChampionVideoKey] = useState<string | null>(null);
  const [championVideoSpell, setChampionVideoSpell] = useState<string | null>(
    "P"
  );
  const [championDetails, setChampionDetails] = useState<ChampionDetail | null>(
    null
  );

  const championVideoKeySpell = useSearchStore(
    (state) => state.championVideoKeySpell
  );

  const setChampionVideoKeySpell = useSearchStore(
    (state) => state.setChampionVideoKeySpell
  );

  const onClick = (spellId: string) => {
    setChampionVideoKeySpell(spellId);
    console.log("Spell ID:", spellId);
  };

  console.log("Completed name:", completedName);
  console.log("Champion details:", championDetails);

  useEffect(() => {
    if (!completedName || !championId) return;

    const fetchChampionDetails = async () => {
      try {
        const res = await fetch(
          `https://ddragon.leagueoflegends.com/cdn/15.16.1/data/en_US/champion/${completedName}.json`
        );

        if (!res.ok) {
          throw new Error(
            `Failed to fetch details for ${completedName}: ${res.status} ${res.statusText}`
          );
        }

        const data: ChampionDetailData = await res.json();
        console.log("Champion details fetched:", data);

        setChampionDetails(data.data[completedName]);
      } catch (error) {}
    };

    fetchChampionDetails();
  }, [completedName]);

  useEffect(() => {
    if (championVideoKeySpell !== null) {
      if (championVideoKeySpell === "passive") {
        setChampionVideoSpell("P");
        console.log("Champion video passive:", championVideoSpell);
      } else {
        setChampionVideoSpell(championVideoKeySpell.slice(-1));
        console.log("Champion video spell:", championVideoSpell);
      }
    }
  }, [championVideoKeySpell]);

  // Switch cases for image url bug for names like: Dr. Mundo, Kai'Sa = Transformed to DrMundo, Kaisa
  // const [completedName, setCompletedName] = useState<string>(championId);
  // useEffect(() => {
  //   switch (champion?.name) {
  //     case "Aurelion Sol":
  //       setCompletedName("AurelionSol");
  //       break;
  //     case "Bel'Veth":
  //       setCompletedName("Belveth");
  //       break;
  //     case "Cho'Gath":
  //       setCompletedName("Chogath");
  //       break;
  //     case "Dr. Mundo":
  //       setCompletedName("DrMundo");
  //       break;
  //     case "Jarvan IV":
  //       setCompletedName("JarvanIV");
  //       break;
  //     case "Kai'Sa":
  //       setCompletedName("Kaisa");
  //       break;
  //     case "Kog'Maw":
  //       setCompletedName("KogMaw");
  //       break;
  //     case "Kha'Zix":
  //       setCompletedName("Khazix");
  //       break;
  //     case "K'Sante":
  //       setCompletedName("KSante");
  //       break;
  //     case "LeBlanc":
  //       setCompletedName("Leblanc");
  //       break;
  //     case "Lee Sin":
  //       setCompletedName("LeeSin");
  //       break;
  //     case "Master Yi":
  //       setCompletedName("MasterYi");
  //       break;
  //     case "Miss Fortune":
  //       setCompletedName("MissFortune");
  //       break;
  //     case "Wukong":
  //       setCompletedName("MonkeyKing");
  //       break;
  //     case "Nunu & Willump":
  //       setCompletedName("Nunu");
  //       break;
  //     case "Rek'Sai":
  //       setCompletedName("RekSai");
  //       break;
  //     case "Renata Glasc":
  //       setCompletedName("Renata");
  //       break;
  //     case "Tahm Kench":
  //       setCompletedName("TahmKench");
  //       break;
  //     case "Twisted Fate":
  //       setCompletedName("TwistedFate");
  //       break;
  //     case "Vel'Koz":
  //       setCompletedName("Velkoz");
  //       break;
  //     case "Xin Zhao":
  //       setCompletedName("XinZhao");
  //       break;
  //   }
  // }, [champion?.name]);

  // useEffect(() => {
  //   const fetchChampionDetails = async () => {
  //     if (!championId) return;

  //     console.log(`Fetching data for champion ID: ${championId}`);
  //     const version = await fetchLatestVersion();
  //     try {
  //       setIsLoading(true);
  //       console.log(`Fetching data with completed name: ${completedName}`);
  //       const res = await fetch(
  //         `https://ddragon.leagueoflegends.com/cdn/${version!}/data/en_US/champion/${completedName}.json`
  //       );
  //       if (!res.ok) {
  //         throw new Error(
  //           `Failed to fetch for ${completedName}, ${res.status} ${res.statusText}`
  //         );
  //       }
  //       const data: ChampionDetailData = await res.json();
  //       setChampion(data.data[championId]);
  //       setError(null);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //       setError(
  //         error instanceof Error ? error.message : "Unknown error occurred"
  //       );
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchChampionDetails();
  // }, [championId]);

  // const [shadowColor, setShadowColor] = useState<string | null>(null);
  // useEffect(() => {
  //   switch (champion?.tags[0]) {
  //     case "Marksman":
  //       setShadowColor("shadow-amber-400");
  //       break;
  //     case "Fighter":
  //       setShadowColor("shadow-red-800");
  //       break;
  //     case "Support":
  //       setShadowColor("shadow-pink-800");
  //       break;
  //     case "Tank":
  //       setShadowColor("shadow-orange-800");
  //       break;
  //     case "Mage":
  //       setShadowColor("shadow-blue-800");
  //       break;
  //     case "Assassin":
  //       setShadowColor("shadow-sky-800");
  //       break;
  //   }
  // }, [champion?.tags[0]]);

  useEffect(() => {
    if (!champion || champion === null) {
      return;
    }
    switch (champion.key.length) {
      case 1:
        setChampionVideoKey(`000${champion?.key}`);
        console.log("Champion video key:", championVideoKey);
        break;
      case 2:
        setChampionVideoKey(`00${champion?.key}`);
        console.log("Champion video key:", championVideoKey);
        break;
      case 3:
        setChampionVideoKey(`0${champion?.key}`);
        console.log("Champion video key:", championVideoKey);
        break;
      case 4:
        setChampionVideoKey(`${champion?.key}`);
        console.log("Champion video key:", championVideoKey);
        break;
      default:
        setChampionVideoKey(`${champion?.key}`);
        console.log("Champion video key:", championVideoKey);
        break;
    }
  }, [champion?.key]);

  const videoUrl = useMemo(() => {
    if (!championVideoKey || !championVideoSpell) return null;
    return `https://d28xe8vt774jo5.cloudfront.net/champion-abilities/${championVideoKey}/ability_${championVideoKey}_${championVideoSpell}1.mp4`;
  }, [championVideoKey, championVideoSpell]);

  console.log(
    `Passive image: https://ddragon.leagueoflegends.com/cdn/15.16.1/img/passive/${championDetails
      ?.passive.image.full!}`
  );

  // VIDEO URL SAMPLE https://d28xe8vt774jo5.cloudfront.net/champion-abilities/0084/ability_0084_R1.mp4
  return (
    <div className="h-[420px] w-[300px] bg-gradient-to-b text-slate-300 from-[#121624] to-[#1B1F35] border border-slate-400 shadow-[#2A2A40]">
      <div className="flex flex-col justify-between items-center">
        <h1 className="font-bold text-3xl">Spells</h1>
        <div className="flex gap-5">
          <div className="flex flex-col items-center">
            <h1>Passive</h1>
            <Image
              src={`https://ddragon.leagueoflegends.com/cdn/15.16.1/img/passive/${championDetails
                ?.passive.image.full!}`}
              alt={`${championDetails?.name} passive`}
              width={40}
              height={40}
              className="border rounded-md cursor-pointer hover:shadow-lg hover:shadow-cyan-800 transition-colors duration-200"
              onClick={() => onClick(championDetails?.passive.image.group!)}
            />
          </div>
          {championDetails?.spells.map((spell, index) => (
            <div className="flex flex-col items-center" key={spell.id}>
              <h1>
                {index === 0
                  ? "Q"
                  : index === 1
                  ? "W"
                  : index === 2
                  ? "E"
                  : index === 3
                  ? "R"
                  : null}
              </h1>
              <Image
                key={spell.id}
                src={`https://ddragon.leagueoflegends.com/cdn/15.16.1/img/spell/${spell.image.full}`}
                alt={`${championDetails?.id} spells`}
                width={40}
                height={40}
                className="border rounded-md cursor-pointer hover:shadow-lg hover:shadow-cyan-800 transition-colors duration-200"
                onClick={() => onClick(spell.id)}
              />
            </div>
          ))}
        </div>
        <section className="h-full p-0 w-full flex my-2 flex-col items-center justify-center rounded-lg">
          {videoUrl && (
            <video
              key={videoUrl}
              autoPlay
              className="w-full h-full p-0 m-0"
              controls
              loop
              muted
              preload="auto"
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          )}
        </section>

        {championVideoKeySpell === "passive" ? (
          <div className="flex flex-col items-center border-t-2">
            <p className="text-start text-[#EAEAEA] text-sm tracking-tight overflow-auto">
              {championDetails?.passive.name} -{" "}
              <strong>{championDetails?.passive.description}</strong>
            </p>
          </div>
        ) : (
          championDetails?.spells
            .filter(
              (spell) =>
                championVideoKeySpell !== null &&
                spell.id === championVideoKeySpell
            )
            .map((spell) => (
              <div
                className="flex flex-col items-center border-t-2"
                key={spell.id}
              >
                <div className="text-start text-[#EAEAEA] text-xs tracking-tight overflow-auto">
                  {spell.name} - <strong>{spell.description}</strong>
                  <p className="text-start text-gray-300 italic text-2xs">
                    Cooldown -{" "}
                    {spell.cooldown.map((cd, index) => (
                      <span
                        key={index}
                        className="text-xs text-yellow-500 font-semibold"
                      >
                        {cd}
                        {index < spell.cooldown.length - 1 ? "/" : ""}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};
export default ChampionHoverPreview;
