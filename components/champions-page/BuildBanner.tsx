"use client";

import { ChampionBuildResult } from "@/actions/champions/getChampionBuild";
import { perks } from "@/lib/perks";
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

export default function BuildBanner({
  data,
  version,
}: {
  data: ChampionBuildResult | null;
  version: string;
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
    <div className="text-white p-16 flex justify-between">
      {/* RUNES */}
      <div className="flex flex-col gap-4">
        <h1 className="text-sm text-[#726e78] uppercase leading-[0.95] mt-1.5 block tracking-widest font-semibold">
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
            className="mb-0.5 border rounded-full object-cover scale-110"
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
                  className="mb-0.5 border rounded-full object-cover border-slate-600"
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
                  className="mb-0.5 border rounded-full object-cover border-slate-600"
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
            alt={`${data.shards.defense!}`}
            width={36}
            height={36}
            className="mb-0.5 border rounded-full object-cover"
          />
          <Image
            src={`https://raw.communitydragon.org/latest/game/assets/perks/statmods/${
              perks
                .find((perk) =>
                  perk.types.find((type) => type.id === data.shards.offense),
                )
                ?.types.find((type) => type.id === data.shards.offense)!.name
            }.png`}
            alt={`${data.shards.offense!}`}
            width={36}
            height={36}
            className="mb-0.5 border rounded-full object-cover"
          />
          <Image
            src={`https://raw.communitydragon.org/latest/game/assets/perks/statmods/${
              perks
                .find((perk) =>
                  perk.types.find((type) => type.id === data.shards.flex),
                )
                ?.types.find((type) => type.id === data.shards.flex)!.name
            }.png`}
            alt={`${data.shards.flex!}`}
            width={36}
            height={36}
            className="mb-0.5 border rounded-full object-cover"
          />
        </div>
      </div>

      <div>
        <h1 className="text-sm text-[#726e78] uppercase leading-[0.95] mt-1.5 block tracking-widest font-semibold">
          Build
        </h1>

        <div></div>
      </div>
    </div>
  );
}
