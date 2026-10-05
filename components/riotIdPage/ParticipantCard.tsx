import { SoloRank } from "@/lib/riot-rank";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";

import Iron from "@/public/ranked-emblems/Rank=Iron.png";
import Bronze from "@/public/ranked-emblems/Rank=Bronze.png";
import Silver from "@/public/ranked-emblems/Rank=Silver.png";
import Gold from "@/public/ranked-emblems/Rank=Gold.png";
import Platinum from "@/public/ranked-emblems/Rank=Platinum.png";
import Emerald from "@/public/ranked-emblems/Rank=Emerald.png";
import Diamond from "@/public/ranked-emblems/Rank=Diamond.png";
import Master from "@/public/ranked-emblems/Rank=Master.png";
import Grandmaster from "@/public/ranked-emblems/Rank=Grandmaster.png";
import Challenger from "@/public/ranked-emblems/Rank=Challenger.png";

const DDRAGON = "https://ddragon.leagueoflegends.com/cdn";

type Props = {
  participant: Participant;
  version: string;
  champ?: { id: string; name: string };
  spellsByKey: Record<number, string>;
  runeIcons: Record<number, string>;
  rank: SoloRank | null;
};

export function ParticipantCard({
  participant,
  version,
  champ,
  spellsByKey,
  runeIcons,
  rank,
}: Props) {
  const spells = [participant.spell1Id, participant.spell2Id]
    .map((id) => spellsByKey[id])
    .filter(Boolean);

  const keystoneIcon = runeIcons[participant.perks?.perkIds?.[0]];
  const secondaryIcon = runeIcons[participant.perks?.perkSubStyle];

  const tier = rank?.tier;

  const TIER_IMAGES: Record<string, StaticImageData> = {
    IRON: Iron,
    BRONZE: Bronze,
    SILVER: Silver,
    GOLD: Gold,
    PLATINUM: Platinum,
    EMERALD: Emerald,
    DIAMOND: Diamond,
    MASTER: Master,
    GRANDMASTER: Grandmaster,
    CHALLENGER: Challenger,
  };

  const tierImage = tier ? TIER_IMAGES[tier] : undefined;

  // spectator gives "Name#TAG", your route uses "Name-TAG"
  const profileHref = participant.riotId
    ? `/${encodeURIComponent(participant.riotId.replace("#", "-"))}`
    : null;

  console.log("tier, rank", tierImage, rank);

  return (
    <div className="relative flex h-[367px] w-full flex-col items-center justify-between overflow-hidden rounded-lg border border-white/10 bg-neutral-900 py-1">
      {/* 1. Splash art background */}
      {champ && (
        <Image
          src={`${DDRAGON}/img/champion/centered/${champ.id}_0.jpg`}
          alt={champ.name}
          fill
          sizes="100vw"
          quality={90}
          className="object-cover object-top"
        />
      )}

      {/* 2. Gradients so text stays readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 from-10% via-neutral-900/30 via-30% to-neutral-900/5" />
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/80 from-5% via-neutral-900/10 via-20% to-transparent" />

      {/* 3. Champion name (top) */}
      <div className="z-10 text-sm font-medium text-gray-400">
        {champ?.name ?? participant.championId}
      </div>

      {/* 4. Footer: spells, runes, name */}
      <div className="z-10 flex w-full flex-col items-center gap-1">
        <div className="flex w-full items-center justify-between px-3">
          <div className="flex items-center gap-1">
            {spells.map((spell) => (
              <Image
                key={spell}
                src={`${DDRAGON}/${version}/img/spell/${spell}.png`}
                alt={spell}
                width={26}
                height={26}
                className="rounded-full bg-neutral-700"
              />
            ))}
          </div>

          <div className="flex items-center gap-1">
            {keystoneIcon && (
              <Image
                src={`${DDRAGON}/img/${keystoneIcon}`}
                alt="Keystone"
                width={26}
                height={26}
                className="scale-110 rounded-full border border-white/10 bg-neutral-700/60"
              />
            )}
            {secondaryIcon && (
              <Image
                src={`${DDRAGON}/img/${secondaryIcon}`}
                alt="Secondary tree"
                width={26}
                height={26}
                className="scale-90 rounded-full border border-white/10 bg-neutral-700/60"
              />
            )}
          </div>
        </div>

        {profileHref ? (
          <Link
            href={profileHref}
            className="my-2 w-full truncate px-2 text-center text-lg font-medium text-white duration-200 hover:opacity-70"
          >
            {participant.riotId.split("#")[0]}
          </Link>
        ) : (
          <div className="my-2 text-sm text-neutral-400">Anonymous</div>
        )}
        <div className="flex items-center z-10">
          {tierImage ? (
            <div className="flex items-center">
              <Image
                src={tierImage}
                alt={`${tier} Rank`}
                width={32}
                height={32}
              />
              <div className="text-white flex gap-2">
                <p className="text-sm">
                  {rank?.rank || ""} {rank ? `- ${rank.lp} LP` : ""}
                </p>
                <div className="flex items-center gap-1 text-xs justify-center text-center">
                  {rank && (
                    <p className="text-gray-400">
                      (
                      {Math.round(
                        (rank.wins / (rank.wins + rank.losses)) * 100,
                      )}
                      %)
                    </p>
                  )}
                  <p>{rank && rank.wins}w</p>
                  <p>{rank && rank.losses}l</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-white">Unranked</p>
          )}
        </div>
      </div>
    </div>
  );
}
