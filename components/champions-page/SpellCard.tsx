"use client";

import { useSearchStore } from "@/lib/store/useSearchStore";
import Image from "next/image";

const SpellCard = ({ champion }: { champion: ChampionDetail | null }) => {
  const setChampionVideoKey = useSearchStore(
    (state) => state.setChampionVideoKeySpell
  );

  const onClick = (spellId: string) => {
    setChampionVideoKey(spellId);
    console.log("Spell ID:", spellId);
  };
  if (!champion || champion === null) return null;

  return (
    <div className="flex gap-5">
      <Image
        src={`https://ddragon.leagueoflegends.com/cdn/15.16.1/img/passive/${champion?.passive.image.full}`}
        alt={`${champion.id} passive`}
        width={80}
        height={80}
        className="border rounded-md cursor-pointer hover:shadow-lg hover:shadow-cyan-800 transition-colors duration-200"
        onClick={() => onClick(champion.passive.image.group)}
      />
      {champion.spells.map((spell) => (
        <Image
          key={spell.id}
          src={`https://ddragon.leagueoflegends.com/cdn/15.16.1/img/spell/${spell.image.full}`}
          alt={`${champion.id} spells`}
          width={80}
          height={80}
          className="border rounded-md cursor-pointer hover:shadow-lg hover:shadow-cyan-800 transition-colors duration-200"
          onClick={() => onClick(spell.id)}
        />
      ))}
    </div>
  );
};
export default SpellCard;
