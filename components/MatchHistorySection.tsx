"use client";

import pLimit from "p-limit";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import SearchForm from "./SearchForm";
import GameMatchCard from "./GameMatchCard";
import UserStats from "./UserStats";
import checkDbGames from "@/lib/actions/checkDbGames";

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dbChecked, setDbChecked] = useState<boolean>(false);
  const gamesPerPage = 9;

  const checkDatabaseForMatches = useCallback(async () => {
    try {
      const dbGames = await checkDbGames(puuid, matchHistory); // Process found matches
      dbGames?.foundMatches.forEach((matchData: DbGameInfo) => {
        if (matchData.info) {
          setGames((prev) => {
            const exists = prev.some((g) => g.id === matchData.info.matchId);
            return exists
              ? prev
              : [
                  ...prev,
                  {
                    id: matchData.info.matchId,
                    data: matchData,
                  },
                ];
          });
        }
      });

      setDbChecked(true);
      return dbGames?.missingMatchIds;
    } catch (error) {
      console.error("Error checking database:", error);
      return matchHistory; // Fallback to fetching all
    }
  }, [puuid, matchHistory]);

  const fetchGameInfo = useCallback(
    async (matchId: string, index: number) => {
      if (!dbChecked) {
        const DELAY_TIME = 200;
        await delay(index * DELAY_TIME);
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(
          `/api/game-info?gameId=${matchId}&region=${region}&puuid=${puuid}`,
          { signal: controller.signal }
        );

        clearTimeout(timeoutId);

        if (!res.ok) {
          console.error(
            `Error fetching game info for ${matchId}:`,
            res.statusText
          );
          setFailedMatches((prev) => [...prev, matchId]);
          return;
        }
        const data: DbGameInfo = await res.json();

        if (data?.info && data?.participants && data?.teams) {
          setGames((prev) => {
            // Prevent duplicates
            const exists = prev.some((game) => game.id === matchId);
            if (exists) return prev;

            return [...prev, { id: matchId, data: data }];
          });
        } else {
          console.warn(`Invalid data structure for match ${matchId}:`, data);
          setFailedMatches((prev) => [...prev, matchId]);
        }
      } catch (error) {
        if (error === "AbortError") {
          console.error(`Request timeout for match ${matchId}`);
        } else {
          console.error(`Error fetching game info for ${matchId}:`, error);
        }
        setFailedMatches((prev) => [...prev, matchId]);
      }
    },
    [puuid, region]
  );

  useEffect(() => {
    const limit = pLimit(9);
    let isCancelled = false;
    setIsLoading(true);

    const startFetching = async () => {
      try {
        // First check database for existing matches
        const missingMatchIds = await checkDatabaseForMatches();

        // Only fetch matches that weren't in the database
        const batchSize = 10;
        for (let i = 0; i < missingMatchIds!.length; i += batchSize) {
          if (isCancelled) break;
          const batch = missingMatchIds!.slice(i, i + batchSize);
          const tasks = batch.map((matchId: string, batchIndex: number) =>
            limit(() => fetchGameInfo(matchId, i + batchIndex))
          );

          await Promise.all(tasks);

          if (i + batchSize < missingMatchIds!.length) {
            await delay(500); // Rate limiting between batches
          }
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    startFetching();

    return () => {
      isCancelled = true;
      setIsLoading(false);
    };
  }, [matchHistory, fetchGameInfo, checkDatabaseForMatches]);

  const { validGames, totalPages } = useMemo(() => {
    const valid = games
      .filter(
        (game) =>
          game.data &&
          game.data.info &&
          game.data.participants &&
          game.data.teams
      )
      .sort((a, b) => {
        const dateA = new Date(a.data!.info.gameCreation!).getTime();
        const dateB = new Date(b.data!.info.gameCreation!).getTime();
        return dateB - dateA; // Newest first
      });

    return {
      validGames: valid,
      totalPages: Math.ceil(valid.length / gamesPerPage),
    };
  }, [games, gamesPerPage]);

  const currentGames = useMemo(() => {
    const startIndex = (currentPage - 1) * gamesPerPage;
    return validGames.slice(startIndex, startIndex + gamesPerPage);
  }, [currentPage, validGames]);

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

  if (isLoading && validGames.length === 0) {
    return (
      <div className="container max-w-6xl mx-auto mt-5 text-center">
        <div className="text-white">
          {dbChecked ? "Loading remaining matches..." : "Checking database..."}
        </div>
        <div className="text-gray-400 mt-2">
          Loaded {games.length} of {matchHistory.length} matches
          {dbChecked &&
            ` (${matchHistory.length - games.length} from database)`}
        </div>
      </div>
    );
  }

  if (validGames.length === 0 && !isLoading) {
    return (
      <div className="container max-w-6xl mx-auto mt-5 text-center">
        <div className="text-white">
          {failedMatches.length === matchHistory.length
            ? "Failed to load matches"
            : "No valid matches found"}
        </div>
        {failedMatches.length > 0 && (
          <div className="text-red-400 mt-2">
            Failed to load {failedMatches.length} matches
          </div>
        )}
      </div>
    );
  }

  const PaginationControls = ({ position }: { position: "top" | "bottom" }) => (
    <div
      className={`${
        position === "top" ? "mt-4" : "pb-3"
      } flex justify-center items-center space-x-2`}
    >
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
    <div className="container max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 mt-5">
      <div className="h-full border">
        <UserStats games={games} matchHistory={matchHistory} />
      </div>
      <div className="col-span-2 max-w-[765px] shadow-2xl shadow-[#2A2A40]">
        <PaginationControls position="top" />
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
        <PaginationControls position="bottom" />
      </div>
    </div>
  );
};
export default MatchHistorySection;
