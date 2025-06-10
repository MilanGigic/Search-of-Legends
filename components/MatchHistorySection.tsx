"use client";

import pLimit from "p-limit";
import { Suspense, useEffect, useMemo, useState } from "react";
import SearchForm from "./SearchForm";
import GameMatchCard from "./GameMatchCard";
import UserStats from "./UserStats";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const MatchHistorySection = ({
  matchHistory,
  puuid,
  region,
}: {
  matchHistory: string[];
  puuid: string;
  region: string;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [games, setGames] = useState<GameDataProps[]>([]);
  const [failedMatches, setFailedMatches] = useState<string[]>([]);
  const gamesPerPage = 9;

  useEffect(() => {
    const limit = pLimit(9);
    let isCancelled = false;

    const fetchGameInfo = async (matchId: string, index: number) => {
      const DELAY_TIME = 700;
      await delay(index * DELAY_TIME);
      try {
        const res = await fetch(
          `/api/game-info?gameId=${matchId}&region=${region}&puuid=${puuid}`
        );

        if (!res.ok) {
          console.error("Error fetching game info:", res.statusText);
          return;
        }

        const data: DbGameInfo = await res.json();

        if (!isCancelled && data?.info) {
          setGames((prev) => [...prev, { id: matchId, data: data }]);
        } else {
          setFailedMatches((prev) => [...prev, matchId]);
        }
      } catch (error) {
        console.error(`Error fetching game info for ${matchId}:`, error);
        if (!isCancelled) {
          setFailedMatches((prev) => [...prev, matchId]);
        }
      }
    };

    const startFetching = async () => {
      const tasks = matchHistory.map((matchId, index) =>
        limit(() => fetchGameInfo(matchId, index))
      );

      await Promise.all(tasks);
    };

    startFetching();

    return () => {
      isCancelled = true;
    };
  }, [matchHistory, puuid, region]);

  const totalPages = Math.ceil(games.length / gamesPerPage);

  // Filter out games with invalid data before pagination
  const validGames = games.filter((game) => game.data && game.data.info);

  const currentGames = useMemo(() => {
    const startIndex = (currentPage - 1) * gamesPerPage;
    return validGames.slice(startIndex, startIndex + gamesPerPage);
  }, [currentPage, validGames]);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 4;

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
  };

  if (validGames.length === 0) {
    return (
      <div className="container max-w-6xl mx-auto mt-5 text-center">
        <div className="text-white">No valid matches found</div>
        {failedMatches.length > 0 && (
          <div className="text-red-400 mt-2">
            Failed to load {failedMatches.length} matches
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 mt-5">
      <div className="h-full border">
        <UserStats games={games} matchHistory={matchHistory} />
      </div>
      <div className="col-span-2 max-w-[765px] shadow-2xl shadow-[#2A2A40]">
        <div className="mt-4 flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-700/50 disabled:hover:bg-gray-700 transition-colors duration-100 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-white">
            {getPageNumbers().map((page, index) =>
              page === "..." ? (
                <span key={index} className="px-3 py-1">
                  ...
                </span>
              ) : (
                <button
                  key={index}
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
        <div className="flex items-center w-full justify-center py-4 bg-[#1E1E2F]">
          <h1 className="mr-2">Search for a champion</h1>
          <SearchForm />
        </div>
        <Suspense>
          {currentGames.map((game, index) => (
            <GameMatchCard
              key={index}
              game={game.data!}
              puuid={puuid}
              region={region}
              currentPage={currentPage}
            />
          ))}
        </Suspense>
        <div className="flex pb-3 justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-white">
            {getPageNumbers().map((page, index) =>
              page === "..." ? (
                <span key={index} className="px-3 py-1">
                  ...
                </span>
              ) : (
                <button
                  key={index}
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
            className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
export default MatchHistorySection;
