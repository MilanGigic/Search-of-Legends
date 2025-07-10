import MatchHistorySection from "@/components/overview/MatchHistorySection";
import UserCard from "@/components/UserCard";
import UserStats from "@/components/overview/UserStats";
import { db } from "@/db";
import { accounts, matches } from "@/db/schema";
import fetchAllMatchIds from "@/lib/actions/match-history/fetchMatchIds";
import getRegionalEndpoint from "@/lib/actions/match-history/getRegionalEndpoint";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { headers } from "next/headers";
import { SlArrowUp } from "react-icons/sl";

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

  const fullUrl = headersList.get("x-url") || headersList.get("referer");
  fullUrl?.includes("/champions");
  return (
    <div className="relative z-10 min-h-screen p-4">
      <main className="relative z-10 w-full flex flex-col items-center justify-center">
        <div className="w-full flex flex-col ">
          <UserCard accountData={accountData} region={REGION} />
          <ul className="bg-gradient-to-b flex justify-center from-[#121624] gap-4 to-[#1B1F35]  border-b border-slate-400 container max-w-6xl mx-auto">
            <Link
              href={`/${riotId}`}
              className={`border-none bg-transparent w-[100px] ${
                fullUrl?.includes("/champions")
                  ? "text-gray-400"
                  : fullUrl?.includes("/live")
                  ? "text-gray-400"
                  : "text-slate-200"
              } h-[64px] px-2 text-center flex flex-col justify-between items-center rounded-b-none hover:text-slate-200`}
            >
              <span className="font-semibold text-lg mt-4">Overview</span>
              {fullUrl?.includes("/live") ? null : fullUrl?.includes(
                  "/champions"
                ) ? null : (
                <div className="border border-slate-400 rounded-t-md w-2/3 py-0.5 shadow-inner shadow-sky-500" />
              )}
            </Link>
            <Link
              href={`/${riotId}/champions`}
              className={`border-none bg-transparent px-2 w-[100px] h-[64px] ${
                fullUrl?.includes("/live") ? "text-slate-200" : "text-gray-400"
              } text-center flex flex-col justify-between items-center rounded-b-none hover:text-slate-200`}
            >
              <span className="font-semibold text-lg mt-4">Champions</span>
              {fullUrl?.includes("/champions") && (
                <div className="border border-slate-400 rounded-t-md w-2/3 py-0.5 shadow-inner shadow-sky-500" />
              )}
            </Link>
            <Link
              href={`/${riotId}/live`}
              className={`border-none bg-transparent px-2 h-[64px] w-[70px] text-center flex flex-col justify-between items-center rounded-b-none ${
                fullUrl?.includes("/live") ? "text-slate-200" : "text-gray-400"
              } hover:text-slate-200`}
            >
              <span className="font-semibold text-lg mt-4">Live</span>
              {fullUrl?.includes("/live") && (
                <div className="border border-slate-400 rounded-t-md w-2/3 py-0.5 shadow-inner shadow-sky-500" />
              )}
            </Link>
          </ul>
        </div>

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
