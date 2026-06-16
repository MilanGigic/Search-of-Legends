"use server";

import { db } from "@/db";
import getRegionalEndpoint from "./match-history/getRegionalEndpoint";
import "dotenv";
import { eq } from "drizzle-orm";
import { accounts } from "@/db/schema";

export async function fetchAccount(puuid: string, region: string) {
  if (!puuid || !region) {
    throw new Error("Both PUUID and Region required!");
  }

  const regionalEndpoint = getRegionalEndpoint(region);

  try {
    const existingAccount = await db.query.accounts.findFirst({
      where: eq(accounts.puuid, puuid),
    });

    if (existingAccount) {
      return existingAccount;
    }
    const accountRes = await fetch(
      `https://${regionalEndpoint}.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}?api_key=${process.env.RIOT_API_KEY}`,
    );

    if (!accountRes.ok) {
      throw new Error(`Failed to fetch account for ${puuid}`);
    }

    const accountData: AccountData = await accountRes.json();

    const summonerRes = await fetch(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${process.env.RIOT_API_KEY}`,
    );

    if (!summonerRes.ok) {
      throw new Error(`Failed to fetch summoner for ${puuid}`);
    }

    const summonerData: SummonerInfo = await summonerRes.json();

    return {
      puuid: accountData.puuid,
      gameName: accountData.gameName,
      tagLine: accountData.tagLine,
      region,

      summonerLevel: summonerData.summonerLevel,
      profileIconId: summonerData.profileIconId,
      revisionDate: summonerData.revisionDate,
    };
  } catch (error) {
    throw new Error("Something went wrong while fetching account");
  }
}
