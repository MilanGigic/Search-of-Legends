import fetchAllMatchIds from "@/actions/match-history/fetchMatchIds";
import getRegionalEndpoint from "@/actions/match-history/getRegionalEndpoint";
import { notFound } from "next/navigation";
import { fetchAccountByName } from "@/actions/fetchAccountByName";
import { fetchLatestVersion } from "@/lib/riot";
import ClientPage from "@/components/riotIdPage/ClientPage";

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

  // Same cached call the layout already made — within the cache window
  // this resolves from cache rather than refetching live.
  const accountData = await fetchAccountByName(gameName, tagLine);

  if (!accountData?.region) {
    return notFound();
  }

  const REGION = getRegionalEndpoint(accountData.region);
  const [matchHistory, version] = await Promise.all([
    fetchAllMatchIds(accountData.puuid, accountData.region, page ?? "1"),
    fetchLatestVersion(),
  ]);

  return (
    <ClientPage
      matchHistory={matchHistory}
      accountData={accountData}
      region={REGION}
      riotId={riotId}
      version={version!}
    />
  );
};

export default AccountPage;
