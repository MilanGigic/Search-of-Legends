"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { FaCrown } from "react-icons/fa";
import { GiMedal } from "react-icons/gi";

interface ChallengerPlayer {
  summonerId: string;
  gameName: string;
  tagLine: string;
  puuid: string;
  profileIconId: number;
  summonerLevel: number;
  tier: string; // Challenger, Grandmaster, Master
  leaguePoints: number;
  wins: number;
  losses: number;
  rank: number;
  updatedAt: string;
}

const LeaderboardPage = () => {
  const [players, setPlayers] = useState<ChallengerPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const playersPerPage = 25;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch("/api/leaderboard");
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard");
        }
        const data = await response.json();
        setPlayers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();

    const interval = setInterval(fetchLeaderboard, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const topThree = players.slice(0, 3);
  const remainingPlayers = players.slice(3);

  const paginatedPlayers = remainingPlayers.slice(
    (currentPage - 1) * playersPerPage,
    currentPage * playersPerPage
  );
  const totalPages = Math.ceil(remainingPlayers.length / playersPerPage);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 4;

    if (totalPages <= 1) return [1];

    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    const startPage = Math.max(2, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (currentPage + maxVisiblePages < totalPages) {
      pages.push("...");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  const calculateWinRate = (wins: number, losses: number) => {
    const total = wins + losses;
    if (total === 0) return 0;
    return Math.round((wins / total) * 100);
  };

  const formatLP = (lp: number) => {
    return `${lp.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="text-white max-w-5xl h-full my-5 container mx-auto flex items-center justify-center">
        <div className="text-xl">Loading leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-white max-w-5xl h-full my-5 container mx-auto flex items-center justify-center">
        <div className="text-xl text-red-400">Error: {error}</div>
      </div>
    );
  }

  const PaginationControls = ({ position }: { position: "top" | "bottom" }) => (
    <div className={`py-4 flex justify-center items-center space-x-2`}>
      <button
        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-gray-700 hover:bg-gray-700/50 disabled:hover:bg-gray-700 transition-colors duration-100 text-white rounded disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-white">
        {pageNumbers.map((page, index) =>
          page === "..." ? (
            <span key={`${position}-${index}`} className="px-3 py-1">
              ...
            </span>
          ) : (
            <button
              key={`${position}-${index}`}
              onClick={() => setCurrentPage(Number(page))}
              className={`px-1 py-1 rounded cursor-pointer ${
                currentPage === page
                  ? "text-amber-500 font-bold"
                  : "text-gray-300 hover:text-gray-400"
              }`}
            >
              {page}
            </button>
          )
        )}
      </span>
      <button
        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-gray-700 hover:bg-gray-700/50 disabled:hover:bg-gray-700 transition-colors duration-100 text-white rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );

  return (
    <div className="text-white max-w-5xl h-full my-4 flex flex-col z-10 mx-auto items-center justify-center">
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 sm:gap-6 py-6 px-6 bg-gradient-to-b from-[#121624] to-[#1B1F35] z-10">
        {/* 2nd Place */}
        <Link
          href={`/${encodeURIComponent(
            topThree[1].gameName!
          )}-${encodeURIComponent(topThree[1].tagLine!)}`}
          className="relative bg-black/30 ring-1 order-2 sm:order-1 ring-gray-400 rounded-xl shadow-[0_0_30px_rgba(192,192,192,0.5)] sm:hover:scale-105 transition-transform duration-300 backdrop-blur-lg p-4 flex flex-col items-center justify-center sm:min-h-[250px] mt-6"
          style={{
            backgroundImage: `url(https://ddragon.leagueoflegends.com/cdn/15.6.1/img/profileicon/${topThree[1]?.profileIconId}.png)`,
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
            topThree[0].gameName!
          )}-${encodeURIComponent(topThree[0].tagLine!)}`}
          className="relative bg-black/60 ring-1 ring-yellow-400 rounded-xl shadow-[0_0_40px_rgba(255,215,0,0.6)] sm:scale-105 sm:hover:scale-110 transition-transform duration-300 p-4 flex order-1 sm:order-2 flex-col items-center justify-center sm:min-h-[280px]"
          style={{
            backgroundImage: `url(https://ddragon.leagueoflegends.com/cdn/15.6.1/img/profileicon/${topThree[0]?.profileIconId}.png)`,
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
            topThree[2].gameName!
          )}-${encodeURIComponent(topThree[2].tagLine!)}`}
          className="relative bg-black/30 ring-1 ring-orange-400 rounded-xl shadow-[0_0_30px_rgba(205,127,50,0.5)] sm:hover:scale-105 transition-transform duration-300 backdrop-blur-lg order-3 p-4 flex flex-col items-center justify-center sm:min-h-[250px] mt-6"
          style={{
            backgroundImage: `url(https://ddragon.leagueoflegends.com/cdn/15.6.1/img/profileicon/${topThree[2]?.profileIconId}.png)`,
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

      {/* Player List */}
      <section className="flex flex-col w-full bg-gradient-to-b from-[#1B1F35] to-[#121624] z-10">
        <PaginationControls position="top" />
        {paginatedPlayers.map((player, index) => (
          <Link
            href={`/${encodeURIComponent(
              player.gameName!
            )}-${encodeURIComponent(player.tagLine!)}`}
            key={index}
            className="w-full grid grid-cols-7 py-1 gap-1 cursor-pointer hover:opacity-85 transition-all duration-100 border-b border-gray-700 hover:bg-gray-800/50 even:bg-white/2"
          >
            <span className="text-center flex flex-col items-center justify-center font-bold text-base sm:text-lg">
              {player.rank}
            </span>
            <span className="col-span-3 text-start flex items-center">
              <span className="p-0.5 sm:p-2 sm:px-3 rounded-md sm:mr-3 text-xs">
                <Image
                  src={`https://ddragon.leagueoflegends.com/cdn/15.13.1/img/profileicon/${player.profileIconId}.png`}
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
        <PaginationControls position="bottom" />
      </section>

      {/* Last Updated */}
      <div className="w-full text-center py-4 text-sm text-gray-400">
        Last updated:{" "}
        {players[0] ? new Date(players[0].updatedAt).toLocaleString() : "Never"}
      </div>
    </div>
  );
};

export default LeaderboardPage;
