import { getRolePerformance } from "@/lib/actions/getRolePerformance";
import Image from "next/image";

const RolesPerformanceCard = async ({ puuid }: { puuid: string }) => {
  const data = await getRolePerformance(puuid);


  return (
    <div className="p-5 py-3 border border-gray-700/70 text-slate-300 rounded-md flex flex-col gap-1 bg-gradient-to-b from-[#1B1F35] to-[#121624]  shadow-sm shadow-[#2A2A40]">
      <div>
        <ul className="grid grid-cols-4 text-slate-300 font-semibold">
          <li className="text-center col-span-2">Role</li>
          <li className="text-center">Games</li>
          <li className="text-center">WR</li>
        </ul>

        <ul className="mt-1">
          {data.map((role, index) => (
            <li key={role.role}>
              {role.role === "TOP" ? (
                <div
                  className={`text-center grid grid-cols-4 py-1 ${
                    index < data.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div className="col-span-2 w-full">
                    <div className="flex items-center w-full">
                      <Image
                        src={
                          "https://static.wikia.nocookie.net/leagueoflegends/images/e/ef/Top_icon.png/revision/latest?cb=20181117143602"
                        }
                        alt={`${(<div className="p-2 border rounded-sm" />)}`}
                        width={30}
                        height={30}
                      />
                      <h2 className="font-semibold text-slate-300 flex w-full justify-center mr-8">
                        TOP
                      </h2>
                    </div>
                  </div>
                  <div>
                    <p>{role.gamesPlayed}</p>
                  </div>
                  <div>
                    <p
                      className={`${
                        Math.round((role.wins / role.gamesPlayed) * 100) >= 50
                          ? "text-emerald-600"
                          : "text-red-700"
                      }
                  ${
                    Math.round((role.wins / role.gamesPlayed) * 100) === 50 &&
                    "text-white"
                  }
                flex items-center justify-center`}
                    >
                      {Math.round((role.wins / role.gamesPlayed) * 100)}
                      <span className="text-gray-300 text-xs">%</span>
                    </p>
                  </div>
                </div>
              ) : role.role === "JUNGLE" ? (
                <div className="text-center grid grid-cols-4 border-b py-1">
                  <div className="col-span-2 w-full">
                    <div className="flex items-center w-full">
                      <Image
                        src={
                          "https://static.wikia.nocookie.net/leagueoflegends/images/1/1b/Jungle_icon.png/revision/latest?cb=20181117143559"
                        }
                        alt={`${(<div className="p-2 border rounded-sm" />)}`}
                        width={30}
                        height={30}
                      />
                      <h2 className="font-semibold text-slate-300 flex w-full justify-center mr-8">
                        JUNGLE
                      </h2>
                    </div>
                  </div>
                  <div>
                    <p>{role.gamesPlayed}</p>
                  </div>
                  <div>
                    <p
                      className={`${
                        Math.round((role.wins / role.gamesPlayed) * 100) >= 50
                          ? "text-emerald-600"
                          : "text-red-700"
                      }
                  ${
                    Math.round((role.wins / role.gamesPlayed) * 100) === 50 &&
                    "text-white"
                  }
                flex items-center justify-center`}
                    >
                      {Math.round((role.wins / role.gamesPlayed) * 100)}
                      <span className="text-gray-300 text-xs">%</span>
                    </p>
                  </div>
                </div>
              ) : role.role === "MIDDLE" ? (
                <div className="text-center grid grid-cols-4 border-b py-1">
                  <div className="col-span-2 w-full">
                    <div className="flex items-center w-full">
                      <Image
                        src={
                          "https://static.wikia.nocookie.net/leagueoflegends/images/9/98/Middle_icon.png/revision/latest?cb=20181117143644"
                        }
                        alt={`${(<div className="p-2 border rounded-sm" />)}`}
                        width={30}
                        height={30}
                      />
                      <h2 className="font-semibold text-slate-300 flex w-full justify-center mr-8">
                        MID
                      </h2>
                    </div>
                  </div>
                  <div>
                    <p>{role.gamesPlayed}</p>
                  </div>
                  <div>
                    <p
                      className={`${
                        Math.round((role.wins / role.gamesPlayed) * 100) >= 50
                          ? "text-emerald-600"
                          : "text-red-700"
                      }
                  ${
                    Math.round((role.wins / role.gamesPlayed) * 100) === 50 &&
                    "text-white"
                  }
                flex items-center justify-center`}
                    >
                      {Math.round((role.wins / role.gamesPlayed) * 100)}
                      <span className="text-gray-300 text-xs">%</span>
                    </p>
                  </div>
                </div>
              ) : role.role === "BOTTOM" ? (
                <div className="text-center grid grid-cols-4 border-b py-1">
                  <div className="col-span-2 w-full">
                    <div className="flex items-center w-full">
                      <Image
                        src={
                          "https://static.wikia.nocookie.net/leagueoflegends/images/9/97/Bottom_icon.png/revision/latest?cb=20181117143632"
                        }
                        alt={`${(<div className="p-2 border rounded-sm" />)}`}
                        width={30}
                        height={30}
                      />
                      <h2 className="font-semibold text-slate-300 flex w-full justify-center mr-8">
                        ADC
                      </h2>
                    </div>
                  </div>
                  <div>
                    <p>{role.gamesPlayed}</p>
                  </div>
                  <div>
                    <p
                      className={`${
                        Math.round((role.wins / role.gamesPlayed) * 100) >= 50
                          ? "text-emerald-600"
                          : "text-red-700"
                      }
                  ${
                    Math.round((role.wins / role.gamesPlayed) * 100) === 50 &&
                    "text-white"
                  }
                flex items-center justify-center`}
                    >
                      {Math.round((role.wins / role.gamesPlayed) * 100)}
                      <span className="text-gray-300 text-xs">%</span>
                    </p>
                  </div>
                </div>
              ) : role.role === "UTILITY" ? (
                <div className="text-center grid grid-cols-4 border-b py-1">
                  <div className="col-span-2 w-full">
                    <div className="flex items-center w-full">
                      <Image
                        src={
                          "https://static.wikia.nocookie.net/leagueoflegends/images/e/e0/Support_icon.png/revision/latest?cb=20181117143601"
                        }
                        alt={`${(<div className="p-2 border rounded-sm" />)}`}
                        width={30}
                        height={30}
                      />
                      <h2 className="font-semibold text-slate-300 flex w-full justify-center mr-8">
                        SUPPORT
                      </h2>
                    </div>
                  </div>
                  <div>
                    <p>{role.gamesPlayed}</p>
                  </div>
                  <div>
                    <p
                      className={`${
                        Math.round((role.wins / role.gamesPlayed) * 100) >= 52
                          ? "text-emerald-600"
                          : "text-red-700"
                      }
                  ${
                    Math.round((role.wins / role.gamesPlayed) * 100) === 50 &&
                    "text-white"
                  }
                  flex items-center justify-center`}
                    >
                      {Math.round((role.wins / role.gamesPlayed) * 100)}
                      <span className="text-gray-300 text-xs">%</span>
                    </p>
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
export default RolesPerformanceCard;
