import Image from "next/image";

const TopFiveChampions = () => {
  return (
    <div className="py-2 px-1 border border-gray-700/70 rounded-md flex flex-col gap-1 bg-gradient-to-b from-[#1B1F35] to-[#121624] shadow-[0_8px_20px_rgba(18,22,36,0.6)]">
      <div>
        <ul className="grid grid-cols-5 text-slate-300 font-semibold">
          <li className="text-center col-span-2">Champion</li>
          <li className="text-center">Tier</li>
          <li className="text-center">WR</li>
          <li className="text-center">Pickrate</li>
        </ul>
        <ul className="px-1 py-1.5">
          <li className="text-center grid grid-cols-5 py-1 hover:bg-[#2A2A40] transition-colors duration-200 rounded-md cursor-pointer">
            <div className="flex items-center justify-start col-span-2 gap-2">
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/Quinn.png`}
                alt={`Quinn`}
                width={40}
                height={40}
                className="ml-1.5 border border-gray-500 rounded-full"
              />
              <h1 className="text-[#E2E6F2] flex flex-col items-center justify-center w-full">
                Quinn
              </h1>
            </div>
            <p className="items-center flex flex-col text-center justify-center text-yellow-300 tracking-tighter">
              S+
            </p>
            <p className="flex flex-col items-center justify-center text-slate-300">
              56.2%
            </p>
            <p className="flex flex-col items-center justify-center">2.4%</p>
          </li>
          <li className="text-center grid grid-cols-5 py-1 hover:bg-[#2A2A40] transition-colors duration-200 rounded-md cursor-pointer">
            <div className="flex items-center justify-start col-span-2 gap-2">
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/Lulu.png`}
                alt={`Lulu`}
                width={40}
                height={40}
                className="ml-1.5 border border-gray-500 rounded-full"
              />
              <h1 className="text-[#E2E6F2] flex flex-col items-center justify-center w-full">
                Lulu
              </h1>
            </div>
            <p className="items-center flex flex-col text-center justify-center text-yellow-300 tracking-tighter">
              S+
            </p>
            <p className="flex flex-col items-center justify-center text-slate-300">
              51.7%
            </p>
            <p className="flex flex-col items-center justify-center">12.5%</p>
          </li>
          <li className="text-center grid grid-cols-5 py-1 hover:bg-[#2A2A40] transition-colors duration-200 rounded-md cursor-pointer">
            <div className="flex items-center justify-start col-span-2 gap-2">
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/Nocturne.png`}
                alt={`Nocturne`}
                width={40}
                height={40}
                className="border ml-1.5 border-gray-500 rounded-full"
              />
              <h1 className="text-[#E2E6F2] flex flex-col items-center justify-center w-full">
                Nocturne
              </h1>
            </div>
            <p className="items-center flex flex-col text-center justify-center text-yellow-300 tracking-tighter">
              S+
            </p>
            <p className="flex flex-col items-center justify-center text-slate-300">
              52.5%
            </p>
            <p className="flex flex-col items-center justify-center">6.7%</p>
          </li>
          <li className="text-center grid grid-cols-5 py-1 hover:bg-[#2A2A40] transition-colors duration-200 rounded-md cursor-pointer">
            <div className="flex items-center justify-start col-span-2 gap-2">
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/Jinx.png`}
                alt={`Jinx`}
                width={40}
                height={40}
                className="ml-1.5 border border-gray-500 rounded-full"
              />
              <h1 className="text-[#E2E6F2] flex flex-col items-center justify-center w-full">
                Jinx
              </h1>
            </div>
            <p className="items-center flex flex-col text-center justify-center text-yellow-300 tracking-tighter">
              S+
            </p>
            <p className="flex flex-col items-center justify-center text-slate-300">
              51.9%
            </p>
            <p className="flex flex-col items-center justify-center">12.6%</p>
          </li>
          <li className="text-center grid grid-cols-5 py-1 hover:bg-[#2A2A40] transition-colors duration-200 rounded-md cursor-pointer">
            <div className="flex items-center justify-start col-span-2 gap-2">
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/Talon.png`}
                alt={`Talon`}
                width={40}
                height={40}
                className="ml-1.5 border border-gray-500 rounded-full"
              />
              <h1 className="text-[#E2E6F2] flex flex-col items-center justify-center w-full">
                Talon
              </h1>
            </div>
            <p className="items-center flex flex-col text-center justify-center text-yellow-300 tracking-tighter">
              S+
            </p>
            <p className="flex flex-col items-center justify-center text-slate-300">
              53.3%
            </p>
            <p className="flex flex-col items-center justify-center">2.0%</p>
          </li>
        </ul>
      </div>
    </div>
  );
};
export default TopFiveChampions;
