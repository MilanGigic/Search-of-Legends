"use client";

import { useState, useEffect } from "react";

interface ChallengerPlayer {
  summonerId: string;
  gameName: string;
  tagLine: string;
  puuid: string;
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

  // NEED TO FETCH THE GAMES FOR THE LEADERBOARD PLAYERS

  const calculateWinRate = (wins: number, losses: number) => {
    const total = wins + losses;
    if (total === 0) return 0;
    return Math.round((wins / total) * 100);
  };

  const formatLP = (lp: number) => {
    return `${lp.toLocaleString()} LP`;
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

  const topThree = players.slice(0, 3);
  const remainingPlayers = players.slice(3);

  return (
    <div className="text-white max-w-5xl h-full my-5 container mx-auto flex flex-col items-center justify-center">
      {/* Top 3 Podium */}
      <div className="flex w-full border justify-between py-5 px-10 bg-gradient-to-b from-[#121624] to-[#1B1F35] z-100">
        {/* 2nd Place */}
        <div className="mt-7 h-[250px] border border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center bg-gradient-to-b from-gray-700 to-gray-800">
          {topThree[1] && (
            <>
              <div className="text-2xl font-bold text-gray-300 mb-2">2nd</div>
              <div className="text-lg font-semibold mb-1">
                {topThree[1].gameName}#{topThree[1].tagLine}
              </div>
              <div className="text-sm text-gray-400 mb-2">
                {calculateWinRate(topThree[1].wins, topThree[1].losses)}% WR
              </div>
              <div className="text-xl font-bold text-yellow-400">
                {formatLP(topThree[1].leaguePoints)}
              </div>
            </>
          )}
        </div>

        {/* 1st Place */}
        <div className="mt-2 h-[250px] border border-yellow-400 rounded-lg p-4 flex flex-col items-center justify-center bg-gradient-to-b from-yellow-600 to-yellow-700">
          {topThree[0] && (
            <>
              <div className="text-3xl font-bold text-yellow-200 mb-2">1st</div>
              <div className="text-xl font-bold mb-1">
                {topThree[0].gameName}#{topThree[0].tagLine}
              </div>
              <div className="text-sm text-yellow-200 mb-2">
                {calculateWinRate(topThree[0].wins, topThree[0].losses)}% WR
              </div>
              <div className="text-2xl font-bold text-yellow-100">
                {formatLP(topThree[0].leaguePoints)}
              </div>
            </>
          )}
        </div>

        {/* 3rd Place */}
        <div className="mt-12 h-[250px] border border-orange-600 rounded-lg p-4 flex flex-col items-center justify-center bg-gradient-to-b from-orange-700 to-orange-800">
          {topThree[2] && (
            <>
              <div className="text-xl font-bold text-orange-300 mb-2">3rd</div>
              <div className="text-lg font-semibold mb-1">
                {topThree[2].gameName}#{topThree[2].tagLine}
              </div>
              <div className="text-sm text-orange-400 mb-2">
                {calculateWinRate(topThree[2].wins, topThree[2].losses)}% WR
              </div>
              <div className="text-lg font-bold text-orange-200">
                {formatLP(topThree[2].leaguePoints)}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table Header */}
      <ul className="w-full grid grid-cols-6 py-3 px-4 border-t border-gray-600 bg-gray-800">
        <li className="text-center font-semibold">Rank</li>
        <li className="col-span-2 font-semibold">Player</li>
        <li className="text-center font-semibold">W/L</li>
        <li className="text-center font-semibold">Winrate</li>
        <li className="text-center font-semibold">LP</li>
      </ul>

      {/* Player List */}
      <section className="flex flex-col w-full border-x border-b bg-gradient-to-b from-[#1B1F35] to-[#121624] z-100">
        {remainingPlayers.map((player, index) => (
          <div
            key={player.summonerId}
            className="w-full grid grid-cols-6 py-4 px-4 cursor-pointer hover:opacity-85 transition-all duration-100 border-b border-gray-700 hover:bg-gray-800/50"
          >
            <span className="text-center font-bold text-lg">{player.rank}</span>
            <span className="col-span-2 text-start flex items-center">
              <span className="p-2 px-3 border rounded-md mr-3 bg-blue-600 text-xs">
                C
              </span>
              <span className="font-semibold">
                {player.gameName}#{player.tagLine}
              </span>
            </span>
            <span className="text-center text-sm text-gray-300">
              {player.wins}W / {player.losses}L
            </span>
            <span className="text-center font-semibold">
              {calculateWinRate(player.wins, player.losses)}%
            </span>
            <span className="text-center">
              <span className="font-bold text-yellow-400">
                {formatLP(player.leaguePoints)}
              </span>
            </span>
          </div>
        ))}
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
