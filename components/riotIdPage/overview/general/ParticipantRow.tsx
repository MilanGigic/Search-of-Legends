import Image from "next/image";
import PlayerInfo from "./PlayerInfo";
import { calculateCsPerMin, kda } from "@/lib/riot";
import Link from "next/link";

type ParticipantRowProps = {
  participant: DbParticipantData;
  version: string;
  puuid: string;
};

export default function ParticipantRow({
  participant,
  version,
  puuid,
}: ParticipantRowProps) {
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
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${mappedName}.png`;
  };

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
    <div className="flex justify-between px-4">
      {/* Champion Image */}
      <div className="flex-shrink-0 flex items-center justify-between gap-2 max-w-[176px] w-full">
        <Image
          src={getChampionImageUrl(participant.championName!)}
          width={40}
          height={40}
          className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg border-2 border-white/20"
          alt={participant.championName!}
        />
        <Link
          href={`/${encodeURIComponent(
            participant.riotIdGameName!,
          )}-${encodeURIComponent(participant.riotIdTagline!)}`}
          className="flex items-center text-center max-w-[130px] w-full"
        >
          <h3
            className={`${
              puuid === participant.puuid
                ? "text-amber-400 hover:text-amber-300"
                : "text-gray-200 hover:text-amber-500"
            } transition-colors w-full duration-200 text-sm sm:text-base text-center font-medium truncate cursor-pointer`}
          >
            {participant.riotIdGameName!.length > 10
              ? `${participant.riotIdGameName?.slice(0, 10)}...`
              : participant.riotIdGameName}
            #{participant.riotIdTagline}
          </h3>
        </Link>
      </div>

      {/* Summoner Spells */}
      <div className="flex flex-col gap-1 border-r items-center justify-center pr-1 max-w-[30px] w-full">
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
      <div className="flex gap-0.5 flex-col max-w-[130px] w-full justify-center">
        <div className="flex gap-0.5">
          {[0, 1, 2].map((itemSlot) => {
            const itemId = getItemId(participant, itemSlot);
            return itemId ? (
              <Image
                key={itemSlot}
                src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${itemId}.png`}
                width={20}
                height={20}
                className="w-6 h-6 rounded"
                alt="Item"
              />
            ) : null;
          })}
          {participant.roleBoundItem && (
            <Image
              src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${participant.roleBoundItem}.png`}
              width={20}
              height={20}
              className="w-6 h-6 rounded"
              alt="Item"
            />
          )}
        </div>
        <div className="flex gap-0.5">
          {[3, 4, 5, 6].map((itemSlot) => {
            const itemId = getItemId(participant, itemSlot);
            return itemId ? (
              <Image
                key={itemSlot}
                src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${itemId}.png`}
                width={20}
                height={20}
                className="w-6 h-6 rounded"
                alt="Item"
              />
            ) : null;
          })}
        </div>
      </div>
      <div className="text-sm sm:text-base gap-0.5 text-white mb-1 max-w-[50px] w-full text-center flex items-center justify-center">
        {participant?.kills}/
        <span className="text-red-400">{participant?.deaths}</span>/
        {participant?.assists}
      </div>
      <div className="text-xs sm:text-sm font-bold text-white mb-1 max-w-[40px] w-full text-center flex items-center justify-center">
        <span className="text-xs sm:text-sm font-normal text-slate-300 mx-0.5">
          KDA
        </span>
        {kda(participant.kills!, participant.deaths!, participant.assists!)}
      </div>

      {/* Stats */}
      <div className="text-xs text-gray-400 max-w-[40px] w-full text-center flex items-center justify-center">
        {calculateCsPerMin(
          participant?.timePlayed!,
          participant?.totalMinionsKilled!,
        )}{" "}
        cs/min
      </div>
    </div>
  );
}
