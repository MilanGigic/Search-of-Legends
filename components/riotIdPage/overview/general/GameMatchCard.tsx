"use client";
import { calculateAccurateGameDuration } from "@/lib/riot";
import { Button } from "@/components/ui/button";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import UserVsOpponent from "./UserVsOpponent";
import General from "./General";
import Details from "./Details";
import Runes from "./Runes";
import Image from "next/image";
import { TbListDetails } from "react-icons/tb";
import { CgChart } from "react-icons/cg";
import GrayRunesIcon from "@/assets/icons/GrayRuneSymbol.png";
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

type TabOption = "general" | "details" | "runes";

interface ComponentState {
  activeTab: TabOption;
}

const GameMatchCard = ({
  game,
  puuid,
  region,
  currentPage,
  version,
}: {
  game: DbGameInfo;
  puuid: string;
  region: string;
  currentPage: number;
  version: string;
}) => {
  const [user, setUser] = useState<DbParticipantData | null>(null);
  const [opponent, setOpponent] = useState<DbParticipantData | null>(null);
  const [showGame, setShowGame] = useState<boolean>(false);
  const [localTime, setLocalTime] = useState<string>("");
  const [isActive, setIsActive] = useState<ComponentState>({
    activeTab: "general",
  });
  const [matchEvents, setMatchEvents] = useState<MatchTimelineDto | null>(null);
  const [gameInfoForRunes, setGameInfoForRunes] = useState<RiotMatchDto | null>(
    null,
  );

  console.log("Region:", region);
  console.log("Game info matchId:", game.info.matchId);

  useEffect(() => {
    const currentUser = game.participants?.find((p) => p.puuid === puuid);
    setUser(currentUser || null);
  }, [puuid, game.info.matchId]);

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
          p.teamId !== user.teamId,
      );
      setOpponent(opponentParticipant || null);
    }
  }, [user, puuid, game.info.matchId]);

  useEffect(() => {
    if (!showGame) return; // don't fetch on close, only on open

    let isCurrent = true;
    const controller = new AbortController();

    const fetchMatchEvents = async () => {
      try {
        const eventsRes = await fetch(
          `/api/match-events?matchId=${game.info.matchId}&region=${region}`,
          { signal: controller.signal },
        );

        if (!eventsRes.ok) {
          console.error(
            `Fetching match events failed: ${eventsRes.statusText}: status:${eventsRes.status}`,
          );
          return;
        }

        const data: MatchTimelineDto = await eventsRes.json();
        if (isCurrent) setMatchEvents(data);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error fetching match events:", err);
        }
      }
    };

    fetchMatchEvents();

    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [showGame, game.info.matchId, region]);

  useEffect(() => {
    if (!showGame) return; // don't fetch on close, only on open

    let isCurrent = true;
    const controller = new AbortController();

    const fetchGameInfoForRunesPage = async () => {
      try {
        const runesRes = await fetch(
          `/api/game-info-for-runes-page?matchId=${game.info.matchId}&region=${region}`,
          { signal: controller.signal },
        );

        if (!runesRes.ok) {
          console.error(
            `Fetching game info for runes page failed: ${runesRes.statusText}: status:${runesRes.status}`,
          );
          return;
        }

        const runesData: RiotMatchDto = await runesRes.json();
        if (isCurrent) setGameInfoForRunes(runesData);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error fetching game info for runes:", err);
        }
      }
    };

    fetchGameInfoForRunesPage();

    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [showGame, game.info.matchId, region]);

  useEffect(() => {
    if (!game.info.gameCreation) return;

    try {
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
        <div className="max-w-[468px] md:max-w-[864px] mx-auto grid grid-cols-3 items-center py-0.5">
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
      <UserVsOpponent
        user={user}
        opponent={opponent}
        showGame={showGame}
        version={version}
      />
      {/* ----------------- */}
      {showGame ? (
        <div className="">
          <section className="flex justify-center w-full">
            <Button
              className={`hover:bg-[#1B1F35] text-gray-400 bg-transparent w-1/3 py-5 rounded-none ${
                isActive.activeTab === "general" &&
                "bg-[#1B1F35] text-slate-300"
              }`}
              onClick={() => handleButtonClick("general")}
            >
              <TbListDetails
                className={`${
                  isActive.activeTab === "general"
                    ? "text-[#C8AA6E]"
                    : "text-gray-400"
                } transition-colors duration-200`}
              />
              General
            </Button>
            <Button
              className={`hover:bg-[#1B1F35] text-gray-400 bg-transparent w-1/3 py-5 rounded-none ${
                isActive.activeTab === "details" &&
                "bg-[#1B1F35] text-slate-300"
              }`}
              onClick={() => handleButtonClick("details")}
            >
              <CgChart
                className={`${
                  isActive.activeTab === "details"
                    ? "text-[#C8AA6E]"
                    : "text-gray-400"
                } transition-colors duration-200`}
              />
              Details
            </Button>
            <Button
              className={`hover:bg-[#1B1F35] text-gray-400 bg-transparent w-1/3 py-5 rounded-none ${
                isActive.activeTab === "runes" && "bg-[#1B1F35] text-slate-300"
              }`}
              onClick={() => handleButtonClick("runes")}
            >
              {isActive.activeTab === "runes" ? (
                <Image
                  src={
                    "https://raw.communitydragon.org/latest/game/assets/perks/styles/runesicon.png"
                  }
                  alt="Rune"
                  width={20}
                  height={20}
                />
              ) : (
                <Image
                  src={GrayRunesIcon}
                  alt={"Rune"}
                  width={20}
                  height={20}
                />
              )}
              Runes
            </Button>
          </section>
          {isActive.activeTab === "general" ? (
            <General
              game={game}
              puuid={puuid}
              showGame={showGame}
              region={region}
              isActive={isActive}
              version={version}
            />
          ) : isActive.activeTab === "details" ? (
            <Details
              game={game}
              puuid={puuid}
              showGame={showGame}
              region={region}
              isActive={isActive}
              matchEvents={matchEvents!}
              version={version}
            />
          ) : isActive.activeTab === "runes" ? (
            <Runes game={game} version={version} runesData={gameInfoForRunes} />
          ) : null}
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
