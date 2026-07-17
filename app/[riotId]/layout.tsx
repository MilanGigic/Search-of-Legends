import Sidebar from "@/components/AppSidebar";
import Header from "@/components/Header";
import UserCard from "@/components/UserCard";
import { notFound } from "next/navigation";
import { fetchAccountByName } from "@/actions/fetchAccountByName";
import getRegionalEndpoint from "@/actions/match-history/getRegionalEndpoint";
import { Suspense } from "react";

export default function RiotIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ riotId: string }>;
}) {
  return (
    <>
      <Header showSearch={true} />
      <Sidebar />
      <div className="w-full flex flex-col sticky top-16 z-50">
        <Suspense fallback={<div className="h-24" />}>
          <UserCardSection params={params} />
        </Suspense>
      </div>
      {children}
    </>
  );
}

async function UserCardSection({
  params,
}: {
  params: Promise<{ riotId: string }>;
}) {
  const { riotId } = await params;
  const decodedRiotId = decodeURIComponent(riotId);
  const separator = decodedRiotId.lastIndexOf("-");
  if (separator === -1) return notFound();

  const gameName = decodedRiotId.slice(0, separator);
  const tagLine = decodedRiotId.slice(separator + 1);
  if (!gameName || !tagLine) return notFound();

  const accountData = await fetchAccountByName(gameName, tagLine);
  if (!accountData?.region) return notFound();

  const region = getRegionalEndpoint(accountData.region);

  return <UserCard accountData={accountData} region={region} riotId={riotId} />;
}
