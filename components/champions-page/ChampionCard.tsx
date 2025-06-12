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
    <div className="border rounded-md hover:shadow-2xl hover:shadow-cyan-900 transition-colors duration-500 h-[586px] w-[250px]">
      <Link
        href={`/champions/${completedName}`}
        className="flex flex-col items-center"
      >
        <Image
          src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${completedName}_0.jpg`}
          alt={name}
          width={250}
          height={250}
          className="rounded-lg"
        />
        <h1 className="font-bold text-2xl mt-2">{name}</h1>
        <h3 className="font-semibold text-lg text-gray-400 italic w-[220px] overflow-hidden flex items-center text-center justify-center h-[60px]">
          {title}
        </h3>
        <p className="mb-2">{role}</p>
      </Link>
    </div>
  );
};
export default ChampionCard;
