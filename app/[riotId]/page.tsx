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
  const [gameName, tagLine] = decodedRiotId.split("-");
  console.log("Parsed gameName and tagLine:", { gameName, tagLine });

  if (!gameName || !tagLine) {
    console.error("Error: Invalid riotId format");
    return notFound();
  }

  const account = await db.query.accounts.findFirst({
    where: and(eq(accounts.gameName, gameName), eq(accounts.tagLine, tagLine)),
  });

  if (!account) {
    console.error(
      `No account found for gameName: ${gameName}, tagLine: ${tagLine}`
    );
    return notFound();
  }

  const puuid = account.puuid;

  const REGION = getRegionalEndpoint(account.region);

  const matchHistory: string[] = await fetchAllMatchIds(puuid, account.region);
  return (
    <div className="relative z-10 min-h-screen p-4">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="animated-grid" />
      </div>
      <main className="relative z-10 w-full flex flex-col items-center justify-center">
        <UserCard accountData={account} region={REGION} />

        <div className="w-full flex flex-col md:flex-row h-full justify-center items-center md:items-start">
          <UserStats puuid={puuid} matchHistory={matchHistory} />

          <MatchHistorySection
            matchHistory={matchHistory}
            puuid={puuid}
            region={REGION}
          />
        </div>
      </main>
    </div>
  );
};
export default AccountPage;
