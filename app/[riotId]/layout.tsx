import Sidebar from "@/components/AppSidebar";
import Header from "@/components/Header";
import UserCard from "@/components/UserCard";
import { notFound } from "next/navigation";
import { fetchAccountByName } from "@/actions/fetchAccountByName";
import { fetchLatestVersion } from "@/lib/riot";
import getRegionalEndpoint from "@/actions/match-history/getRegionalEndpoint";

export default async function RiotIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ riotId: string }>;
}) {
  const { riotId } = await params;
  const decodedRiotId = decodeURIComponent(riotId);
  const separator = decodedRiotId.lastIndexOf("-");

  if (separator === -1) return notFound();

  const gameName = decodedRiotId.slice(0, separator);
  const tagLine = decodedRiotId.slice(separator + 1);

  if (!gameName || !tagLine) return notFound();

  // Same cached function the page also calls (or will call) — within the
  // 1-hour window, this is a cache hit, not a duplicate Riot/DB round trip.
  const accountData = await fetchAccountByName(gameName, tagLine);

  if (!accountData?.region) return notFound();

  const region = getRegionalEndpoint(accountData.region);
  const version = await fetchLatestVersion();

  return (
    <>
      <Header showSearch={true} />
      <Sidebar />
      <div className="w-full flex flex-col sticky top-16 z-50">
        <UserCard
          accountData={accountData}
          region={region}
          riotId={riotId}
          version={version!}
        />
      </div>
      {children}
    </>
  );
}
