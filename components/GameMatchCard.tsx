"use client";
import { calculateAccurateGameDuration } from "@/lib/riot";
import { Button } from "@/components/ui/button";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { useEffect, useState } from "react";
// import General from "./General";
// import UserVsOpponent from "./UserVsOpponent";
import Link from "next/link";

const GameMatchCard = ({
  game,
  currentPuuid,
  region,
  currentPage,
}: {
  game: RiotMatchDto;
  currentPuuid: string;
  region: string;
  currentPage: number;
}) => {
  const [user, setUser] = useState<ParticipantData | null>(null);
  const [opponent, setOpponent] = useState<ParticipantData | null>(null);
  const [showGame, setShowGame] = useState<boolean>(false);
  const [localTime, setLocalTime] = useState<string>("");
  const [queueId, setQueueId] = useState<string>("");

  useEffect(() => {
    const currentUser = game.info.participants?.find(
      (p) => p.puuid === currentPuuid
    );
    setUser(currentUser || null);
  }, [currentPuuid, game]);

  useEffect(() => {
    if (user) {
      const opponentParticipant = game.info.participants?.find(
        (p) =>
          p.puuid !== currentPuuid &&
          p.teamPosition === user.teamPosition &&
          p.teamId !== user.teamId
      );
      setOpponent(opponentParticipant || null);
    }
  }, [user, currentPuuid, game]);

  useEffect(() => {
    const timeStamp = game.info.gameCreation;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const formatted = new Date(timeStamp!).toLocaleString(undefined, {
      timeZone: timeZone,
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    setLocalTime(formatted);
  }, []);

  // useEffect(() => {
  //   {game.info.queueId === 420
  //                 ? "Solo/Duo"
  //                 : game.info.queueId === 400
  //                 ? "Normal Draft"
  //                 : game.info.queueId === 490
  //                 ? "Quickplay"
  //                 : game.info.queueId === 440
  //                 ? "Flex"
  //                 : game.info.queueId === 450
  //                 ? "ARAM"
  //                 : game.info.queueId === 880
  //                 ? "Co-op vs Beginner"
  //                 : game.info.queueId === 890
  //                 ? "Co-op vs Intermediate"
  //                 : game.info.queueId === 900
  //                 ? "ARURF"
  //                 : game.info.queueId === 1020
  //                 ? "One for All"
  //                 : game.info.queueId === 1400
  //                 ? "Ultimate Spellbook"
  //                 : game.info.queueId === 1300
  //                 ? "Nexus Blitz"
  //                 : game.info.queueId === 1700
  //                 ? "Arena"
  //                 : game.info.queueId === 1710
  //                 ? "Arena"
  //                 : ""}
  // }, [])
};
