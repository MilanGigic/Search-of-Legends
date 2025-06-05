import { db } from "@/db";
import { accounts } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface AccountPageProps {
  params: { riotId: string };
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const AccountPage = async ({ params }: AccountPageProps) => {
  const { riotId } = await params;
  // Validate input
  const [gameName, tagLine] = riotId.split("-");
  console.log("Parsed gameName and tagLine:", { gameName, tagLine });

  if (!gameName || !tagLine) {
    console.error("Error: Invalid riotId format");
    return notFound();
  }

  const account = await db.query.accounts.findFirst({
    where: and(eq(accounts.gameName, gameName), eq(accounts.tagLine, tagLine)),
  });

  if (!account) {
    console.error("Error: Account not found in database");
    return notFound();
  }

  const gameInfo = await fetch(`${BASE_URL}/api/match?puuid=${account.puuid}`);
  console.log("Game info:", gameInfo);
  return <div>AccountPage</div>;
};
export default AccountPage;
