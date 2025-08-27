import MatchHistorySection from "@/components/overview/MatchHistorySection";
import UserCard from "@/components/UserCard";
import UserStats from "@/components/overview/UserStats";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import fetchAllMatchIds from "@/lib/actions/match-history/fetchMatchIds";
import getRegionalEndpoint from "@/lib/actions/match-history/getRegionalEndpoint";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { fetchLatestVersion } from "@/lib/riot";

interface AccountPageProps {
  params: Promise<{ riotId: string }>; // params is now a Promise
}

const AccountPage = async ({ params }: AccountPageProps) => {
  const { riotId } = await params;
  const decodedRiotId = decodeURIComponent(riotId);
  const separator = decodedRiotId.lastIndexOf("-");
  if (separator === -1) return notFound();
  const gameName = decodedRiotId.slice(0, separator);
  const tagLine = decodedRiotId.slice(separator + 1);
  console.log("Parsed gameName and tagLine:", { gameName, tagLine });
  const headersList = await headers();

  if (!gameName || !tagLine) {
    console.error("Error: Invalid riotId format");
    return notFound();
  }

  const existingAccount = await db.query.accounts.findFirst({
    where: and(eq(accounts.gameName, gameName), eq(accounts.tagLine, tagLine)),
  });

  let account: DbSummonerInfo | null = null;

  if (!existingAccount) {
    const accountRes = await fetch(
      `/api/account?gameName=${gameName}&tagLine=${tagLine}`,
      { headers: { "Content-Type": "application/json" } }
    );

    if (!accountRes.ok) {
      console.error("Failed to fetch account data:", accountRes.statusText);
      return notFound();
    }

    account = await accountRes.json();
  }

  const accountData = existingAccount ?? account!;

  if (!accountData?.region) {
    console.error("Missing region for account:", accountData);
    return notFound();
  }
  const puuid = accountData.puuid;
  const REGION = getRegionalEndpoint(accountData.region);

  const matchHistory: string[] = await fetchAllMatchIds(
    puuid,
    accountData.region
  );

  const fullUrl = headersList.get("x-url") || headersList.get("referer");

  const version = await fetchLatestVersion();
  console.log("Version:", version);
  return (
    <div className="relative z-10 min-h-screen p-4">
      <main className="relative z-10 w-full flex flex-col items-center justify-center">
        <div className="w-full flex flex-col">
          <UserCard
            accountData={accountData}
            region={REGION}
            riotId={riotId}
            fullUrl={fullUrl!}
            version={version!}
          />
        </div>

        <div className="w-full flex flex-col md:flex-row h-full justify-center items-center md:items-start">
          <UserStats puuid={puuid} riotId={riotId} />

          <MatchHistorySection
            matchHistory={matchHistory}
            puuid={puuid!}
            region={REGION}
            version={version!}
          />
        </div>
      </main>
    </div>
  );
};
export default AccountPage;
