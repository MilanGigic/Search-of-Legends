"use client";
import { calculateAccurateGameDuration } from "@/lib/riot";
import { Button } from "@/components/ui/button";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import UserVsOpponent from "./UserVsOpponent";
import General from "./General";

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
  const [queueId, setQueueId] = useState<string>("");

  useEffect(() => {
    const currentUser = game.participants?.find((p) => p.puuid === puuid);
    setUser(currentUser || null);
  }, [puuid, game]);

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
    const timeStamp = game.info.gameCreation;
    if (!timeStamp) return;

    console.log("gameCreation:", game.info.gameCreation);

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const formatted = new Date(timeStamp).toLocaleString(undefined, {
      timeZone: timeZone,
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    setLocalTime(formatted);
  }, [game.info.gameCreation]);

  return (
    <div className="container mx-auto text-white">
      {/* User vs Opponent */}
      <div className={`${showGame ? "rounded-t-md" : ""} bg-[#2A2A40] w-full`}>
        <div className="max-w-[765px] mx-auto grid grid-cols-3 items-center py-1.5">
          <h1 className="text-amber-500 text-center">
            {user?.riotIdGameName}#{user?.riotIdTagline}
          </h1>

          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center justify-center text-sm font-light text-gray-300">
              <p className="italic text-sm w-full items-center text-center">
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
              <p className="flex items-center w-full">
                <strong className="mr-1 font-bold text-gray-300">
                  {localTime}
                </strong>{" "}
                / {calculateAccurateGameDuration(user?.timePlayed!)}
              </p>
            </div>
          </div>
          <Link
            href={`${opponent?.riotIdGameName}-${opponent?.riotIdTagline}?region=${region}`}
          >
            <h1 className="items-center text-center">
              {opponent?.riotIdGameName}#{opponent?.riotIdTagline}
            </h1>
          </Link>
        </div>
      </div>
      <UserVsOpponent user={user} opponent={opponent} showGame={showGame} />
      {/* ----------------- */}
      {showGame ? (
        <div className="m-0">
          <section className="flex justify-center max-w-3xl mx-auto w-full">
            <Button
              className={`hover:bg-[#2A2A40] w-1/3 py-5 disabled:bg-blue-950/50 rounded-none`}
            >
              General
            </Button>
            <Button className={`hover:bg-[#2A2A40] w-1/3 py-5 rounded-none`}>
              Details
            </Button>
            <Button className={`hover:bg-[#2A2A40] w-1/3 py-5 rounded-none`}>
              Runes
            </Button>
          </section>
          <General
            game={game}
            puuid={puuid}
            showGame={showGame}
            region={region}
          />
        </div>
      ) : (
        <div></div>
      )}
      <Button
        className={`w-full items-center justify-center hover:bg-[#2A2A40] rounded-t-none pt-2`}
        onClick={() => setShowGame(!showGame)}
      >
        {showGame ? <ArrowUpIcon /> : <ArrowDownIcon />}
      </Button>
    </div>
  );
};

export default GameMatchCard;
