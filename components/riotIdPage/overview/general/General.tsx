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
        <div className="">
          <div className="animate-fade-down animate-duration-300 animate-ease-in-out">
            {/* Mobile Layout: Stacked Teams */}
            <div className="block lg:hidden space-y-2">
              {/* Blue Team */}
              <div className="bg-gray-800 rounded-lg p-2 sm:p-4">
                <div className="flex justify-center items-center mb-1 sm:mb-4">
                  <div className="text-center">
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
                      puuid={participant.puuid!}
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
                      puuid={participant.puuid!}
                      version={version}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop Layout: Side by Side */}
            <div className="hidden lg:flex gap-0.5">
              {/* Blue Team */}
              <div className="flex-1">
                <div className="flex justify-center items-center flex-col mb-6">
                  <h2 className="text-2xl font-bold text-blue-400 mb-2">
                    Blue Team
                  </h2>
                  <span
                    className={`text-xl font-semibold ${
                      game.teams[0].win === 1
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {game.teams[0].win === 1 ? "Victory" : "Defeat"}
                  </span>
                </div>
                <div className="space-y-3">
                  {blueTeamParticipants.map((participant) => (
                    <ParticipantRow
                      key={`blue-${participant.puuid}`}
                      participant={participant}
                      puuid={participant.puuid!}
                      version={version}
                    />
                  ))}
                </div>
              </div>

              {/* Red Team */}
              <div className="flex-1">
                <div className="flex justify-center items-center flex-col mb-6">
                  <h2 className="text-2xl font-bold text-red-400 mb-2">
                    Red Team
                  </h2>
                  <span
                    className={`text-xl font-semibold ${
                      game.teams![1].win === 1
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {game.teams![1].win === 1 ? "Victory" : "Defeat"}
                  </span>
                </div>
                <div className="space-y-3">
                  {redTeamParticipants.map((participant) => (
                    <ParticipantRow
                      key={`red-${participant.puuid}`}
                      participant={participant}
                      puuid={participant.puuid!}
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
