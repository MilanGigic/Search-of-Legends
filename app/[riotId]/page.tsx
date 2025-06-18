import MatchHistorySection from "@/components/MatchHistorySection";
import UserCard from "@/components/UserCard";
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
    <div className="bg-[#1E1E2F] min-h-screen p-4 bg-pattern">
      <UserCard accountData={account} region={REGION} />
      <div className="h-full w-full">
        <MatchHistorySection
          matchHistory={matchHistory}
          puuid={puuid}
          region={REGION}
        />
      </div>
    </div>
  );
};
export default AccountPage;
