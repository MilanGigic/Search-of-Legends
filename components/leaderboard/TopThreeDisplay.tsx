import { ChallengerPlayer } from "@/app/leaderboard/page";
import { calculateWinRate, formatLP } from "@/lib/riot";
import Link from "next/link";
import { FaCrown } from "react-icons/fa";
import { GiMedal } from "react-icons/gi";

interface TopThreeProps {
  topThree: ChallengerPlayer[];
  latestVersion: string;
}

export default function TopThreeDisplay({
  topThree,
  latestVersion,
}: TopThreeProps) {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-3 sm:gap-6 py-6 px-6 bg-gradient-to-b from-[#121624] to-[#1B1F35] z-10">
      {/* 2nd Place */}
      <Link
        href={`/${encodeURIComponent(
          topThree[1].gameName!,
        )}-${encodeURIComponent(topThree[1].tagLine!)}`}
        className="relative bg-black/30 ring-1 order-2 sm:order-1 ring-gray-400 rounded-xl shadow-[0_0_30px_rgba(192,192,192,0.5)] sm:hover:scale-105 transition-transform duration-300 backdrop-blur-lg p-4 flex flex-col items-center justify-center sm:min-h-[250px] mt-6"
        style={{
          backgroundImage: `url(https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/profileicon/${topThree[1]?.profileIconId}.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60 rounded-xl"></div>
        <div className="relative z-10 text-center">
          <div className="text-3xl font-extrabold text-white mb-2">
            2nd
            <GiMedal className="text-gray-300 text-3xl mb-1 drop-shadow-md flex w-full justify-center" />
          </div>
          <div className="text-lg font-semibold text-white mb-1">
            {topThree[1].gameName}#{topThree[1].tagLine}
          </div>
          <div className="text-sm text-gray-300 mb-2">
            {calculateWinRate(topThree[1].wins, topThree[1].losses)}% WR
          </div>
          <div className="text-xl font-bold bg-gradient-to-r from-sky-600 to-cyan-400 text-transparent bg-clip-text">
            {formatLP(topThree[1].leaguePoints)}
          </div>
        </div>
      </Link>

      {/* 1st Place */}
      <Link
        href={`/${encodeURIComponent(
          topThree[0].gameName!,
        )}-${encodeURIComponent(topThree[0].tagLine!)}`}
        className="relative bg-black/60 ring-1 ring-yellow-400 rounded-xl shadow-[0_0_40px_rgba(255,215,0,0.6)] sm:scale-105 sm:hover:scale-110 transition-transform duration-300 p-4 flex order-1 sm:order-2 flex-col items-center justify-center sm:min-h-[280px]"
        style={{
          backgroundImage: `url(https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/profileicon/${topThree[0]?.profileIconId}.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60 rounded-xl"></div>
        <div className="relative z-10 text-center">
          <div className="text-4xl font-extrabold text-white mb-2">
            <FaCrown className="text-yellow-400 text-3xl mb-1 drop-shadow-md flex items-center justify-center w-full" />{" "}
            1st
          </div>
          <div className="text-lg font-semibold text-white mb-1">
            {topThree[0].gameName}#{topThree[0].tagLine}
          </div>
          <div className="text-sm text-gray-300 mb-2">
            {calculateWinRate(topThree[0].wins, topThree[0].losses)}% WR
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-cyan-400 text-transparent bg-clip-text">
            {formatLP(topThree[0].leaguePoints)}
          </div>
        </div>
      </Link>

      {/* 3rd Place */}
      <Link
        href={`/${encodeURIComponent(
          topThree[2].gameName!,
        )}-${encodeURIComponent(topThree[2].tagLine!)}`}
        className="relative bg-black/30 ring-1 ring-orange-400 rounded-xl shadow-[0_0_30px_rgba(205,127,50,0.5)] sm:hover:scale-105 transition-transform duration-300 backdrop-blur-lg order-3 p-4 flex flex-col items-center justify-center sm:min-h-[250px] mt-6"
        style={{
          backgroundImage: `url(https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/profileicon/${topThree[2]?.profileIconId}.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60 rounded-xl"></div>
        <div className="relative z-10 text-center">
          <div className="text-3xl font-extrabold text-white mb-2">
            3rd
            <GiMedal className="text-orange-400 text-3xl mb-1 drop-shadow-md flex w-full justify-center" />
          </div>
          <div className="text-lg font-semibold text-white mb-1">
            {topThree[2].gameName}#{topThree[2].tagLine}
          </div>
          <div className="text-sm text-gray-300 mb-2">
            {calculateWinRate(topThree[2].wins, topThree[2].losses)}% WR
          </div>
          <div className="text-xl font-bold bg-gradient-to-r from-sky-600 to-cyan-400 text-transparent bg-clip-text">
            {formatLP(topThree[2].leaguePoints)}
          </div>
        </div>
      </Link>
    </div>
  );
}
