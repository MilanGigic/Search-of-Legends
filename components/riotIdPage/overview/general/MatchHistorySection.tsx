"use client";

import pLimit from "p-limit";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import GameMatchCard from "./GameMatchCard";
import checkDbGames from "@/actions/checkDbGames";
import { createRiotRateLimiter } from "@/actions/rateLimiter";

const GAMES_PER_PAGE = 9;
const FETCH_CONCURRENCY = 3; // tune to Riot's effective rate limit
const FETCH_TIMEOUT_MS = 10_000;
const RATE_LIMIT_BACKOFF_MS = 2 * 60 * 1000;

type LoadedGame = { id: string; data: DbGameInfo };

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

function isStructurallyValid(
  data: unknown,
  matchId: string,
): data is DbGameInfo {
  if (!data || typeof data !== "object") return false;
  const d = data as DbGameInfo;

  const hasInfo = !!d.info && typeof d.info === "object";
  const hasParticipants =
    Array.isArray(d.participants) && d.participants.length > 0;
  const hasTeams = Array.isArray(d.teams) && d.teams.length > 0;
  const matchIdMatches = d.info?.matchId === matchId;
  const hasGameCreation =
    d.info?.gameCreation !== undefined && d.info?.gameCreation !== null;

  return (
    hasInfo && hasParticipants && hasTeams && matchIdMatches && hasGameCreation
  );
}

function isRenderable(game: LoadedGame): boolean {
  if (!game?.data || !game.id) return false;
  const { data } = game;

  const hasEssentialData =
    !!data.info &&
    typeof data.info === "object" &&
    !!data.info.matchId &&
    Array.isArray(data.participants) &&
    data.participants.length > 0 &&
    Array.isArray(data.teams) &&
    data.teams.length > 0;

  if (!hasEssentialData) return false;

  return !isNaN(new Date(data.info.gameCreation!).getTime());
}

function buildPageNumbers(
  currentPage: number,
  totalPages: number,
): (number | "...")[] {
  if (totalPages <= 1) return [1];

  const pages: (number | "...")[] = [1];

  if (currentPage > 3) pages.push("...");

  const startPage = Math.max(2, currentPage - 2);
  const endPage = Math.min(totalPages - 1, currentPage + 2);
  for (let i = startPage; i <= endPage; i++) pages.push(i);

  if (currentPage + 4 < totalPages) pages.push("...");
  if (totalPages > 1) pages.push(totalPages);

  return pages;
}

function PaginationControls({
  position,
  currentPage,
  totalPages,
  pageNumbers,
  onPageChange,
}: {
  position: "top" | "bottom";
  currentPage: number;
  totalPages: number;
  pageNumbers: (number | "...")[];
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="py-1 flex justify-center items-center space-x-2">
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
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
              onClick={() => onPageChange(page)}
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
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-gray-700 hover:bg-gray-700/50 disabled:hover:bg-gray-700 transition-colors duration-100 text-white rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}

const MatchHistorySection = ({
  matchHistory,
  puuid,
  region,
  version,
}: {
  matchHistory: string[];
  puuid: string;
  region: string;
  version: string;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [games, setGames] = useState<LoadedGame[]>([]);
  const [failedMatches, setFailedMatches] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dbChecked, setDbChecked] = useState<boolean>(false);

  const riotRateLimiter = useRef(createRiotRateLimiter()).current;

  const loadedIds = useRef<Set<string>>(new Set());

  const matchHistoryKey = useMemo(() => matchHistory.join(","), [matchHistory]);

  const markFailed = useCallback((matchId: string) => {
    setFailedMatches((prev) => {
      if (prev.has(matchId)) return prev;
      const next = new Set(prev);

      next.add(matchId);
      return next;
    });
  }, []);

  const fetchGameInfo = useCallback(
    async (matchId: string) => {
      if (
        !matchId ||
        typeof matchId !== "string" ||
        matchId.trim().length === 0
      ) {
        console.error(`Invalid matchId provided: ${matchId}`);
        markFailed(matchId || "unknown");
        return;
      }

      if (!region || !puuid) {
        markFailed(matchId);
        return;
      }
      if (loadedIds.current.has(matchId)) return;

      await riotRateLimiter();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const res = await fetch(
          `/api/game-info?gameId=${matchId}&region=${region}&puuid=${puuid}`,
          { signal: controller.signal },
        );

        if (res.status === 429) {
          markFailed(matchId);
          await new Promise((r) => setTimeout(r, RATE_LIMIT_BACKOFF_MS));
          return;
        }

        if (!res.ok) {
          console.error(
            `HTTP error fetching game info for ${matchId}: ${res.status} ${res.statusText}`,
          );
          markFailed(matchId);
          return;
        }

        let data: DbGameInfo;
        try {
          data = await res.json();
        } catch (parseError) {
          console.error(`JSON parse error for match ${matchId}:`, parseError);
          markFailed(matchId);
          return;
        }

        // Step 4: Comprehensive data structure validation
        if (!isStructurallyValid(data, matchId)) {
          console.warn(`Invalid data object for match ${matchId}:`, data);
          markFailed(matchId);
          return;
        }

        loadedIds.current.add(matchId);
        setGames((prev) => [...prev, { id: matchId, data }]);
      } catch (error) {
        if (controller.signal.aborted) {
          console.error(`Request timeout for match ${matchId}`);
        } else {
          console.error(`Error fetching match ${matchId}:`, error);
        }
        markFailed(matchId);
      } finally {
        clearTimeout(timeoutId);
      }
    },
    [puuid, region, riotRateLimiter, markFailed],
  );

  useEffect(() => {
    let cancelled = false;
    loadedIds.current = new Set();
    setGames([]);
    setFailedMatches(new Set());
    setDbChecked(false);
    setIsLoading(false);

    (async () => {
      try {
        const cached = await checkDbGames(matchHistory);
        if (cancelled) return;

        const cachedGames: LoadedGame[] = (cached ?? [])
          .filter((g) => isStructurallyValid(g.data, g.matchId))
          .map((g) => ({ id: g.matchId, data: g.data }));

        cachedGames.forEach((g) => loadedIds.current.add(g.id));
        setGames(cachedGames);
        setDbChecked(true);

        const remaining = matchHistory.filter(
          (id) => !loadedIds.current.has(id),
        );

        if (remaining.length === 0) {
          setIsLoading(false);
          return;
        }

        const limit = pLimit(FETCH_CONCURRENCY);
        await Promise.all(
          remaining.map((matchId) =>
            limit(() => (cancelled ? null : fetchGameInfo(matchId))),
          ),
        );
      } catch (error) {
        console.error("Failed to check DB cache for matches:", error);
        setDbChecked(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [matchHistoryKey, puuid, region]);

  const { validGames, totalPages } = useMemo(() => {
    const valid = games
      .filter(isRenderable)
      .sort(
        (a, b) =>
          new Date(b.data.info.gameCreation!).getTime() -
          new Date(a.data.info.gameCreation!).getTime(),
      );

    return {
      validGames: valid,
      totalPages: Math.ceil(valid.length / GAMES_PER_PAGE),
    };
  }, [games]);

  const currentGames = useMemo(() => {
    const start = (currentPage - 1) * GAMES_PER_PAGE;
    return validGames.slice(start, start + GAMES_PER_PAGE);
  }, [currentPage, validGames]);

  const pageNumbers = useMemo(
    () => buildPageNumbers(currentPage, totalPages),
    [currentPage, totalPages],
  );

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
          {failedMatches.size === matchHistory.length
            ? "Failed to load matches"
            : "No valid matches found"}
        </div>
        {failedMatches.size > 0 && (
          <div className="text-red-400 mt-2">
            Failed to load {failedMatches.size} matches
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b w-full from-[#121624] via-[#1B1F35] to-[#121624] shadow-sm shadow-[#2A2A40] border rounded-md border-gray-700/70 mt-4 max-w-2xl">
      <PaginationControls
        position="top"
        currentPage={currentPage}
        totalPages={totalPages}
        pageNumbers={pageNumbers}
        onPageChange={setCurrentPage}
      />
      <Suspense>
        {currentGames.map((game) => (
          <GameMatchCard
            key={game.id}
            game={game.data}
            puuid={puuid}
            region={region}
            currentPage={currentPage}
            version={version}
          />
        ))}
      </Suspense>
      <PaginationControls
        position="bottom"
        currentPage={currentPage}
        totalPages={totalPages}
        pageNumbers={pageNumbers}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};
export default MatchHistorySection;
