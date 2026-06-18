"use client";

import PlayerList from "@/components/leaderboard/PlayerList";
import { fetchLatestVersion, REGIONS } from "@/lib/riot";
import { useState, useEffect } from "react";
import PaginationControls from "../../components/leaderboard/PaginationControls";
import TopThreeDisplay from "@/components/leaderboard/TopThreeDisplay";
import getFrontendRegion from "@/actions/match-history/getFrontendRegion";
import { Button } from "@/components/ui/button";

export interface ChallengerPlayer {
  puuid: string;
  gameName: string;
  tagLine: string;
  region: string;
  summonerLevel: number;
  profileIconId: number;

  queueType: string;
  tier: string; // Challenger, Grandmaster, Master
  rank: number;
  leaguePoints: number;
  wins: number;
  losses: number;

  leaderboardPosition: number;

  revisionDate: number;
  updatedAt: string;
}

const LeaderboardPage = () => {
  const [players, setPlayers] = useState<ChallengerPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latestVersion, setLatestVersion] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("euw1");

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

  useEffect(() => {
    const fetchVersion = async () => {
      const version = await fetchLatestVersion();

      setLatestVersion(version!);
    };

    fetchVersion();
  }, []);

  const topThree = players
    .filter((player) => player.region === selectedRegion)
    .slice(0, 3);
  const remainingPlayers = players.slice(3);
  const filteredPlayers = remainingPlayers.filter(
    (player) => player.region === selectedRegion,
  );

  const paginatedPlayers = filteredPlayers.slice(
    (currentPage - 1) * playersPerPage,
    currentPage * playersPerPage,
  );
  const totalPages = Math.ceil(remainingPlayers.length / playersPerPage);

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

  return (
    <div className="text-white max-w-5xl h-full mt-16 flex flex-col z-10 mx-auto items-center justify-center">
      <div className="w-full flex justify-between p-4">
        {REGIONS.map((region, index) => {
          const displayRegion = getFrontendRegion(region);
          return (
            <Button
              key={index}
              variant="default"
              onClick={() => setSelectedRegion(region)}
              className="h-full px-4 text-xl text-center bg-transparent flex flex-col relative group items-center justify-between hover:bg-transparent transition-colors duration-200 cursor-pointer"
            >
              <h1 className="text-center flex-1 h-full flex flex-col justify-center font-semibold tracking-wider  text-white hover:text-white">
                {displayRegion}
              </h1>
              <div
                className={`absolute bottom-0 left-1/2 h-0.5 w-0 bg-gradient-to-r from-white/25 to-white/35 transition-all duration-300 ease-out transform -translate-x-1/2 ${selectedRegion === region ? "w-full" : "group-hover:w-full"}`}
              ></div>
            </Button>
          );
        })}
      </div>
      <TopThreeDisplay topThree={topThree} latestVersion={latestVersion} />

      <PaginationControls
        position="top"
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />

      {/* Player List */}
      <PlayerList
        paginatedPlayers={paginatedPlayers}
        latestVersion={latestVersion}
      />

      <PaginationControls
        position="bottom"
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />

      {/* Last Updated */}
      <div className="w-full text-center py-4 text-sm text-gray-400">
        Last updated:{" "}
        {players[0] ? new Date(players[0].updatedAt).toLocaleString() : "Never"}
      </div>
    </div>
  );
};

export default LeaderboardPage;
