"use client";

import pLimit from "p-limit";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import GameMatchCard from "./GameMatchCard";
import checkDbGames from "@/actions/checkDbGames";
import { createRiotRateLimiter } from "@/actions/rateLimiter";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const MatchHistorySection = ({
  matchHistory,
  puuid,
  region,
  version,
  numberOfMatches,
}: {
  matchHistory: string[];
  puuid: string;
  region: string;
  version: string;
  numberOfMatches: any;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [games, setGames] = useState<GameDataProps[]>([]);
  const [failedMatches, setFailedMatches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dbChecked, setDbChecked] = useState<boolean>(false);
  const gamesPerPage = 9;

  console.log(">>> numberOfMatches", numberOfMatches);

  const riotRateLimiter = createRiotRateLimiter();

  const fetchGameInfo = useCallback(
    async (matchId: string, index: number) => {
      await riotRateLimiter();
      if (
        !matchId ||
        typeof matchId !== "string" ||
        matchId.trim().length === 0
      ) {
        console.error(`Invalid matchId provided: ${matchId}`);
        setFailedMatches((prev) => [...prev, matchId || "unknown"]);
        return;
      }

      if (!region || !puuid) {
        console.error(
          `Missing required parameters: region=${region}, puuid=${!!puuid}`,
        );
        setFailedMatches((prev) => [...prev, matchId]);
        return;
      }

      if (!dbChecked) {
        const DELAY_TIME = 200;
        await delay(index * DELAY_TIME);
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(
          `/api/game-info?gameId=${matchId}&region=${region}&puuid=${puuid}`,
          { signal: controller.signal },
        );

        clearTimeout(timeoutId);

        if (res.status === 429) {
          setFailedMatches((prev) => [...prev, matchId]);
          await delay(1000 * 60 * 2);
        }
        if (!res.ok) {
          console.error(
            `HTTP error fetching game info for ${matchId}: ${res.status} ${res.statusText}`,
          );
          setFailedMatches((prev) => [...prev, matchId]);
          return;
        }
        let data: DbGameInfo;
        try {
          data = await res.json();
        } catch (parseError) {
          console.error(`JSON parse error for match ${matchId}:`, parseError);
          setFailedMatches((prev) => [...prev, matchId]);
          return;
        }

        // Step 4: Comprehensive data structure validation
        if (!data || typeof data !== "object") {
          console.warn(`Invalid data object for match ${matchId}:`, data);
          setFailedMatches((prev) => [...prev, matchId]);
          return;
        }

        // Step 5: Validate essential data fields
        const validationChecks = {
          hasInfo: data.info && typeof data.info === "object",
          hasParticipants:
            Array.isArray(data.participants) && data.participants.length > 0,
          hasTeams: Array.isArray(data.teams) && data.teams.length > 0,
          hasMatchId: data.info?.matchId === matchId,
          hasGameCreation:
            data.info?.gameCreation !== undefined &&
            data.info.gameCreation !== null,
        };

        const failedChecks = Object.entries(validationChecks)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .filter(([_, passed]) => !passed)
          .map(([check]) => check);

        if (failedChecks.length > 0) {
          console.warn(`Data validation failed for match ${matchId}:`, {
            failedChecks,
            dataStructure: {
              hasInfo: !!data.info,
              participantsLength: data.participants?.length || 0,
              teamsLength: data.teams?.length || 0,
              matchIdMatch: data.info?.matchId === matchId,
            },
          });
          setFailedMatches((prev) => [...prev, matchId]);
          return;
        }

        // Step 6: Additional participant validation
        const validParticipants = data.participants.filter(
          (p) => p && typeof p === "object" && p.puuid,
        );

        if (validParticipants.length !== data.participants.length) {
          console.warn(
            `Some participants invalid for match ${matchId}: ${validParticipants.length}/${data.participants.length} valid`,
          );
        }

        // Step 7: Process valid game data
        setGames((prev) => {
          const exists = prev.some((game) => game.id === matchId);
          if (exists) {
            return prev;
          }

          return [...prev, { id: matchId, data: data }];
        });
      } catch (error) {
        // Step 8: Enhanced error handling
        if (error === "AbortError") {
          console.error(`Request timeout for match ${matchId}`);
        } else if (
          error instanceof TypeError &&
          error.message.includes("fetch")
        ) {
          console.error(
            `Network error fetching match ${matchId}:`,
            error.message,
          );
        } else {
          console.error(
            `Unexpected error fetching game info for ${matchId}:`,
            error,
          );
        }
        setFailedMatches((prev) => [...prev, matchId]);
      }
    },
    [puuid, region, dbChecked],
  );

  const { validGames, totalPages } = useMemo(() => {
    // Step 1: Apply comprehensive validation to each game
    const valid = games
      .filter((game, idx) => {
        // Basic structure validation
        if (!game || !game.data || !game.id) {
          console.log(`[Filter #${idx}] Skipping invalid game object:`, game);
          return false;
        }

        const { data } = game;

        // Essential data validation
        const hasEssentialData =
          data.info &&
          typeof data.info === "object" &&
          data.info.matchId &&
          Array.isArray(data.participants) &&
          data.participants.length > 0 &&
          Array.isArray(data.teams) &&
          data.teams.length > 0;

        if (!hasEssentialData) {
          console.debug(`Game ${game.id} failed essential data validation`);
          console.log(`[Filter #${idx}] Failed essential data check:`, game);
          return false;
        }

        // Validate game creation date for sorting
        const hasValidDate =
          data.info.gameCreation &&
          !isNaN(new Date(data.info.gameCreation).getTime());

        if (!hasValidDate) {
          console.debug(
            `Game ${game.id} has invalid gameCreation date: ${data.info.gameCreation}`,
          );
          console.log(
            `[Filter #${idx}] Game ${game.id} invalid 'gameCreation':`,
            data.info.gameCreation,
          );
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        try {
          const dateA = new Date(a.data!.info.gameCreation!).getTime();
          const dateB = new Date(b.data!.info.gameCreation!).getTime();
          // Log sort values
          console.log(
            `Sorting game ${a.id} (${dateA}) vs ${b.id} (${dateB}): result ${
              dateB - dateA
            }`,
          );
          return dateB - dateA; // Newest first
        } catch (error) {
          console.error("Error sorting games by date:", error);
          return 0; // Keep original order if sorting fails
        }
      });
    console.log(
      "useMemo: valid games computed:",
      valid.map((g) => g.id),
    );
    return {
      validGames: valid,
      totalPages: Math.ceil(valid.length / gamesPerPage),
    };
  }, [games, gamesPerPage]);

  const currentGames = useMemo(() => {
    const startIndex = (currentPage - 1) * gamesPerPage;
    const pageGames = validGames.slice(startIndex, startIndex + gamesPerPage);
    console.log(
      `Current page: ${currentPage}, Showing games:`,
      pageGames.map((g) => g.id),
    );
    return pageGames;
  }, [currentPage, validGames]);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 4;

    if (totalPages <= 1) {
      console.log("Only one page, returning [1]");
      return [1];
    }

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

    console.log("Pagination pages generated:", pages);
    return pages;
  }, [currentPage, totalPages]);

  if (isLoading && validGames.length === 0) {
    return (
      <div className="mt-5 text-center">
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
      <div className="mt-5 text-center">
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
    <div className={`py-1 flex justify-center items-center space-x-2`}>
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
          ),
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
    <div className="bg-gradient-to-b w-full from-[#121624] via-[#1B1F35] to-[#121624] shadow-sm shadow-[#2A2A40] border rounded-md border-gray-700/70 mt-4 max-w-2xl">
      <PaginationControls position="top" />
      <Suspense>
        {currentGames.map((game, index) => (
          <GameMatchCard
            key={index}
            game={game.data!}
            puuid={puuid}
            region={region}
            currentPage={currentPage}
            version={version}
          />
        ))}
      </Suspense>
      <PaginationControls position="bottom" />
    </div>
  );
};
export default MatchHistorySection;
