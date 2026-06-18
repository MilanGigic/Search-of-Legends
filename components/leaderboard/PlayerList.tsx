import { ChallengerPlayer } from "@/app/leaderboard/page";
import { calculateWinRate, formatLP } from "@/lib/riot";
import Image from "next/image";
import Link from "next/link";

interface PlayerListProps {
  paginatedPlayers: ChallengerPlayer[];
  latestVersion: string;
}

export default function PlayerList({
  paginatedPlayers,
  latestVersion,
}: PlayerListProps) {
  return (
    <section className="flex flex-col w-full bg-gradient-to-b from-[#1B1F35] to-[#121624] z-10">
      {/* Table Header */}
      <ul className="w-full grid grid-cols-7 py-3 sm:px-4 bg-gray-800">
        <li className="text-center font-semibold mr-8">Rank</li>
        <li className="col-span-3 font-semibold text-center mr-8 sm:mr-32">
          Player
        </li>
        <li className="text-center font-semibold">W/L</li>
        <li className="text-center font-semibold">Winrate</li>
        <li className="text-center font-semibold">LP</li>
      </ul>
      {paginatedPlayers.map((player, index) => (
        <Link
          href={`/${encodeURIComponent(
            player.gameName!,
          )}-${encodeURIComponent(player.tagLine!)}`}
          key={index}
          className="w-full grid grid-cols-7 py-1 gap-1 cursor-pointer hover:opacity-85 transition-all duration-100 border-b border-gray-700 hover:bg-gray-800/50 even:bg-white/2"
        >
          <span className="text-center flex flex-col items-center justify-center font-bold text-base sm:text-lg">
            {player.leaderboardPosition}
          </span>
          <span className="col-span-3 text-start flex items-center">
            <span className="p-0.5 sm:p-2 sm:px-3 rounded-md sm:mr-3 text-xs">
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/profileicon/${player.profileIconId}.png`}
                alt={player.gameName}
                width={50}
                height={50}
                className="w-5 sm:w-12"
              />
            </span>
            <span className="text-xs sm:text-base font-normal sm:font-semibold">
              {player.gameName}#{player.tagLine}
            </span>
          </span>
          <span className="text-center flex items-center justify-center text-xs sm:text-sm text-gray-300">
            <span className="text-green-400 mr-0.5">{player.wins}</span> /{" "}
            <span className="text-red-400 ml-0.5">{player.losses}</span>
          </span>
          <span className="text-center flex flex-col items-center justify-center font-semibold">
            {calculateWinRate(player.wins, player.losses)}%
          </span>
          <span className="font-bold flex flex-col items-center justify-center bg-gradient-to-r from-sky-900 to-cyan-300 text-transparent bg-clip-text">
            {formatLP(player.leaguePoints)}
          </span>
        </Link>
      ))}
    </section>
  );
}
