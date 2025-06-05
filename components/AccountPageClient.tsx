"use client";

import { useEffect, useState } from "react";
import { useMatchHistory } from "@/lib/hooks/useMatchHistoryHook"; // Adjust path as needed

interface AccountPageProps {
  params: { riotId: string };
}

interface Account {
  puuid: string;
  gameName: string;
  tagLine: string;
  // Add other account properties
}

const AccountPageClient = ({ riotId }: { riotId: string }) => {
  const [account, setAccount] = useState<Account | null>(null);
  const [accountLoading, setAccountLoading] = useState(true);
  const [accountError, setAccountError] = useState<string | null>(null);

  const {
    matches,
    loading: matchesLoading,
    error: matchesError,
    hasMore,
    totalMatches,
    loadedCount,
    loadMoreMatches,
  } = useMatchHistory(account?.puuid || null);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  // Load account data
  useEffect(() => {
    const loadAccount = async () => {
      try {
        const [gameName, tagLine] = riotId.split("-");

        const response = await fetch(
          `${BASE_URL}/api/account?gameName=${gameName}&tagLine=${tagLine}`
        );

        if (!response.ok) {
          throw new Error("Account not found");
        }

        const accountData = await response.json();
        setAccount(accountData);
      } catch (err) {
        setAccountError(
          err instanceof Error ? err.message : "Failed to load account"
        );
      } finally {
        setAccountLoading(false);
      }
    };

    loadAccount();
  }, [riotId]);

  if (accountLoading) {
    return <div className="p-4">Loading account...</div>;
  }

  if (accountError || !account) {
    return (
      <div className="p-4 text-red-500">
        Error: {accountError || "Account not found"}
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Account Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {account.gameName}#{account.tagLine}
        </h1>
      </div>

      {/* Match History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Match History</h2>

          {totalMatches > 0 && (
            <div className="text-sm text-gray-600">
              Showing {loadedCount} of {totalMatches} matches
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        {matchesLoading && loadedCount === 0 && (
          <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span>Loading match history...</span>
          </div>
        )}

        {/* Match List */}
        <div className="space-y-2">
          {matches.map((match, index) => (
            <div
              key={match.matchId}
              className="p-4 border rounded-lg bg-white shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Match #{index + 1}</span>
                <span className="text-sm text-gray-500">{match.matchId}</span>
              </div>
              {/* Add more match details here */}
            </div>
          ))}
        </div>

        {/* Loading More Indicator */}
        {matchesLoading && loadedCount > 0 && (
          <div className="flex items-center justify-center space-x-2 p-4">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span>Loading more matches...</span>
          </div>
        )}

        {/* Load More Button */}
        {!matchesLoading && hasMore && (
          <div className="flex justify-center">
            <button
              onClick={loadMoreMatches}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Load More Matches
            </button>
          </div>
        )}

        {/* No More Matches */}
        {!hasMore && matches.length > 0 && (
          <div className="text-center text-gray-500 py-4">
            All matches loaded ({loadedCount} total)
          </div>
        )}

        {/* Error State */}
        {matchesError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">
              Error loading matches: {matchesError}
            </p>
            <button
              onClick={loadMoreMatches}
              className="mt-2 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default AccountPageClient;
