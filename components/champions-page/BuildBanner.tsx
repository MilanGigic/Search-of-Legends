"use client";

import { ChampionSummary } from "@/actions/champions/fetchSelectedChampion";
import { ChampionBuildResult } from "@/actions/champions/getChampionBuild";
import { perks } from "@/lib/perks";
import { useDataStore } from "@/lib/store/useConstantDataStore";
import Image from "next/image";
import { useEffect, useState } from "react";

function findRuneInTree(
  tree: RuneStyle,
  perkId: number | null,
): Rune | undefined {
  if (perkId == null) return undefined;
  for (const slot of tree.slots) {
    const found = slot.runes.find((r) => r.id === perkId);
    if (found) return found;
  }
  return undefined;
}

const getSummonerSpellImageUrl = (spellId: number, version: string) => {
  const spellMap: { [key: number]: string } = {
    4: "SummonerFlash",
    21: "SummonerBarrier",
    1: "SummonerBoost",
    14: "SummonerDot",
    3: "SummonerExhaust",
    6: "SummonerHaste",
    7: "SummonerHeal",
    13: "SummonerMana",
    11: "SummonerSmite",
    12: "SummonerTeleport",
  };

  const spellName = spellMap[spellId];
  return spellName
    ? `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spellName}.png`
    : null;
};

export default function BuildBanner({
  data,
  version,
  selectedChampion,
}: {
  data: ChampionBuildResult | null;
  version: string;
  selectedChampion: ChampionSummary | null;
}) {
  const [runesApi, setRunesApi] = useState<RuneStyle[] | null>(null);

  useEffect(() => {
    const fetchRunes = async () => {
      const res = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/runesReforged.json`,
      );

      if (!res.ok) {
        console.error(`Failed to fetch runes: ${res.status} ${res.statusText}`);
        return;
      }

      const data: RuneStyle[] = await res.json();
      setRunesApi(data);
    };
    fetchRunes();
  }, [version]);

  console.log("Data:", data);

  if (!data) {
    return (
      <div>
        <h1 className="text-white font-bold text-5xl">No build data found!</h1>
      </div>
    );
  }

  if (!runesApi || runesApi.length === 0) {
    return (
      <div>
        <h1 className="text-white font-bold text-5xl">No runes data found!</h1>
      </div>
    );
  }

  if (!selectedChampion) {
    return (
      <div>
        <h1 className="text-white">No champion found</h1>
      </div>
    );
  }

  const runeTree = runesApi.find((r) => r.id === data.primaryStyle);
  const subRuneTree = runesApi.find((r) => r.id === data.subStyle);
  const keyStone = runeTree?.slots[0].runes.find((r) => r.id === data.keystone);

  console.log(
    "Test:",
    perks
      .find((perk) =>
        perk.types.find((type) => type.id === data.shards.defense),
      )
      ?.types.find((type) => type.id === data.shards.defense)!.name,
  );

  if (!runeTree || !subRuneTree) {
    return (
      <div>
        <h1 className="text-white font-bold text-5xl">
          No rune tree data found!
        </h1>
      </div>
    );
  }
  return (
    <div className="text-white px-10 py-4 flex justify-between border-b border-[#EDEAE2]/17">
      {/* RUNES */}
      <div className="flex flex-col gap-4">
        <h1
          style={{
            color: selectedChampion.accentColor ?? "#edeae2",
          }}
          className="text-lg text-[#726e78] uppercase leading-[0.95] mt-1.5 block tracking-widest font-semibold"
        >
          Runes
        </h1>
        <div className="flex gap-4">
          <Image
            src={`https://raw.communitydragon.org/latest/game/assets/perks/styles/${keyStone!.icon
              .replace("perk-images/Styles/", "")
              .toLowerCase()!}`}
            alt={`${keyStone?.key}`}
            width={64}
            height={64}
            className="rounded-full object-cover scale-110 object-center"
          />
          <div className="flex gap-4">
            {data.primaryPerks.map((perkId, index) => {
              const rune = findRuneInTree(runeTree, perkId);
              if (!rune) return null;

              return (
                <Image
                  src={`https://raw.communitydragon.org/latest/game/assets/perks/styles/${rune.icon
                    .replace("perk-images/Styles/", "")
                    .toLowerCase()}`}
                  alt={rune.name}
                  key={index}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover rounded-full"
                />
              );
            })}
            {data.subPerks.map((perkId, index) => {
              const rune = findRuneInTree(subRuneTree, perkId);
              if (!rune) return null;

              return (
                <Image
                  src={`https://raw.communitydragon.org/latest/game/assets/perks/styles/${rune.icon
                    .replace("perk-images/Styles/", "")
                    .toLowerCase()}`}
                  alt={rune.name}
                  key={index}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover rounded-full"
                />
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Image
            src={`https://raw.communitydragon.org/latest/game/assets/perks/statmods/${
              perks
                .find((perk) =>
                  perk.types.find((type) => type.id === data.shards.defense),
                )
                ?.types.find((type) => type.id === data.shards.defense)!.name
            }.png`}
            alt={`${data.shards.defense ?? "1"}`}
            width={40}
            height={40}
            className="mb-0.5 border rounded-full object-cover bg-white/8"
          />
          <Image
            src={`https://raw.communitydragon.org/latest/game/assets/perks/statmods/${
              perks
                .find((perk) =>
                  perk.types.find((type) => type.id === data.shards.offense),
                )
                ?.types.find((type) => type.id === data.shards.offense)!.name
            }.png`}
            alt={`${data.shards.offense ?? "2"}`}
            width={40}
            height={40}
            className="mb-0.5 border rounded-full object-cover bg-white/8 object-center"
          />
          <Image
            src={`https://raw.communitydragon.org/latest/game/assets/perks/statmods/${
              perks
                .find((perk) =>
                  perk.types.find((type) => type.id === data.shards.flex),
                )
                ?.types.find((type) => type.id === data.shards.flex)!.name
            }.png`}
            alt={`${data.shards.flex ?? "3"}`}
            width={40}
            height={40}
            className="mb-0.5 border rounded-full object-cover bg-white/8 object-center"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h1
          style={{
            color: selectedChampion.accentColor ?? "#edeae2",
          }}
          className="text-lg text-[#726e78] uppercase w-full text-end leading-[0.95] mt-1.5 block tracking-widest font-semibold"
        >
          Build
        </h1>

        <div className="flex gap-4">
          {data.itemOrder.map((item) => (
            <Image
              src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item}.png`}
              alt="Item"
              key={item}
              width={64}
              height={64}
              className="w-full h-full object-cover rounded-full"
            />
          ))}
        </div>
        <div className="flex gap-4 w-full items-end justify-end">
          <Image
            src={getSummonerSpellImageUrl(data.summoner1Id!, version)!}
            alt={"Summoner1"}
            width={40}
            height={40}
            className="rounded-full"
          />
          <Image
            src={getSummonerSpellImageUrl(data.summoner2Id!, version)!}
            alt={"Summoner2"}
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
