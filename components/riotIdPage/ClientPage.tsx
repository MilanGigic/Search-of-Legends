"use client";

import { useDataStore } from "@/lib/store/useConstantDataStore";
import UserCard from "../UserCard";
import UserStats from "./overview/general/UserStats";
import MatchHistorySection from "./overview/general/MatchHistorySection";

type ClientPageProps = {
  accountData: DbSummonerInfo;
  region: string;
  matchHistory: string[];
  riotId: string;
  version: string;
};

export default function ClientPage({
  accountData,
  region,
  matchHistory,
  riotId,
  version,
}: ClientPageProps) {
  const puuid = accountData.puuid;
  return (
    <div className="relative z-10 min-h-screen p-4">
      <main className="relative z-10 w-full flex flex-col items-center justify-center">
        <div className="w-full flex flex-col sticky top-16 z-50">
          <UserCard
            accountData={accountData}
            region={region}
            riotId={riotId}
            version={version!}
          />
        </div>

        <div className="w-full flex flex-col md:flex-row h-full justify-center items-center md:items-start">
          <UserStats puuid={puuid} riotId={riotId} version={version} />

          <MatchHistorySection
            matchHistory={matchHistory}
            puuid={puuid!}
            region={region}
            version={version!}
          />
        </div>
      </main>
    </div>
  );
}
