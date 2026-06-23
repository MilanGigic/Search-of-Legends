import Image from "next/image";
import Link from "next/link";

type PlayerInfoProps = {
  version: string;
  participant: DbParticipantData;
  puuid: string;
};

export default function PlayerInfo({
  version,
  participant,
  puuid,
}: PlayerInfoProps) {
  const getSummonerSpellImageUrl = (spellId: number) => {
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
  const getItemId = (
    participant: DbParticipantData,
    itemSlot: number,
  ): number | null => {
    const itemKey = `item${itemSlot}` as keyof DbParticipantData;
    const itemId = participant[itemKey];
    return typeof itemId === "number" ? itemId : null;
  };

  const summoner1Url = getSummonerSpellImageUrl(participant.summoner1Id!);
  const summoner2Url = getSummonerSpellImageUrl(participant.summoner2Id!);
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1 mb-1">
        <Image
          src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${participant.profileIcon}.png`}
          width={20}
          height={20}
          className="sm:w-6 sm:h-6 rounded"
          alt="Profile"
        />
        <Link
          href={`/${encodeURIComponent(
            participant.riotIdGameName!,
          )}-${encodeURIComponent(participant.riotIdTagline!)}`}
        >
          <h3
            className={`${
              puuid === participant.puuid
                ? "text-amber-400 hover:text-amber-300"
                : "text-gray-200 hover:text-amber-500"
            } transition-colors duration-200 text-sm sm:text-base text-center font-medium truncate cursor-pointer`}
          >
            {participant.riotIdGameName!.length > 10
              ? `${participant.riotIdGameName?.slice(0, 10)}...`
              : participant.riotIdGameName}
            #{participant.riotIdTagline}
          </h3>
        </Link>
      </div>

      {/* Items and Summoner Spells */}
      <div className="flex items-center gap-0.5 flex-wrap">
        {/* Summoner Spells */}
        <div className="flex gap-0.5">
          {summoner1Url && (
            <Image
              src={summoner1Url}
              width={24}
              height={24}
              className="w-6 h-6 sm:w-5 sm:h-5 rounded"
              alt="Summoner Spell"
            />
          )}
          {summoner2Url && (
            <Image
              src={summoner2Url}
              width={24}
              height={24}
              className="w-6 h-6 sm:w-5.5 sm:h-5.5 rounded"
              alt="Summoner Spell"
            />
          )}
        </div>

        {/* Items */}
        <div className="flex gap-0.5">
          {[0, 1, 2, 3, 4, 5].map((itemSlot) => {
            const itemId = getItemId(participant, itemSlot);
            return itemId ? (
              <Image
                key={itemSlot}
                src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${itemId}.png`}
                width={20}
                height={20}
                className="w-5 h-5 rounded"
                alt="Item"
              />
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
}
