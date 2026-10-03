import Image from "next/image";
import PlayerInfo from "./PlayerInfo";
import { calculateCsPerMin, kda } from "@/lib/riot";

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

  return (
    <div className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 border-b border-gray-600 bg-[#2A2A40] rounded-lg mb-2">
      {/* Champion Image */}
      <div className="flex-shrink-0">
        <Image
          src={getChampionImageUrl(participant.championName!)}
          width={40}
          height={40}
          className="sm:w-12 sm:h-12 rounded-full"
          alt={participant.championName!}
        />
      </div>

      {/* Player Info */}
      <PlayerInfo version={version} puuid={puuid} participant={participant} />

      {/* Stats */}
      <div className="flex-shrink-0 text-right">
        <div className="text-sm sm:text-base font-bold text-white mb-1">
          <span className="text-xs sm:text-sm font-normal text-slate-300 mx-0.5">
            KDA
          </span>
          {kda(participant.kills!, participant.deaths!, participant.assists!)}
        </div>
        <div className="text-xs sm:text-sm text-gray-300 mb-1">
          {participant?.kills}/
          <span className="text-red-400">{participant?.deaths}</span>/
          {participant?.assists}
        </div>
        <div className="text-xs text-gray-400">
          {calculateCsPerMin(
            participant?.timePlayed!,
            participant?.totalMinionsKilled!,
          )}{" "}
          cs/min
        </div>
      </div>
    </div>
  );
}
