import fetchChampions from "@/lib/actions/fetchChampions";
import { getChampionPerformance } from "@/lib/actions/getChampionPerformance";
import Image from "next/image";

const ChampionPerformanceCard = async ({ puuid }: { puuid: string }) => {
  const champions = await fetchChampions();
  console.log("Champions:", champions);

  const data = await getChampionPerformance(puuid);
  console.log("Champion performance data:", data);

  const top5 = data
    .sort((a, b) => Number(b.gamesPlayed) - Number(a.gamesPlayed))
    .slice(0, 5);

  console.log("Top 5", top5);
  return (
    <div className="p-5 rounded-md flex flex-col gap-1 bg-[#1E1E2F] shadow-lg shadow-[#2A2A40]">
      <div className="grid grid-rows-5">
        <ul className="grid grid-cols-4 row-span-1">
          <li></li>
          <li className="text-center">KDA</li>
          <li className="text-center">Games</li>
          <li className="text-center">WR</li>
        </ul>
        <ul className="grid grid-cols-4 row-span-1">
          {top5.map((champ) => (
            <li key={champ.championId}>
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/${champ.championImage}`}
                alt={champ.championName}
                width={40}
                height={40}
                className="mt-1"
              />

              {/* FIX THIS FRONTEND LOOK */}

              <p>
                {champ.kda}
                <br />
                <span className="text-sm">
                  {Math.round(champ.avgKills)}/
                  <span className="text-red-500">
                    {Math.round(champ.avgDeaths)}
                  </span>
                  /{Math.round(champ.avgAssists)}
                </span>
              </p>
            </li>
          ))}
        </ul>
      </div>
      {/* <ul className="grid grid-cols-4">
        <li className="mt-5 h-full flex pb-3 flex-col justify-between">
          {top5.map((champ) => (
            <Image
              key={champ.championId}
              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/${champ.championImage}`}
              alt={champ.championName}
              width={40}
              height={40}
              className="mt-1"
            />
          ))}
        </li>
        <li className="text-center">
          <h1>KDA</h1>
          <div className="h-full flex pb-3 flex-col justify-around">
            {top5.map((champ) => (
              <p
                key={champ.championId}
                className="tracking-tight text-xs m-0 p-0"
              >
                {champ.kda}
                <br />
                <span className="text-sm">
                  {Math.round(champ.avgKills)}/
                  <span className="text-red-500">
                    {Math.round(champ.avgDeaths)}
                  </span>
                  /{Math.round(champ.avgAssists)}
                </span>
              </p>
            ))}
          </div>
        </li>
        <li className="text-center">
          <h1>Games</h1>
          <div className="h-full flex pb-4 flex-col justify-around">
            {top5.map((champ) => (
              <p key={champ.championId}>{champ.gamesPlayed}</p>
            ))}
          </div>
        </li>
        <li className="text-center">
          <h1>WR</h1>
          <div className="h-full flex pb-4 flex-col justify-around">
            {top5.map((champ) => (
              <p key={champ.championId}>
                {Math.round((champ.wins / champ.gamesPlayed) * 100)}%
              </p>
            ))}
          </div>
        </li>
      </ul> */}

      {/* <ul className="text-sm font-light flex">
        <li>KDA</li>
        <li>Games</li>
        <li>WR</li>
      </ul>
      {top5.map((champ) => (
        <div
          key={champ.championId}
          className="border-b p-1 flex items-center justify-between gap-0.5"
        >
          <ul>
            <li>
              
            </li>
          </ul>
          <ul>
            <li className="text-sm gap-0.5 text-gray-300 font-light tracking-tight">
              <span className="text-gray-100">{champ.kda}</span>
            </li>
          </ul> */}

      {/* <div className="flex gap-1">
            
            <h1 className="text-gray-200">{champ.championName}</h1>
          </div>
          <ul className="text-sm">
            <li>{champ.kda}</li>
            <li>
              {parseFloat(String(champ.avgKills)).toFixed(0)}/
              <span className="text-red-500">
                {parseFloat(String(champ.avgDeaths)).toFixed(0)}
              </span>
              /{parseFloat(String(champ.avgAssists)).toFixed(0)}
            </li>
            <li>{champ.csPerMin}/min</li>
          </ul> */}
      {/* </div>
      ))} */}
    </div>
  );
};
export default ChampionPerformanceCard;
