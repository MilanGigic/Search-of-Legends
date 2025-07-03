import MatchHistorySection from "@/components/overview/MatchHistorySection";
import UserCard from "@/components/UserCard";
import UserStats from "@/components/overview/UserStats";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import fetchAllMatchIds from "@/lib/actions/match-history/fetchMatchIds";
import getRegionalEndpoint from "@/lib/actions/match-history/getRegionalEndpoint";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface AccountPageProps {
  params: { riotId: string };
}

const AccountPage = async ({ params }: AccountPageProps) => {
  const { riotId } = await params;
  const decodedRiotId = decodeURIComponent(riotId);
  const separator = decodedRiotId.lastIndexOf("-");
  if (separator === -1) return notFound();
  const gameName = decodedRiotId.slice(0, separator);
  const tagLine = decodedRiotId.slice(separator + 1);
  console.log("Parsed gameName and tagLine:", { gameName, tagLine });

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
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/account?gameName=${gameName}&tagLine=${tagLine}`,
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

  return (
    <div className="relative z-10 min-h-screen p-4">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="animated-grid" />
      </div>
      <main className="relative z-10 w-full flex flex-col items-center justify-center">
        <UserCard accountData={accountData} region={REGION} />

        <div className="w-full flex flex-col md:flex-row h-full justify-center items-center md:items-start">
          <UserStats puuid={puuid} matchHistory={matchHistory} />

          <MatchHistorySection
            matchHistory={matchHistory}
            puuid={puuid!}
            region={REGION}
          />
        </div>
      </main>
    </div>
  );
};
export default AccountPage;
