import ChampionPageClient from "@/components/champions-page/ChampionPageClient";
import { db } from "@/db";
import { champions } from "@/db/schema";
import calculateTier from "@/lib/actions/calculateTier";
import { getCompletedChampionName } from "@/lib/actions/getCompletedChampionName";
import { getMostBannedChampions } from "@/lib/actions/getMostBannedChampions";
import { getTopTenChampions } from "@/lib/actions/getTopTenChampions";
import { fetchLatestVersion } from "@/lib/riot";
import { eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";

const ChampionsPage = async () => {
  const top10Champions = await getTopTenChampions();
  const mostBannedData = await getMostBannedChampions();
  const dbMatches = await db.query.matches.findMany();


  const top5 = top10Champions
    .sort((a, b) => Number(b.gamesPlayed) - Number(a.gamesPlayed))
    .slice(0, 5);



  const mostBannedStats = mostBannedData.championStats; // Array of all champion stats
  const mostBannedChampions = mostBannedData.banStats; // Original ban data

  const tieredMostBannedChampions = calculateTier(
    mostBannedStats,
    dbMatches.length
  );

  // Get top 5 most banned champions with their tier info
  const mostBannedTop5WithTiers = tieredMostBannedChampions
    .sort((a, b) => b.bans - a.bans) // Sort by ban count
    .slice(0, 6);

  const highestWinrateTop5 = top10Champions
    .filter((champ) => champ.gamesPlayed >= 10) // Filter to ensure a minimum number of games played
    .sort((a, b) => b.wins / b.gamesPlayed - a.wins / a.gamesPlayed) // Sort by winrate
    .slice(0, 5);

  const version = await fetchLatestVersion();

  return (
    <div className="flex flex-col min-h-screen items-center text-slate-300">
      <div className="container max-w-6xl z-10 mx-auto bg-gradient-to-b text-slate-300 from-[#121624] to-[#1B1F35] border-b border-slate-400 shadow-[#2A2A40] px-6 sm:px-4 py-4">
        <div className="flex flex-col items-center">
          <h1 className="flex flex-col items-center font-semibold">
            Most Played Champions
          </h1>
          <div className="flex gap-4 bg-white/5 p-4 rounded-md border border-gray-700 shadow-md shadow-[#3b3b42]">
            <ul className="grid grid-rows-5">
              <li className="row-span-2"></li>
              <li className="text-center">Pickrate</li>
              <li className="text-center">Tier</li>
              <li className="text-center">Winrate</li>
            </ul>
            {top5?.map(async (champion, index) => {
              const completedName = getCompletedChampionName(
                champion.championName
              );

              const tier = calculateTier(top5, dbMatches.length);


              const champTier = tier.find(
                (t) => t.championId === champion.championId
              );



              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center px-2"
                >
                  <Link href={`/champions/${completedName}`}>
                    <Image
                      src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${completedName}.png`}
                      alt={champion.championName}
                      width={100}
                      height={100}
                      className="rounded-full w-[50px] h-[50px]"
                    />
                  </Link>
                  <h1>
                    {((champion.gamesPlayed / dbMatches.length) * 10).toFixed(
                      1
                    )}
                    <span className="text-gray-400 text-sm">%</span>
                  </h1>
                  <h1>{champTier?.tier}</h1>
                  <h1>
                    {((champion.wins / champion.gamesPlayed) * 100).toFixed(1)}
                  </h1>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-col items-center">
            <h1 className="flex flex-col items-center font-semibold py-2">
              Most Banned Champions
            </h1>
            <div className="flex gap-4 bg-white/5 p-4 rounded-md border border-gray-700 shadow-md shadow-[#3b3b42]">
              <ul className="grid grid-rows-5">
                <li className="row-span-2"></li>
                <li className="text-center">Banrate</li>
                <li className="text-center">Tier</li>
                <li className="text-center">Winrate</li>
              </ul>
              {mostBannedTop5WithTiers?.map(async (champion, index) => {
                const dbChampion = await db.query.champions.findFirst({
                  where: eq(champions.key, String(champion.championId)),
                });

                if (!dbChampion) return null;
                const completedName = getCompletedChampionName(dbChampion.name);


                // const tier = calculateTier(
                //   champion.champStats!,
                //   dbMatches.length
                // );
                // console.log("Top 10 champions Completed name:", completedName);

                // const champTier = tier.find(
                //   (t) => t.championId === champion.championId
                // );
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center px-2"
                  >
                    <Link href={`/champions/${completedName}`}>
                      <Image
                        src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${completedName}.png`}
                        alt={champion.championId!.toString()}
                        width={100}
                        height={100}
                        className="rounded-full w-[50px] h-[50px]"
                      />
                    </Link>
                    <h1>
                      {((champion.bans / dbMatches.length) * 10).toFixed(1)}
                      <span className="text-gray-400 text-sm">%</span>
                    </h1>
                    <h1>{champion.tier}</h1>
                    <h1>
                      {((champion.wins / champion.gamesPlayed) * 100).toFixed(
                        1
                      )}
                      <span className="text-gray-400 text-sm">%</span>
                    </h1>
                  </div>
                );
              })}
            </div>
          </div>
          <h1 className="flex flex-col justify-center items-center text-center font-bold text-lg">
            Patch <br />({version})
          </h1>
          <div className="flex flex-col items-center">
            <h1 className="flex flex-col py-2 items-center font-semibold">
              Highest Winrate Champions
            </h1>
            <div className="flex gap-4 bg-white/5 p-4 rounded-md border border-gray-700 shadow-md shadow-[#3b3b42]">
              <ul className="grid grid-rows-5">
                <li className="row-span-2"></li>
                <li className="text-center">Winrate</li>
                <li className="text-center">Tier</li>
                <li className="text-center">KDA</li>
              </ul>
              {highestWinrateTop5?.map((champion, index) => {
                const completedName = getCompletedChampionName(
                  champion.championName
                );
                const tier = calculateTier(
                  highestWinrateTop5,
                  dbMatches.length
                );


                const champTier = tier.find(
                  (t) => t.championId === champion.championId
                );

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center px-2"
                  >
                    <Link href={`/champions/${completedName}`}>
                      <Image
                        src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${completedName}.png`}
                        alt={champion.championName}
                        width={100}
                        height={100}
                        className="rounded-full w-[50px] h-[50px]"
                      />
                    </Link>
                    <h1>
                      {((champion.wins / champion.gamesPlayed) * 100).toFixed(
                        2
                      )}
                      <span className="text-gray-400 text-sm">%</span>
                    </h1>
                    <h1>{champTier?.tier}</h1>
                    <h1>{champion.kda}</h1>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <ChampionPageClient version={version!} />
    </div>
  );
};
export default ChampionsPage;

// TODO:
// Implement the action for getting the completed name of the champion
// Implement the UI for displaying the top 10 champions with their images and counts
// Style the top 10 champions section to match the overall design of the page
// Ensure responsiveness and accessibility for the top 10 champions section
// Test the functionality to ensure it works as expected across different devices and browsers
