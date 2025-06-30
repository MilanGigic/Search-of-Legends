"use client";
import { calculateAccurateGameDuration } from "@/lib/riot";
import { Button } from "@/components/ui/button";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import UserVsOpponent from "./UserVsOpponent";
import General from "./General";

type TabOption = "general" | "details" | "runes";

interface ComponentState {
  activeTab: TabOption;
}

const GameMatchCard = ({
  game,
  puuid,
  region,
  currentPage,
}: {
  game: DbGameInfo;
  puuid: string;
  region: string;
  currentPage: number;
}) => {
  const [user, setUser] = useState<ParticipantData | null>(null);
  const [opponent, setOpponent] = useState<ParticipantData | null>(null);
  const [showGame, setShowGame] = useState<boolean>(false);
  const [localTime, setLocalTime] = useState<string>("");
  const [isActive, setIsActive] = useState<ComponentState>({
    activeTab: "general",
  });

  useEffect(() => {
    const currentUser = game.participants?.find((p) => p.puuid === puuid);
    setUser(currentUser || null);
  }, [puuid, game]);

  useEffect(() => {
    setShowGame(false);
    setIsActive({ activeTab: "general" });
  }, [currentPage]);

  useEffect(() => {
    if (user) {
      const opponentParticipant = game.participants?.find(
        (p) =>
          p.puuid !== puuid &&
          p.teamPosition === user.teamPosition &&
          p.teamId !== user.teamId
      );
      setOpponent(opponentParticipant || null);
    }
  }, [user, puuid, game]);

  useEffect(() => {
    if (!game.info.gameCreation) return;

    try {
      // Ensure we have a Date object
      const gameDate =
        game.info.gameCreation instanceof Date
          ? game.info.gameCreation
          : new Date(game.info.gameCreation);

      if (isNaN(gameDate.getTime())) {
        console.error("Invalid date:", game.info.gameCreation);
        return;
      }

      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const formatted = gameDate.toLocaleString(undefined, {
        timeZone,
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      setLocalTime(formatted);
    } catch (error) {
      console.error("Error formatting date:", error);
    }
  }, [game.info.gameCreation]);

  const handleButtonClick = (tab: TabOption) => {
    setIsActive({ activeTab: tab });
  };

  return (
    <div className="container text-white">
      {/* User vs Opponent */}
      <div
        className={`${
          showGame ? "rounded-t-md" : ""
        } from-[#121624] to-[#1B1F35]`}
      >
        <div className="max-w-[468px] md:max-w-[864px] grid grid-cols-3 items-center py-1.5">
          <h1 className="text-amber-500 text-sm md:text-base text-center">
            {user?.riotIdGameName}#{user?.riotIdTagline}
          </h1>

          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center justify-center text-sm font-light text-gray-300">
              <p className="italic text-xs font-bold md:font-normal md:text-sm w-full items-center text-center">
                {game.info.queueId === 420
                  ? "Solo/Duo"
                  : game.info.queueId === 400
                  ? "Normal Draft"
                  : game.info.queueId === 490
                  ? "Quickplay"
                  : game.info.queueId === 440
                  ? "Flex"
                  : game.info.queueId === 450
                  ? "ARAM"
                  : game.info.queueId === 880
                  ? "Co-op vs Beginner"
                  : game.info.queueId === 890
                  ? "Co-op vs Intermediate"
                  : game.info.queueId === 900
                  ? "ARURF"
                  : game.info.queueId === 1020
                  ? "One for All"
                  : game.info.queueId === 1400
                  ? "Ultimate Spellbook"
                  : game.info.queueId === 1300
                  ? "Nexus Blitz"
                  : game.info.queueId === 1700
                  ? "Arena"
                  : game.info.queueId === 1710
                  ? "Arena"
                  : ""}
              </p>
              <p className="flex text-xs md:text-base items-center w-full">
                <strong className="mr-0.5 md:mr-1 text-xs md:text-base font-semibold md:font-bold text-gray-300">
                  {localTime}
                </strong>{" "}
                / {calculateAccurateGameDuration(user?.timePlayed!)}
              </p>
            </div>
          </div>
          <Link
            href={`${opponent?.riotIdGameName}-${opponent?.riotIdTagline}`}
            className="hover:text-amber-500 transition-colors duration-200"
          >
            <h1 className="items-center text-sm md:text-base text-center overflow-hidden text-wrap">
              {opponent?.riotIdGameName}#{opponent?.riotIdTagline}
            </h1>
          </Link>
        </div>
      </div>
      <UserVsOpponent user={user} opponent={opponent} showGame={showGame} />
      {/* ----------------- */}
      {showGame ? (
        <div className="">
          <section className="flex justify-center w-full">
            <Button
              className={`hover:bg-[#1B1F35] text-slate-300 bg-transparent w-1/3 py-5 rounded-none ${
                isActive.activeTab === "general" &&
                "bg-[#1B1F35] text-slate-300"
              }`}
              onClick={() => handleButtonClick("general")}
            >
              General
            </Button>
            <Button
              className={`hover:bg-[#1B1F35] text-slate-300 bg-transparent w-1/3 py-5 rounded-none ${
                isActive.activeTab === "details" &&
                "bg-[#1B1F35] text-slate-300"
              }`}
              onClick={() => handleButtonClick("details")}
            >
              Details
            </Button>
            <Button
              className={`hover:bg-[#1B1F35] text-slate-300 bg-transparent w-1/3 py-5 rounded-none ${
                isActive.activeTab === "runes" && "bg-[#1B1F35] text-slate-300"
              }`}
              onClick={() => handleButtonClick("runes")}
            >
              Runes
            </Button>
          </section>
          <General
            game={game}
            puuid={puuid}
            showGame={showGame}
            region={region}
            isActive={isActive}
          />
        </div>
      ) : (
        <div></div>
      )}
      <Button
        className={`w-full items-center justify-center bg-[#2A2A40]/55 text-slate-300 hover:bg-[#2A2A40] rounded-none pt-2`}
        onClick={() => setShowGame(!showGame)}
      >
        {showGame ? <ArrowUpIcon /> : <ArrowDownIcon />}
      </Button>
    </div>
  );
};

export default GameMatchCard;
