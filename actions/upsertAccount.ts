import { db } from "@/db";
import getRegionalEndpoint from "./match-history/getRegionalEndpoint";
import { accounts } from "@/db/schema";
import { sql } from "drizzle-orm";

interface UpsertAccountResult {
  puuid: string;
  skipped: boolean;
}

export async function upsertAccount(
  puuid: string,
  region: string,
): Promise<UpsertAccountResult> {
  const regionalEndpoint = getRegionalEndpoint(region);

  const accountRes = await fetch(
    `https://${regionalEndpoint}.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}?api_key=${process.env.RIOT_API_KEY}`,
  );
  if (!accountRes.ok) {
    throw new Error(
      `upsertAccount: account fetch failed for ${puuid} (${region}): ${accountRes.status}`,
    );
  }

  const summonerRes = await fetch(
    `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${process.env.RIOT_API_KEY}`,
  );
  if (!summonerRes.ok) {
    throw new Error(
      `upsertAccount: summoner fetch failed for ${puuid} (${region}): ${summonerRes.status}`,
    );
  }

  const accountData: AccountData = await accountRes.json();
  const summonerData: SummonerInfo = await summonerRes.json();

  await db
    .insert(accounts)
    .values({
      puuid,
      gameName: accountData.gameName,
      tagLine: accountData.tagLine,
      region,
      summonerLevel: summonerData.summonerLevel,
      profileIconId: summonerData.profileIconId,
      revisionDate: summonerData.revisionDate,
    })
    .onConflictDoUpdate({
      target: accounts.puuid,
      set: {
        gameName: accountData.gameName,
        tagLine: accountData.tagLine,
        summonerLevel: summonerData.summonerLevel,
        profileIconId: summonerData.profileIconId,
        revisionDate: summonerData.revisionDate,
      },
      // Only update if Riot reports a newer revisionDate
      setWhere: sql`excluded.revision_date > accounts.revision_date`,
    });

  return { puuid, skipped: false };
}
