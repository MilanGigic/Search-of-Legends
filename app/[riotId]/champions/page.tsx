import UserCard from "@/components/UserCard";
import { AccountPageProps } from "../page";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { accounts } from "@/db/schema";
import getRegionalEndpoint from "@/lib/actions/match-history/getRegionalEndpoint";
import { getChampionPerformance } from "@/lib/actions/getChampionPerformance";
import Image from "next/image";
import ChampionStatsClient from "@/components/champions/ChampionStatsClient";

const ChampionsPage = async ({ params }: AccountPageProps) => {
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

  const champions = await getChampionPerformance(puuid);

  const fullUrl = headersList.get("x-url") || headersList.get("referer");
  return (
    <div className="relative z-10 min-h-screen p-4 text-slate-300">
      <UserCard
        accountData={accountData}
        region={REGION}
        riotId={riotId}
        fullUrl={fullUrl!}
      />
      <div className="pt-5 border border-gray-700/70 sm:mt-3 max-w-5xl mx-auto rounded-md flex flex-col gap-1 bg-gradient-to-b from-[#121624] to-[#1B1F35]  shadow-sm shadow-[#2A2A40]">
        <ChampionStatsClient champions={champions} />
      </div>
    </div>
  );
};
export default ChampionsPage;
