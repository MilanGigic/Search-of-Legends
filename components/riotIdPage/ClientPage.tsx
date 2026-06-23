"use client";

import UserStats from "./overview/general/UserStats";
import MatchHistorySection from "./overview/general/MatchHistorySection";

type ClientPageProps = {
  accountData: DbSummonerInfo;
  region: string;
  matchHistory: string[];
  riotId: string;
  version: string; // now passed as a prop from the server, not read from the store
};

export default function ClientPage({
  accountData,
  region,
  matchHistory,
  riotId,
  version,
}: ClientPageProps) {
  const puuid = accountData.puuid; // derived directly from the prop, always correct on refresh

  return (
    <div className="relative z-10 min-h-screen p-4">
      <main className="relative z-10 w-full flex flex-col items-center justify-center">
        <div className="w-full flex flex-col md:flex-row h-full justify-center items-center md:items-start">
          <UserStats puuid={puuid} riotId={riotId} version={version} />

          <MatchHistorySection
            matchHistory={matchHistory}
            puuid={puuid}
            region={region}
            version={version}
          />
        </div>
      </main>
    </div>
  );
}
