import { unstable_cache } from "next/cache";

const ONE_HOUR_SECONDS = 60 * 60;

async function fetchAccountByNameUncached(
  gameName: string,
  tagLine: string,
): Promise<DbSummonerInfo> {
  if (!gameName || !tagLine) throw new Error("Name required!");

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const url = `${BASE_URL}/api/account?gameName=${gameName}&tagLine=${tagLine}`;

  const accountRes = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!accountRes.ok) {
    throw new Error(
      `Fetching ${gameName}#${tagLine} account went wrong: ${accountRes.status} ${accountRes.statusText}`,
    );
  }

  const accountData: DbSummonerInfo = await accountRes.json();
  return accountData;
}

export const fetchAccountByName = unstable_cache(
  fetchAccountByNameUncached,
  ["fetch-account-by-name"],
  { revalidate: ONE_HOUR_SECONDS },
);
