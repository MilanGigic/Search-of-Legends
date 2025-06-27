import { calculateCsPerMin } from "@/lib/riot";

const getSummonerSpellImage = (spellId: number) => {
  const spellMap: Record<number, string> = {
    1: "SummonerBoost", // Cleanse
    3: "SummonerExhaust", // Exhaust
    4: "SummonerFlash", // Flash
    6: "SummonerHaste", // Ghost
    7: "SummonerHeal", // Heal
    11: "SummonerSmite", // Smite
    12: "SummonerTeleport", // Teleport
    13: "SummonerMana", // Clarity
    14: "SummonerDot", // Ignite
    21: "SummonerBarrier", // Barrier
    32: "SummonerSnowball", // ARAM Mark/Dash
    39: "SummonerSnowURFSnowball_Mark", // URF Mark
  };
  return spellMap[spellId] || null;
};

const calculateKDA = (kills: number, deaths: number, assists: number) => {
  if (deaths > 0) {
    return Math.round(((kills + assists) / deaths) * 100) / 100;
  }
  return kills + assists;
};

const UserVsOpponent = ({
  user,
  opponent,
  showGame,
}: {
  user: ParticipantData | null;
  opponent: ParticipantData | null;
  showGame: boolean;
}) => {
  const userKda = user
    ? calculateKDA(user.kills!, user.deaths!, user.assists!)
    : 0;
  const opponentKda = opponent
    ? calculateKDA(opponent.kills!, opponent.deaths!, opponent.assists!)
    : 0;

  // Item component for reusability
  const ItemSlot = ({
    itemId,
    size = "w-6 h-6",
  }: {
    itemId?: number;
    size?: string;
  }) => (
    <div className={`${size} flex-shrink-0`}>
      {itemId ? (
        <img
          src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/item/${itemId}.png`}
          alt="Item"
          className="w-full h-full object-cover rounded-sm"
        />
      ) : (
        <div className="w-full h-full bg-gray-700/50 rounded-sm border border-gray-600" />
      )}
    </div>
  );

  const SummonerSpell = ({
    spellId,
    size = "w-7 h-7",
  }: {
    spellId?: number;
    size?: string;
  }) => {
    const spellName = spellId ? getSummonerSpellImage(spellId) : null;

    if (spellId && !spellName) {
      console.warn("Unknown summoner spell ID:", spellId);
    }

    return (
      <div className={`${size} flex-shrink-0`}>
        {spellName ? (
          <img
            src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/spell/${spellName}.png`}
            alt="Summoner Spell"
            className="w-full h-full object-cover rounded-sm"
            onError={(e) => {
              // Fallback if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              target.nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        <div
          className={`w-full h-full bg-gray-700/50 rounded-sm border border-gray-600 flex items-center justify-center text-xs text-gray-400 ${
            spellName ? "hidden" : ""
          }`}
        >
          {spellId || "?"}
        </div>
      </div>
    );
  };

  const PlayerStats = ({
    participant,
    kda,
    isUser = true,
  }: {
    participant: ParticipantData | null;
    kda: number;
    isUser?: boolean;
  }) => {
    if (!participant) return null;

    const csPerMin = calculateCsPerMin(
      participant.timePlayed!,
      participant.totalMinionsKilled!
    );

    return (
      <div
        className={`flex flex-col gap-2
         ${isUser ? "items-start" : "items-end"} sm:${
          isUser ? "items-start" : "items-end"
        }
        `}
      >
        <div
          className={`flex items-center gap-2 text-sm sm:text-base
          }`}
        >
          <div
            className={`flex items-center gap-1 
            `}
          >
            <span className="font-semibold">{participant.kills}</span>
            <span className="text-gray-400">/</span>
            <span className="font-semibold text-red-400">
              {participant.deaths}
            </span>
            <span className="text-gray-400">/</span>
            <span className="font-semibold">{participant.assists}</span>
          </div>
          <div className="text-xs sm:text-sm text-gray-300">
            <span className="font-bold text-white text-sm sm:text-base">
              {kda}
            </span>{" "}
            KDA
          </div>
        </div>

        <div className="text-xs sm:text-sm text-gray-400">
          {csPerMin} cs/min
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[468px] md:max-w-[864px]">
      <div
        className={`${
          user?.win
            ? "bg-gradient-to-r from-green-500/40 to-emerald-400/40"
            : "bg-gradient-to-r from-red-500/40 to-rose-400/40"
        } w-full p-3 sm:p-4 shadow-lg`}
      >
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/${user?.championName}.png`}
                  alt={user?.championName!}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg border-2 border-white/20"
                />
              </div>

              <div className="flex-1 min-w-0">
                <PlayerStats participant={user} kda={userKda} isUser={true} />

                <div className="flex gap-1 mt-2">
                  <SummonerSpell spellId={user?.summoner1Id!} />
                  <SummonerSpell spellId={user?.summoner2Id!} />
                </div>
              </div>
            </div>

            <div className="mt-3 p-2 bg-slate-800/60 rounded-md">
              <div className="flex gap-1 justify-center sm:justify-start">
                {user && (
                  <>
                    <ItemSlot itemId={user.item0!} />
                    <ItemSlot itemId={user.item1!} />
                    <ItemSlot itemId={user.item2!} />
                    <ItemSlot itemId={user.item3!} />
                    <ItemSlot itemId={user.item4!} />
                    <ItemSlot itemId={user.item5!} />
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center justify-center">
            <div className="w-px h-20 bg-white/20"></div>
            <span className="absolute bg-white/10 px-2 py-1 rounded text-xs font-semibold text-white/70">
              VS
            </span>
          </div>

          <div className="sm:hidden flex items-center justify-center py-2">
            <div className="h-px w-full bg-white/20 relative">
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/10 px-3 py-1 rounded text-xs font-semibold text-white/70">
                VS
              </span>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex w-full items-center gap-3 sm:flex-row md:flex-row-reverse">
              <div className="flex-shrink-0">
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/${opponent?.championName}.png`}
                  alt={opponent?.championName!}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg border-2 border-white/20"
                />
              </div>

              <div className="flex-1 min-w-0">
                <PlayerStats
                  participant={opponent}
                  kda={opponentKda}
                  isUser={false}
                />

                <div className="flex gap-1 mt-2 justify-start sm:justify-end">
                  <SummonerSpell spellId={opponent?.summoner1Id!} />
                  <SummonerSpell spellId={opponent?.summoner2Id!} />
                </div>
              </div>
            </div>

            <div className="mt-3 p-2 bg-slate-800/60 rounded-md">
              <div className="flex gap-1 justify-center sm:justify-end">
                <ItemSlot itemId={opponent?.item0!} />
                <ItemSlot itemId={opponent?.item1!} />
                <ItemSlot itemId={opponent?.item2!} />
                <ItemSlot itemId={opponent?.item3!} />
                <ItemSlot itemId={opponent?.item4!} />
                <ItemSlot itemId={opponent?.item5!} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserVsOpponent;
