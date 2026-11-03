"use client";

import PlayerList from "@/components/leaderboard/PlayerList";
import { REGIONS } from "@/lib/riot";
import { fetchLatestVersion } from "@/lib/riot-server";
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
      <div className="container max-w-6xl mx-auto bg-gradient-to-b from-[#1B1F35] to-[#121624] border-b border-slate-400 shadow-[#2A2A40] px-6 sm:px-4 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
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
              {selectedRegion === region && (
                <div className="border border-slate-400 rounded-t-md w-full py-0.5 shadow-inner shadow-sky-500" />
              )}
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
