import Image from "next/image";

const TopFivePlayers = () => {
  return (
    <div className="py-2 px-1 border border-gray-700/70 text-slate-300 rounded-md flex flex-col gap-1 bg-gradient-to-b from-[#1B1F35] to-[#121624] ">
      <div className="shadow-2xl shadow-[#12162499]">
        <ul className="grid grid-cols-5 text-slate-300 font-semibold">
          <li className="text-center font-semibold">Rank</li>
          <li className="col-span-2 font-semibold text-center">Player</li>
          <li className="text-center font-semibold">Winrate</li>
          <li className="text-center font-semibold">LP</li>
        </ul>
        <ul className="px-1 py-1.5">
          <li className="text-center grid grid-cols-5 py-1 hover:bg-[#2A2A40] transition-colors duration-200 rounded-md cursor-pointer">
            <h1 className="text-center flex flex-col items-center justify-center">
              1
            </h1>
            <div className="flex items-center justify-start col-span-2 gap-2">
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/profileicon/0.png`}
                alt={`Rank 1`}
                width={40}
                height={40}
                className="ml-1.5 border border-gray-500 rounded-full"
              />
              <h1 className="text-[#E2E6F2] flex flex-col items-center justify-center w-full">
                Rank1Player
              </h1>
            </div>
            <p className="flex flex-col items-center justify-center text-slate-300">
              56.2%
            </p>
            <p className="flex flex-col items-center justify-center">2500</p>
          </li>
          <li className="text-center grid grid-cols-5 py-1 hover:bg-[#2A2A40] transition-colors duration-200 rounded-md cursor-pointer">
            <h1 className="text-center  flex flex-col items-center justify-center">
              2
            </h1>
            <div className="flex items-center justify-start col-span-2 gap-2">
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/profileicon/2.png`}
                alt={`Rank 2`}
                width={40}
                height={40}
                className="ml-1.5 border border-gray-500 rounded-full"
              />
              <h1 className="text-[#E2E6F2] flex flex-col items-center justify-center w-full">
                Rank2Player
              </h1>
            </div>
            <p className="flex flex-col items-center justify-center text-slate-300">
              55.3%
            </p>
            <p className="flex flex-col items-center justify-center">2450</p>
          </li>
          <li className="text-center grid grid-cols-5 py-1 hover:bg-[#2A2A40] transition-colors duration-200 rounded-md cursor-pointer">
            <h1 className="text-center flex flex-col items-center justify-center">
              3
            </h1>
            <div className="flex items-center justify-start col-span-2 gap-2">
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/profileicon/3.png`}
                alt={`Rank 3`}
                width={40}
                height={40}
                className="ml-1.5 border border-gray-500 rounded-full"
              />
              <h1 className="text-[#E2E6F2] flex flex-col items-center justify-center w-full">
                Rank3Player
              </h1>
            </div>
            <p className="flex flex-col items-center justify-center text-slate-300">
              54.9%
            </p>
            <p className="flex flex-col items-center justify-center">2400</p>
          </li>
          <li className="text-center grid grid-cols-5 py-1 hover:bg-[#2A2A40] transition-colors duration-200 rounded-md cursor-pointer">
            <h1 className="text-center flex flex-col items-center justify-center">
              4
            </h1>
            <div className="flex items-center justify-start col-span-2 gap-2">
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/profileicon/4.png`}
                alt={`Rank 4`}
                width={40}
                height={40}
                className="ml-1.5 border border-gray-500 rounded-full"
              />
              <h1 className="text-[#E2E6F2] flex flex-col items-center justify-center w-full">
                Rank4Player
              </h1>
            </div>
            <p className="flex flex-col items-center justify-center text-slate-300">
              53.6%
            </p>
            <p className="flex flex-col items-center justify-center">2350</p>
          </li>
          <li className="text-center grid grid-cols-5 py-1 hover:bg-[#2A2A40] transition-colors duration-200 rounded-md cursor-pointer">
            <h1 className="text-center flex flex-col items-center justify-center">
              5
            </h1>
            <div className="flex items-center justify-start col-span-2 gap-2">
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/profileicon/5.png`}
                alt={`Rank 5`}
                width={40}
                height={40}
                className="ml-1.5 border border-gray-500 rounded-full"
              />
              <h1 className="text-[#E2E6F2] flex flex-col items-center justify-center w-full">
                Rank5Player
              </h1>
            </div>
            <p className="flex flex-col items-center justify-center text-slate-300">
              52.8%
            </p>
            <p className="flex flex-col items-center justify-center">2300</p>
          </li>
        </ul>
      </div>
    </div>
  );
};
export default TopFivePlayers;
