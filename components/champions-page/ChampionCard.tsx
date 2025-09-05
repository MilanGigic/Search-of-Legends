"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ChampionHoverPreview from "./ChampionHoverPreview";

/* eslint-disable @typescript-eslint/no-unused-vars */
const ChampionCard = ({
  name,
  title,
  role,
  champion,
  version,
}: {
  name: string;
  title: string;
  role: string;
  champion: ChampionDetail;
  version: string;
}) => {
  // Switch cases for image url bug for names like: Dr. Mundo, Kai'Sa = Transformed to DrMundo, Kaisa
  const [completedName, setCompletedName] = useState<string>(name);
  // const [showPreview, setShowPreview] = useState<boolean>(false);

  useEffect(() => {
    switch (name) {
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
  }, [name]);

  return (
    <div className="relative">
      <Link
        href={`/champions/${completedName}`}
        className="sm:hover:scale-105 transition-transform duration-300 p-4 flex flex-col items-center justify-end sm:h-[115px] sm:w-[135px]"
        // onMouseEnter={() => setShowPreview(true)}
        // onMouseLeave={() => setShowPreview(false)}
      >
        <div className="text-center flex flex-col items-center justify-center">
          <Image
            src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${completedName}.png`}
            alt={completedName}
            width={100}
            height={100}
          />
          <h1 className="font-bold text-xs text-yellow-400/95">{name}</h1>
        </div>
      </Link>

      {/* HOVER PROTOTYPE */}
      {/* <div
        className={`absolute left-full -top-4 ml-6 z-50 transition-all duration-200  ${
          showPreview
            ? "opacity-100 visible translate-x-0"
            : "opacity-0 invisible -translate-x-4"
        }`}
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
      >
        <ChampionHoverPreview
          championId={name}
          champion={champion}
          completedName={completedName}
        />
      </div> */}
    </div>
  );
};
export default ChampionCard;
