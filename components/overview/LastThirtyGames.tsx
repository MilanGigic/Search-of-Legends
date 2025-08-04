import { db } from "@/db";
import { champions, matchParticipants, matches } from "@/db/schema";
import { fetchLatestVersion, kda } from "@/lib/riot";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import Image from "next/image";
import WinrateGauge from "../WinrateGauge";

const LastThirtyGames = async ({ puuid }: { puuid: string }) => {
  // Step 1: Get the last 30 match IDs for this player
  const last30MatchIds = await db
    .select({ matchId: matches.matchId })
    .from(matches)
    .where(eq(matches.puuid, puuid))
    .orderBy(desc(matches.matchId)) // Ideally use gameCreation desc
    .limit(30);

  const matchIds = last30MatchIds.map((m) => m.matchId);
  console.log("Last 30 match ids:", matchIds);

  if (matchIds.length === 0) {
    return <div>No recent matches found</div>;
  }

  // Step 2: Get the 30 matchParticipants entries (1 per match)
  const last30ParticipantRows = await db
    .select()
    .from(matchParticipants)
    .where(
      and(
        eq(matchParticipants.puuid, puuid),
        inArray(matchParticipants.matchId, matchIds)
      )
    );

  console.log("Last 30 participant rows:", last30ParticipantRows);

  let wins = 0;
  let losses = 0;
  last30ParticipantRows.map((row) => {
    row.win === 1 ? wins++ : losses++;
  });

  console.log("Wins and losses:", wins, losses);

  // Step 3: Group manually in JS
  const statsByChampion = new Map<
    number,
    {
      gamesPlayed: number;
      kills: number;
      deaths: number;
      assists: number;
      cs: number;
      time: number;
      wins: number;
      damage: number;
    }
  >();

  for (const row of last30ParticipantRows) {
    const champId = row.championId!;
    const existing = statsByChampion.get(champId) || {
      gamesPlayed: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
      cs: 0,
      time: 0,
      wins: 0,
      damage: 0,
    };

    statsByChampion.set(champId, {
      gamesPlayed: existing.gamesPlayed + 1,
      kills: existing.kills + row.kills!,
      deaths: existing.deaths + row.deaths!,
      assists: existing.assists + row.assists!,
      cs: existing.cs + row.totalMinionsKilled!,
      time: existing.time + row.timePlayed!,
      wins: existing.wins + (row.win ? 1 : 0),
      damage: existing.damage + row.totalDamageDealtToChampions!,
    });
  }

  const sorted = Array.from(statsByChampion.entries())
    .sort((a, b) => b[1].gamesPlayed - a[1].gamesPlayed)
    .slice(0, 3);

  console.log("Sorted:", sorted);

  const version = await fetchLatestVersion();
  console.log("Version:", version);

  return (
    <div className="p-5 py-3 border border-gray-700/70 text-slate-300 rounded-md flex flex-col gap-1 bg-gradient-to-b from-[#1B1F35] to-[#121624]  shadow-sm shadow-[#2A2A40]">
      <div>
        <h1 className="flex items-center justify-center font-semibold text-lg">
          Last 30 Games
        </h1>
        <WinrateGauge
          percentage={(wins / (wins + losses)) * 100}
          title={"Winrate"}
          subtitle={`${wins}W-${losses}L`}
          size={100}
        />
      </div>
      {sorted.map(async ([championId, stats], index) => {
        const champ = await db.query.champions.findFirst({
          where: eq(champions.key, championId!.toString()),
        });
        const avgKills = stats.kills / stats.time;
        const avgDeaths = stats.deaths / stats.time;
        const avgAssists = stats.assists / stats.time;
        const avgCS = stats.cs / stats.time;
        const winRate = (stats.wins / stats.gamesPlayed) * 100;
        const avgDmg = stats.damage / stats.time;
        const userKda = kda(avgKills, avgDeaths, avgAssists);

        return (
          <div
            key={index}
            className={`flex justify-between ${
              index < sorted.length - 1 && "border-b"
            } p-1`}
          >
            <div className="flex items-center justify-center">
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ?.image}`}
                alt={`${champ?.name}`}
                width={40}
                height={40}
                className="border border-gray-500 rounded-full"
              />
            </div>
            <div className="flex flex-col justify-center text-slate-300">
              {/* <p>{stats.gamesPlayed}/</p> */}
              <div className="flex flex-col items-center text-center">
                <div className="flex">
                  <p>{stats.wins}W</p>
                  <span>-</span>
                  <p>{stats.gamesPlayed - stats.wins}L</p>
                </div>
                <p className="text-gray-400 text-xs">
                  {((stats.wins / stats.gamesPlayed) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
            <p className="flex items-center justify-center text-slate-300 text-base gap-0.5 font-medium">
              {userKda.toFixed(1)}{" "}
              <span className="text-gray-400 text-xs text-center items-center flex">
                KDA
              </span>
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default LastThirtyGames;
