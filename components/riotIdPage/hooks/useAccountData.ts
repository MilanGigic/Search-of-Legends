"use client";

import { useRefreshStore } from "@/lib/store/useRefreshStore";
import { useEffect, useState } from "react";

export function useAccountData<T>(
  puuid: string,
  fetcher: (puuid: string) => Promise<T>,
) {
  const refreshToken = useRefreshStore((state) => state.token);
  const [result, setResult] = useState<{ puuid: string; data: T } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);

    fetcher(puuid)
      .then((data) => {
        if (!cancelled) setResult({ puuid, data });
      })
      .catch((err) => {
        console.error("[useAccountData] fetch failed:", err);
        if (!cancelled) setError("Failed to load data.");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puuid, refreshToken]);

  const data = result?.puuid === puuid ? result.data : null;

  return { data, error, isLoading: data === null && error === null };
}
