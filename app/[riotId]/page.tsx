import AccountPageClient from "@/components/AccountPageClient";

interface AccountPageProps {
  params: { riotId: string };
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const AccountPage = async ({ params }: AccountPageProps) => {
  const { riotId } = await params;

  // Validate input
  const [gameName, tagLine] = riotId.split("-");

  if (!gameName || !tagLine) {
    return <div>Invalid Riot ID format</div>;
  }

  return <AccountPageClient riotId={riotId} />;
};

export default AccountPage;
