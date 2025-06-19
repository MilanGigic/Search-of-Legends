import { calculateCsPerMin, kda } from "@/lib/riot";
import Image from "next/image";
import Link from "next/link";

const General = ({
  game,
  puuid,
  showGame,
  region,
}: {
  game: DbGameInfo;
  puuid: string;
  showGame: boolean;
  region: string;
}) => {
  const blueTeamParticipants =
    game.participants?.filter((p) => p.teamId === 100) || [];
  const redTeamParticipants =
    game.participants?.filter((p) => p.teamId === 200) || [];

  // Function to get champion image URL with special cases
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
    return `https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/${mappedName}.png`;
  };

  // Function to get summoner spell image URL
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
      ? `https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/${spellName}.png`
      : null;
  };

  const getItemId = (
    participant: ParticipantData,
    itemSlot: number
  ): number | null => {
    const itemKey = `item${itemSlot}` as keyof ParticipantData;
    const itemId = participant[itemKey];
    return typeof itemId === "number" ? itemId : null;
  };

  const ParticipantRow = ({
    participant,
    isBlueTeam,
  }: {
    participant: ParticipantData;
    isBlueTeam: boolean;
  }) => {
    const summoner1Url = getSummonerSpellImageUrl(participant.summoner1Id!);
    const summoner2Url = getSummonerSpellImageUrl(participant.summoner2Id!);

    return (
      <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border-b border-gray-600 bg-[#2A2A40] rounded-lg mb-2">
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
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Image
              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/profileicon/${participant.profileIcon}.png`}
              width={20}
              height={20}
              className="sm:w-6 sm:h-6 rounded"
              alt="Profile"
            />
            <Link
              href={`/${encodeURIComponent(
                participant.riotIdGameName!
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
          <div className="flex items-center gap-1 flex-wrap">
            {/* Summoner Spells */}
            <div className="flex gap-0.5">
              {summoner1Url && (
                <Image
                  src={summoner1Url}
                  width={20}
                  height={20}
                  className="sm:w-6 sm:h-6 rounded"
                  alt="Summoner Spell"
                />
              )}
              {summoner2Url && (
                <Image
                  src={summoner2Url}
                  width={20}
                  height={20}
                  className="sm:w-6 sm:h-6 rounded"
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
                    src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${itemId}.png`}
                    width={18}
                    height={18}
                    className="sm:w-5 sm:h-5 rounded"
                    alt="Item"
                  />
                ) : null;
              })}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-shrink-0 text-right">
          <div className="text-sm sm:text-base font-bold text-white mb-1">
            <span className="text-xs sm:text-sm font-normal text-slate-300 mx-0.5">
              KDA
            </span>
            {kda(participant.kills!, participant.deaths!, participant.assists!)}
          </div>
          <div className="text-xs sm:text-sm text-gray-300 mb-1">
            {participant?.kills}/{" "}
            <span className="text-red-400">{participant?.deaths}</span>/
            {participant?.assists}
          </div>
          <div className="text-xs text-gray-400">
            {calculateCsPerMin(
              participant?.timePlayed!,
              participant?.totalMinionsKilled!
            )}{" "}
            cs/min
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#1E1E2F]/20 w-full">
      {showGame ? (
        <div className="p-3 sm:p-5 max-w-7xl mx-auto">
          <div className="animate-fade-down animate-duration-300 animate-ease-in-out">
            {/* Mobile Layout: Stacked Teams */}
            <div className="block lg:hidden space-y-6">
              {/* Blue Team */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-center items-center mb-4">
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-blue-400 mb-1">
                      Blue Team
                    </h2>
                    <span
                      className={`text-lg font-semibold ${
                        game.teams[0].win === 1
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {game.teams[0].win === 1 ? "Victory" : "Defeat"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {blueTeamParticipants.map((participant) => (
                    <ParticipantRow
                      key={`blue-${participant.puuid}`}
                      participant={participant}
                      isBlueTeam={true}
                    />
                  ))}
                </div>
              </div>

              {/* Red Team */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-center items-center mb-4">
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-red-400 mb-1">
                      Red Team
                    </h2>
                    <span
                      className={`text-lg font-semibold ${
                        game.teams![1].win === 1
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {game.teams![1].win === 1 ? "Victory" : "Defeat"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {redTeamParticipants.map((participant) => (
                    <ParticipantRow
                      key={`red-${participant.puuid}`}
                      participant={participant}
                      isBlueTeam={false}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop Layout: Side by Side */}
            <div className="hidden lg:flex gap-8">
              {/* Blue Team */}
              <div className="flex-1">
                <div className="flex justify-center items-center flex-col mb-6">
                  <h2 className="text-2xl font-bold text-blue-400 mb-2">
                    Blue Team
                  </h2>
                  <span
                    className={`text-xl font-semibold ${
                      game.teams[0].win === 1
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {game.teams[0].win === 1 ? "Victory" : "Defeat"}
                  </span>
                </div>
                <div className="space-y-3">
                  {blueTeamParticipants.map((participant) => (
                    <ParticipantRow
                      key={`blue-${participant.puuid}`}
                      participant={participant}
                      isBlueTeam={true}
                    />
                  ))}
                </div>
              </div>

              {/* Red Team */}
              <div className="flex-1">
                <div className="flex justify-center items-center flex-col mb-6">
                  <h2 className="text-2xl font-bold text-red-400 mb-2">
                    Red Team
                  </h2>
                  <span
                    className={`text-xl font-semibold ${
                      game.teams![1].win === 1
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {game.teams![1].win === 1 ? "Victory" : "Defeat"}
                  </span>
                </div>
                <div className="space-y-3">
                  {redTeamParticipants.map((participant) => (
                    <ParticipantRow
                      key={`red-${participant.puuid}`}
                      participant={participant}
                      isBlueTeam={false}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default General;
