import { calculateCsPerMin, kda } from "@/lib/riot";
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
  return (
    <div
      className={`bg-[#2A2A40] ${
        showGame ? "p-5" : ""
      } w-full mx-auto flex-col`}
    >
      {showGame ? (
        <div className="max-w-[765px]">
          <div className="flex gap-5 animate-fade-down animate-ease-in-out animate-duration-200">
            <div className="w-full flex flex-col">
              <div className="flex justify-center items-center flex-col">
                <h1>Blue </h1>
                <span
                  className={`${
                    game.teams[0].win === 1
                      ? "text-[#7ECA9C]"
                      : "text-[#F05A5A]"
                  }`}
                >
                  {game.teams[0].win === 1 ? "Victory" : "Defeat"}
                </span>
              </div>
              {game.participants?.map((participant) => {
                return (
                  <div
                    key={participant.puuid}
                    className="animate-fade-right animate-ease-in animate-delay-300 animate-duration-400"
                  >
                    {participant.teamId === 100 ? (
                      <div className="py-5 flex border-b border-cyan-200 justify-between h-[105px]">
                        <div className="flex flex-col justify-center">
                          <div className="flex items-center mb-2">
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/profileicon/${participant.profileIcon}.png`}
                              width={30}
                            />
                            <Link
                              href={`/${participant.riotIdGameName}-${participant.riotIdTagline}?region=${region}`}
                            >
                              <h1
                                className={`${
                                  puuid === participant.puuid &&
                                  "text-amber-500 hover:text-amber-300"
                                } hover:text-gray-300  transition-colors duration-100 ml-2 cursor-pointer text-sm max-w-[170px]`}
                              >
                                {participant.riotIdGameName!.length > 12 ? (
                                  <span className="text-base">
                                    {participant.riotIdGameName?.slice(0, 12) +
                                      "..."}
                                    #
                                  </span>
                                ) : (
                                  <span className="text-base">
                                    {participant.riotIdGameName}#
                                  </span>
                                )}
                                {participant.riotIdTagline}
                              </h1>
                            </Link>
                          </div>
                          <ul className="flex gap-0.5 items-center w-[210px] p-2 bg-[#1E1E2F] rounded-md inset-shadow-xs inset-shadow-black/80">
                            <li>
                              {participant.summoner1Id === 4 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerFlash.png`}
                                  width={30}
                                />
                              ) : participant.summoner1Id === 21 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerBarrier.png`}
                                  width={30}
                                />
                              ) : participant.summoner1Id === 1 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerBoost.png`}
                                  width={30}
                                />
                              ) : participant.summoner1Id === 14 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerDot.png`}
                                  width={30}
                                />
                              ) : participant.summoner1Id === 3 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerExhaust.png`}
                                  width={30}
                                />
                              ) : participant.summoner1Id === 6 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerHaste.png`}
                                  width={30}
                                />
                              ) : participant.summoner1Id === 7 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerHeal.png`}
                                  width={30}
                                />
                              ) : participant.summoner1Id === 13 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerMana.png`}
                                  width={30}
                                />
                              ) : participant.summoner1Id === 11 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerSmite.png`}
                                  width={30}
                                />
                              ) : participant.summoner1Id === 12 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerTeleport.png`}
                                  width={30}
                                />
                              ) : null}
                            </li>
                            <li>
                              {participant.summoner2Id === 4 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerFlash.png`}
                                  width={30}
                                />
                              ) : participant.summoner2Id === 21 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerBarrier.png`}
                                  width={30}
                                />
                              ) : participant.summoner2Id === 1 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerBoost.png`}
                                  width={30}
                                />
                              ) : participant.summoner2Id === 14 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerDot.png`}
                                  width={30}
                                />
                              ) : participant.summoner2Id === 3 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerExhaust.png`}
                                  width={30}
                                />
                              ) : participant.summoner2Id === 6 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerHaste.png`}
                                  width={30}
                                />
                              ) : participant.summoner2Id === 7 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerHeal.png`}
                                  width={30}
                                />
                              ) : participant.summoner2Id === 13 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerMana.png`}
                                  width={30}
                                />
                              ) : participant.summoner2Id === 11 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerSmite.png`}
                                  width={30}
                                />
                              ) : participant.summoner2Id === 12 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerTeleport.png`}
                                  width={30}
                                />
                              ) : null}
                            </li>
                            <li>
                              {participant.item0 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${participant.item0}.png`}
                                  alt="Item"
                                  width={25}
                                />
                              ) : null}
                            </li>
                            <li>
                              {participant.item1 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${participant.item1}.png`}
                                  alt="Item"
                                  width={25}
                                />
                              ) : null}
                            </li>
                            <li>
                              {participant.item2 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${participant.item2}.png`}
                                  alt="Item"
                                  width={25}
                                />
                              ) : null}
                            </li>
                            <li>
                              {participant.item3 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${participant.item3}.png`}
                                  alt="Item"
                                  width={25}
                                />
                              ) : null}
                            </li>
                            <li>
                              {participant.item4 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${participant.item4}.png`}
                                  alt="Item"
                                  width={25}
                                />
                              ) : null}
                            </li>
                            <li>
                              {participant.item5 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${participant.item5}.png`}
                                  alt="Item"
                                  width={25}
                                />
                              ) : null}
                            </li>
                          </ul>
                        </div>
                        <div className="text-base font-semibold italic flex flex-col-reverse items-center text-center justify-center">
                          <p className="">
                            <span className="font-light text-sm text-gray-300">
                              {calculateCsPerMin(
                                participant?.timePlayed!,
                                participant?.totalMinionsKilled!
                              )}{" "}
                              cs<span className="text-xs">/</span>min
                            </span>{" "}
                          </p>
                          <div>
                            <span className="not-italic text-gray-300"></span>
                            {participant?.kills}/
                            <span className="text-red-300 items-center">
                              {participant?.deaths}
                            </span>
                            /{participant?.assists}
                          </div>
                          <span className="not-italic text-base font-light text-gray-300">
                            <span className="text-lg font-bold not-italic items-center text-white">
                              {kda(
                                participant.kills!,
                                participant.deaths!,
                                participant.assists!
                              )}
                            </span>
                            KDA
                          </span>
                        </div>
                        <div className="flex">
                          {participant.championName === "Aurelion Sol" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/AurelionSol.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Bel'Veth" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/Belveth.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Cho'Gath" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/Chogath.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Dr. Mundo" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/DrMundo.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Jarvan IV" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/JarvanIV.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Kai'Sa" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/Kaisa.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Kog'Maw" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/Kogmaw.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Kha'Zix" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/Khazix.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "K'Sante" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/KSante.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "LeBlanc" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/Leblanc.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Lee Sin" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/LeeSin.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Master Yi" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/MasterYi.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Miss Fortune" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/MissFortune.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Wukong" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/MonkeyKing.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Nunu & Willump" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/Nunu.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Rek'Sai" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/RekSai.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Tahm Kench" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/TahmKench.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Twisted Fate" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/TwistedFate.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Vel'Koz" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/Velkoz.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Xin Zhao" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/XinZhao.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "FiddleSticks" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/Fiddlesticks.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/${participant.championName}.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col w-full">
              <div className="flex justify-center items-center flex-col">
                Red{" "}
                <span
                  className={`${
                    game.teams![1].win === 1 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {" "}
                  {game.teams![1].win === 1 ? "Victory" : "Defeat"}
                </span>
              </div>
              {game.participants?.map((participant) => {
                return (
                  <div
                    key={participant.puuid}
                    className="animate-fade-left animate-ease-in animate-delay-300 animate-duration-400"
                  >
                    {participant.teamId === 200 ? (
                      <div className="border-b border-cyan-200 flex flex-row-reverse h-[105px] justify-between py-5">
                        <div className="flex flex-col justify-center">
                          <div className="flex items-center justify-end mb-2">
                            <Link
                              href={`/${participant.riotIdGameName}-${participant.riotIdTagline}?region=${region}`}
                            >
                              <h1
                                className={`${
                                  puuid === participant.puuid &&
                                  "text-amber-500 hover:text-amber-300"
                                } hover:text-gray-300  transition-colors mr-2 duration-100 cursor-pointer text-sm max-w-[170px]`}
                              >
                                {participant.riotIdGameName!.length >= 12 ? (
                                  <span className="text-wrap flex flex-wrap text-base">
                                    {participant.riotIdGameName?.slice(0, 12) +
                                      "..."}
                                    #
                                  </span>
                                ) : (
                                  <span className="text-base">
                                    {participant.riotIdGameName}#
                                  </span>
                                )}
                                {participant.riotIdTagline}
                              </h1>
                            </Link>
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/profileicon/${participant.profileIcon}.png`}
                              width={30}
                            />
                          </div>
                          <ul className="flex justify-end gap-0.5 items-center w-[210px] p-2 bg-[#1E1E2F] rounded-md inset-shadow-xs inset-shadow-black/80">
                            <li>
                              {participant.item0 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${participant.item0}.png`}
                                  alt="Item"
                                  width={25}
                                />
                              ) : null}
                            </li>
                            <li>
                              {participant.item1 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${participant.item1}.png`}
                                  alt="Item"
                                  width={25}
                                />
                              ) : null}
                            </li>
                            <li>
                              {participant.item2 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${participant.item2}.png`}
                                  alt="Item"
                                  width={25}
                                />
                              ) : null}
                            </li>
                            <li>
                              {participant.item3 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${participant.item3}.png`}
                                  alt="Item"
                                  width={25}
                                />
                              ) : null}
                            </li>
                            <li>
                              {participant.item4 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${participant.item4}.png`}
                                  alt="Item"
                                  width={25}
                                />
                              ) : null}
                            </li>
                            <li>
                              {participant.item5 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${participant.item5}.png`}
                                  alt="Item"
                                  width={25}
                                />
                              ) : null}
                            </li>
                            <li>
                              {participant.summoner1Id === 4 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerFlash.png`}
                                  width={30}
                                />
                              ) : participant.summoner1Id === 21 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerBarrier.png`}
                                  width={30}
                                />
                              ) : participant.summoner1Id === 1 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerBoost.png`}
                                  width={30}
                                />
                              ) : participant.summoner1Id === 14 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerDot.png`}
                                  width={30}
                                />
                              ) : participant.summoner1Id === 3 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerExhaust.png`}
                                  width={30}
                                />
                              ) : participant.summoner1Id === 6 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerHaste.png`}
                                  width={30}
                                />
                              ) : participant.summoner1Id === 7 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerHeal.png`}
                                  width={30}
                                />
                              ) : participant.summoner1Id === 13 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerMana.png`}
                                  width={30}
                                />
                              ) : participant.summoner1Id === 11 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerSmite.png`}
                                  width={30}
                                />
                              ) : participant.summoner1Id === 12 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerTeleport.png`}
                                  width={30}
                                />
                              ) : null}
                            </li>
                            <li>
                              {participant.summoner2Id === 4 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerFlash.png`}
                                  width={30}
                                />
                              ) : participant.summoner2Id === 21 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerBarrier.png`}
                                  width={30}
                                />
                              ) : participant.summoner2Id === 1 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerBoost.png`}
                                  width={30}
                                />
                              ) : participant.summoner2Id === 14 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerDot.png`}
                                  width={30}
                                />
                              ) : participant.summoner2Id === 3 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerExhaust.png`}
                                  width={30}
                                />
                              ) : participant.summoner2Id === 6 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerHaste.png`}
                                  width={30}
                                />
                              ) : participant.summoner2Id === 7 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerHeal.png`}
                                  width={30}
                                />
                              ) : participant.summoner2Id === 13 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerMana.png`}
                                  width={30}
                                />
                              ) : participant.summoner2Id === 11 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerSmite.png`}
                                  width={30}
                                />
                              ) : participant.summoner2Id === 12 ? (
                                <img
                                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerTeleport.png`}
                                  width={30}
                                />
                              ) : null}
                            </li>
                          </ul>
                        </div>

                        <div className="text-base font-semibold italic flex flex-col-reverse items-center text-center justify-center">
                          <p className="">
                            <span className="font-light flex text-sm text-gray-300">
                              {calculateCsPerMin(
                                participant?.timePlayed!,
                                participant?.totalMinionsKilled!
                              )}{" "}
                              cs<span className="text-xs">/</span>min
                            </span>{" "}
                          </p>

                          <div className="flex">
                            <span className="not-italic text-gray-300"></span>
                            {participant?.kills}/
                            <span className="text-red-300 items-center">
                              {participant?.deaths}
                            </span>
                            /{participant?.assists}
                          </div>
                          <span className="not-italic text-base font-light text-gray-300">
                            <span className="text-lg font-bold not-italic items-center text-white">
                              {kda(
                                participant.kills!,
                                participant.deaths!,
                                participant.assists!
                              )}
                            </span>
                            KDA
                          </span>
                        </div>
                        <div className="flex">
                          {participant.championName === "Aurelion Sol" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/AurelionSol.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Bel'Veth" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/Belveth.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Cho'Gath" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/Chogath.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Dr. Mundo" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/DrMundo.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Jarvan IV" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/JarvanIV.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Kai'Sa" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/Kaisa.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Kog'Maw" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/Kogmaw.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Kha'Zix" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/Khazix.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "K'Sante" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/KSante.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "LeBlanc" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/Leblanc.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Lee Sin" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/LeeSin.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Master Yi" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/MasterYi.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Miss Fortune" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/MissFortune.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Wukong" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/MonkeyKing.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Nunu & Willump" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/Nunu.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Rek'Sai" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/RekSai.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Tahm Kench" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/TahmKench.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Twisted Fate" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/TwistedFate.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Vel'Koz" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/Velkoz.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "Xin Zhao" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/XinZhao.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : participant.championName === "FiddleSticks" ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/Fiddlesticks.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          ) : (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/${participant.championName}.png`}
                              width={64}
                              height={64}
                              className=""
                            />
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
export default General;
