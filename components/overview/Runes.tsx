"use client";

import { perks } from "@/lib/perks";
import Image from "next/image";
import { useEffect, useState } from "react";
import RuneTable from "./RuneTable";

const Runes = ({
  game,
  runesData,
}: {
  game: DbGameInfo;
  runesData: RiotMatchDto | null;
}) => {
  const [runesApi, setRunesApi] = useState<RuneStyle[] | null>(null);
  const [runeIcon, setRuneIcon] = useState<string | null>(null);

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
    return `https://ddragon.leagueoflegends.com/cdn/15.14.1/img/champion/${mappedName}.png`;
  };

  useEffect(() => {
    const fetchRunes = async () => {
      const res = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/15.14.1/data/en_US/runesReforged.json`
      );

      if (!res.ok) {
        console.error(`Failed to fetch runes: ${res.status} ${res.statusText}`);
        return;
      }

      const data: RuneStyle[] = await res.json();
      console.log("Fetches runes data:", data);

      setRunesApi(data);
    };
    fetchRunes();
  }, []);

  useEffect(() => {
    runesData?.info.participants.forEach((participant) => {
      if (!runesData || !runesApi) return;
      const primaryStyleId = participant.perks.styles[0]?.style;
      const matched = runesApi.find((r) => r.id === primaryStyleId);

      console.log("Matched rune:", matched);
      if (matched) {
        const iconPath = matched.icon;
        const url = `https://ddragon.leagueoflegends.com/cdn/img/${iconPath}`;
        setRuneIcon(url);
      }
    });
  }, [runesData, runesApi]);

  if (!runesData || !runesApi) {
    return <div>Loading runes...</div>;
  }
  return (
    <div className="grid grid-cols-5 gap-2 bg-gradient-to-b from-[#121624] to-[#1B1F35] w-full p-2 animate-fade-down animate-duration-300 animate-ease-in-out">
      {runesData?.info.participants.map((participant, index) => {
        const championImage = getChampionImageUrl(participant.championName!);
        return (
          <div
            key={index}
            className="flex flex-col p-2 items-center border border-gray-700/70 shadow-sm shadow-[#2A2A40] bg-gradient-to-b from-[#1e2238] to-[#2a2f4a] rounded-md "
          >
            <Image
              src={championImage}
              alt={participant.championName!}
              width={80}
              height={60}
              className="rounded-md w-12 h-12 sm:w-20 sm:h-20 border-2 border-white/20"
            />
            <div className="">
              <RuneTable participant={participant} runesApi={runesApi!} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default Runes;
