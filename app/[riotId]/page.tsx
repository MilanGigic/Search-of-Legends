"use server";

import fetchAllMatchIds from "@/actions/match-history/fetchMatchIds";
import getRegionalEndpoint from "@/actions/match-history/getRegionalEndpoint";
import { notFound } from "next/navigation";
import { fetchAccountByName } from "@/actions/fetchAccountByName";
import ClientPage from "@/components/riotIdPage/ClientPage";
import { fetchLatestVersion } from "@/lib/riot";

interface AccountPageProps {
  params: Promise<{ riotId: string; page: string }>;
  searchParams: Promise<{ page: string }>;
}

const AccountPage = async ({ params, searchParams }: AccountPageProps) => {
  const { riotId } = await params;
  const { page } = await searchParams;
  const decodedRiotId = decodeURIComponent(riotId);
  const separator = decodedRiotId.lastIndexOf("-");
  if (separator === -1) {
    return notFound();
  }
  const gameName = decodedRiotId.slice(0, separator);
  const tagLine = decodedRiotId.slice(separator + 1);

  if (!gameName || !tagLine) {
    return notFound();
  }

  const accountData = await fetchAccountByName(gameName, tagLine);

  const REGION = getRegionalEndpoint(accountData.region);

  if (!accountData?.region) {
    return notFound();
  }
  const matchHistory = await fetchAllMatchIds(
    accountData.puuid,
    accountData.region,
    page,
  );

  const version = await fetchLatestVersion();

  if (!version) throw new Error("No version found");

  return (
    <ClientPage
      matchHistory={matchHistory}
      accountData={accountData}
      region={REGION}
      riotId={riotId}
      version={version}
    />
  );
};
export default AccountPage;
