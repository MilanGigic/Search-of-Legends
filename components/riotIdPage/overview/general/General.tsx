import ParticipantRow from "./ParticipantRow";

type TabOption = "general" | "details" | "runes";

interface ComponentState {
  activeTab: TabOption;
}
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

const General = ({
  game,
  puuid,
  showGame,
  region,
  isActive,
  version,
}: {
  game: DbGameInfo;
  puuid: string;
  showGame: boolean;
  region: string;
  isActive: ComponentState;
  version: string;
}) => {
  const blueTeamParticipants =
    game.participants?.filter((p) => p.teamId === 100) || [];
  const redTeamParticipants =
    game.participants?.filter((p) => p.teamId === 200) || [];

  return (
    <div className="bg-[#1E1E2F]/20 w-full">
      {showGame ? (
        <div className="py-2">
          <div className="animate-fade-down animate-duration-300 animate-ease-in-out">
            {/* Mobile Layout: Stacked Teams */}
            <div className="block lg:hidden space-y-2">
              {/* Blue Team */}
              <div className="bg-gray-800 rounded-lg p-2 sm:p-4">
                <div className="flex mb-1 sm:mb-4">
                  <div className="flex">
                    <h2 className="text-xl font-bold text-blue-400 mb-1">
                      Blue Team
                    </h2>
                    <span
                      className={`text-lg font-semibold ${
                        game.teams[0].win === 1
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {game.teams[0].win === 1 ? "Victory" : "Defeat"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {blueTeamParticipants.map((participant) => (
                    <ParticipantRow
                      key={`blue-${participant.puuid}`}
                      participant={participant}
                      puuid={puuid}
                      version={version}
                    />
                  ))}
                </div>
              </div>

              {/* Red Team */}
              <div className="bg-gray-800 rounded-lg p-2 sm:p-4">
                <div className="flex justify-center items-center mb-1">
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-red-400 mb-1">
                      Red Team
                    </h2>
                    <span
                      className={`text-lg font-semibold ${
                        game.teams![1].win === 1
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {game.teams![1].win === 1 ? "Victory" : "Defeat"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {redTeamParticipants.map((participant) => (
                    <ParticipantRow
                      key={`red-${participant.puuid}`}
                      participant={participant}
                      puuid={puuid}
                      version={version}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop Layout: Side by Side */}
            <div className="hidden lg:flex lg:flex-col">
              {/* Blue Team */}
              <div className="flex-1">
                <div className="flex items-center text-center gap-2 mb-4 px-4">
                  <span
                    className={`text-2xl font-semibold text-center ${
                      game.teams[0].win === 1
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {game.teams[0].win === 1 ? "Victory" : "Defeat"}
                  </span>
                  <h2 className="text-xl font-bold text-slate-400 uppercase">
                    Blue Team
                  </h2>
                </div>

                <div className="space-y-1">
                  {blueTeamParticipants.map((participant) => (
                    <ParticipantRow
                      key={`blue-${participant.puuid}`}
                      participant={participant}
                      puuid={puuid}
                      version={version}
                    />
                  ))}
                </div>
              </div>

              {/* Red Team */}
              <div className="flex-1">
                <div className="flex items-center text-center gap-2 mb-4 px-4 pt-2">
                  <span
                    className={`text-2xl font-semibold ${
                      game.teams![1].win === 1
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {game.teams![1].win === 1 ? "Victory" : "Defeat"}
                  </span>
                  <h2 className="text-xl font-bold text-slate-400 uppercase">
                    Red Team
                  </h2>
                </div>
                <div className="space-y-1">
                  {redTeamParticipants.map((participant) => (
                    <ParticipantRow
                      key={`red-${participant.puuid}`}
                      participant={participant}
                      puuid={puuid}
                      version={version}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default General;
