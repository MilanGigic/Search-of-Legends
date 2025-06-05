"use client";

import { useState, useCallback, useEffect } from "react";

interface MatchDetails {
  matchId: string;
  gameCreation: string;
  gameDuration: string;
  gameEndTimestamp?: Date;
  gameMode: string;
  gameType: string;
  gameVersion?: string;
  mapId?: number;
  platformId?: string;
  queueId: number;
  tournamentCode?: string;
  createdAt?: Date;
}

interface MatchBatchResponse {
  matchDetails: MatchDetails[];
  hasMore: boolean;
  totalMatches: number;
  currentBatch: {
    start: number;
    count: number;
    requested: number;
  };
}

interface UseMatchHistoryReturn {
  matches: MatchDetails[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalMatches: number;
  loadedCount: number;
  loadMoreMatches: () => Promise<void>;
  resetMatches: () => void;
}

export const useMatchHistory = (
  puuid: string | null
): UseMatchHistoryReturn => {
  const [matches, setMatches] = useState<MatchDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalMatches, setTotalMatches] = useState(0);

  const resetMatches = useCallback(() => {
    setMatches([]);
    setError(null);
    setHasMore(true);
    setTotalMatches(0);
  }, []);

  const loadMoreMatches = useCallback(async () => {
    if (!puuid || loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const start = matches.length;
      const count = 20;

      const response = await fetch(
        `/api/match?puuid=${puuid}&start=${start}&count=${count}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MatchBatchResponse = await response.json();

      setMatches((prev) => [...prev, ...data.matchDetails]);
      setHasMore(data.hasMore);
      setTotalMatches(data.totalMatches);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load matches");
      console.error("Error loading matches:", err);
    } finally {
      setLoading(false);
    }
  }, [puuid, matches.length, loading, hasMore]);

  // Auto-load first batch when puuid changes
  useEffect(() => {
    if (puuid && matches.length === 0 && !loading) {
      loadMoreMatches();
    }
  }, [puuid, matches.length, loading, loadMoreMatches]);

  return {
    matches,
    loading,
    error,
    hasMore,
    totalMatches,
    loadedCount: matches.length,
    loadMoreMatches,
    resetMatches,
  };
};
