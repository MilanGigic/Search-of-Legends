"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const ChampionCard = ({
  name,
  title,
  role,
}: {
  name: string;
  title: string;
  role: string;
}) => {
  // Switch cases for image url bug for names like: Dr. Mundo, Kai'Sa = Transformed to DrMundo, Kaisa
  const [completedName, setCompletedName] = useState<string>(name);
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
    <Link
      href={`/champions/${completedName}`}
      className="relative  ring-1 order-2 sm:order-1 ring-gray-400 rounded-xl shadow-[0_0_30px_rgba(192,192,192,0.5)] sm:hover:scale-105 transition-transform duration-300 p-4 flex flex-col items-center justify-end sm:h-[125px] sm:w-[145px]"
      style={{
        backgroundImage: `url(https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${completedName}_0.jpg)`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
      }}
    >
      <h1 className="font-bold text-base text-yellow-400/95">{name}</h1>
    </Link>
  );
};
export default ChampionCard;
