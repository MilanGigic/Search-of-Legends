import { calculateCsPerMin } from "@/lib/riot";

const UserVsOpponent = ({
  user,
  opponent,
  showGame,
}: {
  user: ParticipantData | null;
  opponent: ParticipantData | null;
  showGame: boolean;
}) => {
  let userKda;
  if (user?.deaths! > 0) {
    userKda =
      Math.round(((user?.kills! + user?.assists!) / user?.deaths!) * 100) / 100;
  } else if (user?.deaths! === 0) {
    userKda = user?.kills! + user?.assists!;
  }

  let opponentKda;
  if (opponent?.deaths! > 0) {
    opponentKda =
      Math.round(
        ((opponent?.kills! + opponent?.assists!) / opponent?.deaths!) * 100
      ) / 100;
  } else if (opponent?.deaths! === 0) {
    opponentKda = opponent?.kills! + opponent?.assists!;
  }

  return (
    <div
      className={`${
        user?.win
          ? "bg-gradient-to-r from-green-500/40 to-emerald-400/40"
          : "bg-gradient-to-r from-red-500/40 to-rose-400/40"
      } w-full py-2.5 flex justify-between inset-shadow-xs`}
    >
      <div className="px-4 flex justify-end items-center w-1/2">
        <div className="flex w-full justify-end animate-fade-right animate-ease-in animate-duration-200">
          <div className="flex justify-end items-center">
            <div className="flex flex-col items-center justify-center">
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/${user?.championName}.png`}
                width={60}
                height={60}
              />
            </div>
            <div className="pl-3 flex flex-col justify-end">
              <div className="text-base flex items-center font-semibold italic">
                {user?.kills}/
                <span className="text-red-300 items-center px-0.5">
                  {user?.deaths}
                </span>
                /{user?.assists}{" "}
                <span className="not-italic text-base items-center font-light text-gray-300">
                  <span className="text-lg font-bold not-italic items-center pl-3 text-white">
                    {userKda}
                  </span>
                  KDA
                </span>
                <p className="ml-2">
                  <span className="font-light text-sm text-gray-300">
                    {calculateCsPerMin(
                      user?.timePlayed!,
                      user?.totalMinionsKilled!
                    )}{" "}
                    cs<span className="text-xs">/</span>min
                  </span>
                </p>
              </div>

              <ul className="flex z-10 gap-0.5 items-center w-[252px] bg-blue-950 p-3 rounded-md inset-shadow-xs inset-shadow-black/80">
                <li>
                  {user?.summoner1Id === 4 ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerFlash.png`}
                      width={30}
                    />
                  ) : user?.summoner1Id === 21 ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerBarrier.png`}
                      width={30}
                    />
                  ) : user?.summoner1Id === 1 ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerBoost.png`}
                      width={30}
                    />
                  ) : user?.summoner1Id === 14 ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerDot.png`}
                      width={30}
                    />
                  ) : user?.summoner1Id === 3 ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerExhaust.png`}
                      width={30}
                    />
                  ) : user?.summoner1Id === 6 ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerHaste.png`}
                      width={30}
                    />
                  ) : user?.summoner1Id === 7 ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerHeal.png`}
                      width={30}
                    />
                  ) : user?.summoner1Id === 13 ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerMana.png`}
                      width={30}
                    />
                  ) : user?.summoner1Id === 11 ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerSmite.png`}
                      width={30}
                    />
                  ) : user?.summoner1Id === 12 ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerTeleport.png`}
                      width={30}
                    />
                  ) : null}
                </li>
                <li className="mr-1">
                  {user?.summoner2Id === 4 ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerFlash.png`}
                      width={30}
                    />
                  ) : user?.summoner2Id === 21 ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerBarrier.png`}
                      width={30}
                    />
                  ) : user?.summoner2Id === 1 ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerBoost.png`}
                      width={30}
                    />
                  ) : user?.summoner2Id === 14 ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerDot.png`}
                      width={30}
                    />
                  ) : user?.summoner2Id === 3 ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerExhaust.png`}
                      width={30}
                    />
                  ) : user?.summoner2Id === 6 ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerHaste.png`}
                      width={30}
                    />
                  ) : user?.summoner2Id === 7 ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerHeal.png`}
                      width={30}
                    />
                  ) : user?.summoner2Id === 13 ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerMana.png`}
                      width={30}
                    />
                  ) : user?.summoner2Id === 11 ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerSmite.png`}
                      width={30}
                    />
                  ) : user?.summoner2Id === 12 ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerTeleport.png`}
                      width={30}
                    />
                  ) : null}
                </li>
                <li>
                  {user?.item0 ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${user?.item0}.png`}
                      alt="Item"
                      width={25}
                    />
                  ) : null}
                </li>
                <li>
                  {user?.item1 ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${user?.item1}.png`}
                      alt="Item"
                      width={25}
                    />
                  ) : null}
                </li>
                <li>
                  {user?.item2 ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${user?.item2}.png`}
                      alt="Item"
                      width={25}
                    />
                  ) : null}
                </li>
                <li>
                  {user?.item3 ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${user?.item3}.png`}
                      alt="Item"
                      width={25}
                    />
                  ) : null}
                </li>
                <li>
                  {user?.item4 ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${user?.item4}.png`}
                      alt="Item"
                      width={25}
                    />
                  ) : null}
                </li>
                <li>
                  {user?.item5 ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${user?.item5}.png`}
                      alt="Item"
                      width={25}
                    />
                  ) : null}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 flex items-center justify-start w-1/2">
        <div className="w-full flex justify-start animate-fade-left animate-ease-in animate-duration-200">
          <div className="pr-3 flex flex-col justify-center">
            <div className="text-base font-semibold italic flex items-center justify-end">
              <p className="mr-2">
                <span className="font-light text-sm text-gray-300">
                  {calculateCsPerMin(
                    opponent?.timePlayed!,
                    opponent?.totalMinionsKilled!
                  )}{" "}
                  cs<span className="text-xs">/</span>min
                </span>{" "}
              </p>
              <span className="pr-3 not-italic text-base font-light text-gray-300">
                <span className="text-lg font-bold not-italic items-center text-white">
                  {opponentKda}
                </span>
                KDA
              </span>
              {opponent?.kills}/
              <span className="text-red-300 items-center px-0.5">
                {opponent?.deaths}
              </span>
              /{opponent?.assists}
            </div>
            <ul className="flex justify-end gap-0.5 items-center w-[252px] bg-blue-950 p-3 rounded-md inset-shadow-xs inset-shadow-black/80">
              <li>
                {opponent?.item0 ? (
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${opponent?.item0}.png`}
                    alt="Item"
                    width={25}
                  />
                ) : null}
              </li>
              <li>
                {opponent?.item1 ? (
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${opponent?.item1}.png`}
                    alt="Item"
                    width={25}
                  />
                ) : null}
              </li>
              <li>
                {opponent?.item2 ? (
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${opponent?.item2}.png`}
                    alt="Item"
                    width={25}
                  />
                ) : null}
              </li>
              <li>
                {opponent?.item3 ? (
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${opponent?.item3}.png`}
                    alt="Item"
                    width={25}
                  />
                ) : null}
              </li>
              <li>
                {opponent?.item4 ? (
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${opponent?.item4}.png`}
                    alt="Item"
                    width={25}
                  />
                ) : null}
              </li>
              <li>
                {opponent?.item5 ? (
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${opponent?.item5}.png`}
                    alt="Item"
                    width={25}
                  />
                ) : null}
              </li>
              <li className="ml-1">
                {opponent?.summoner1Id === 4 ? (
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerFlash.png`}
                    width={30}
                  />
                ) : opponent?.summoner1Id === 21 ? (
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerBarrier.png`}
                    width={30}
                  />
                ) : opponent?.summoner1Id === 1 ? (
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerBoost.png`}
                    width={30}
                  />
                ) : opponent?.summoner1Id === 14 ? (
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerDot.png`}
                    width={30}
                  />
                ) : opponent?.summoner1Id === 3 ? (
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerExhaust.png`}
                    width={30}
                  />
                ) : opponent?.summoner1Id === 6 ? (
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerHaste.png`}
                    width={30}
                  />
                ) : opponent?.summoner1Id === 7 ? (
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerHeal.png`}
                    width={30}
                  />
                ) : opponent?.summoner1Id === 13 ? (
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerMana.png`}
                    width={30}
                  />
                ) : opponent?.summoner1Id === 11 ? (
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerSmite.png`}
                    width={30}
                  />
                ) : opponent?.summoner1Id === 12 ? (
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerTeleport.png`}
                    width={30}
                  />
                ) : null}
              </li>
              <li>
                {opponent?.summoner2Id === 4 ? (
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerFlash.png`}
                    width={30}
                  />
                ) : opponent?.summoner2Id === 21 ? (
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerBarrier.png`}
                    width={30}
                  />
                ) : opponent?.summoner2Id === 1 ? (
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerBoost.png`}
                    width={30}
                  />
                ) : opponent?.summoner2Id === 14 ? (
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerDot.png`}
                    width={30}
                  />
                ) : opponent?.summoner2Id === 3 ? (
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerExhaust.png`}
                    width={30}
                  />
                ) : opponent?.summoner2Id === 6 ? (
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerHaste.png`}
                    width={30}
                  />
                ) : opponent?.summoner2Id === 7 ? (
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerHeal.png`}
                    width={30}
                  />
                ) : opponent?.summoner2Id === 13 ? (
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerMana.png`}
                    width={30}
                  />
                ) : opponent?.summoner2Id === 11 ? (
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerSmite.png`}
                    width={30}
                  />
                ) : opponent?.summoner2Id === 12 ? (
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/SummonerTeleport.png`}
                    width={30}
                  />
                ) : null}
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-center justify-center">
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/${opponent?.championName}.png`}
              width={60}
              height={60}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default UserVsOpponent;
