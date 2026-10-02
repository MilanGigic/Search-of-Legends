"use client";

import Image from "next/image";
import { ComponentState, useEffect, useMemo, useState } from "react";
import { MdKeyboardArrowRight } from "react-icons/md";
import { GiCrossedSwords } from "react-icons/gi";
import ward from "@/assets/icons/ward-icon.png";
import helmet from "@/assets/icons/helmet.png";
import VSIcon from "@/assets/icons/VSIcon.png";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

const Details = ({
  game,
  puuid,
  showGame,
  region,
  isActive,
  matchEvents,
  version,
}: {
  game: DbGameInfo;
  puuid: string;
  showGame: boolean;
  region: string;
  isActive: ComponentState;
  matchEvents: MatchTimelineDto;
  version: string;
}) => {
  const [selectedParticipantId, setSelectedParticipantId] = useState<number>(1);
  const [champion, setChampion] = useState<ChampionDetail | null>(null);

  const [user, setUser] = useState<DbParticipantData | null>(null);
  const [opponent, setOpponent] = useState<DbParticipantData | null>(null);

  const getChampionImageUrl = (championName: string) => {
    const championMap: { [key: string]: string } = {
      "Aurelion Sol": "AurelionSol",
      "Bel'Veth": "Belveth",
      "Cho'Gath": "Chogath",
      "Dr. Mundo": "DrMundo",
      "Jarvan IV": "JarvanIV",
      "Kai'Sa": "Kaisa",
      "Kog'Maw": "Kogmaw",
      "Kha'Zix": "Khazix",
      "K'Sante": "KSante",
      LeBlanc: "Leblanc",
      "Lee Sin": "LeeSin",
      "Master Yi": "MasterYi",
      "Miss Fortune": "MissFortune",
      Wukong: "MonkeyKing",
      "Nunu & Willump": "Nunu",
      "Rek'Sai": "RekSai",
      "Tahm Kench": "TahmKench",
      "Twisted Fate": "TwistedFate",
      "Vel'Koz": "Velkoz",
      "Xin Zhao": "XinZhao",
      FiddleSticks: "Fiddlesticks",
    };

    const mappedName = championMap[championName] || championName;
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${mappedName}.png`;
  };

  useEffect(() => {
    const currentUser = game.participants?.find(
      (p) => p.participantId === selectedParticipantId,
    );
    setUser(currentUser || null);
  }, [selectedParticipantId, game]);

  useEffect(() => {
    if (user) {
      const opponentParticipant = game.participants?.find(
        (p) =>
          p.participantId !== selectedParticipantId &&
          p.teamPosition === user.teamPosition &&
          p.teamId !== user.teamId,
      );
      setOpponent(opponentParticipant || null);
    }
  }, [user, selectedParticipantId, game]);

  const participantEvents = useMemo(() => {
    if (!matchEvents?.info?.frames) return [];

    return matchEvents.info.frames.flatMap((frame) =>
      frame.events.filter(
        (event) => event.participantId === selectedParticipantId,
      ),
    );
  }, [matchEvents, selectedParticipantId]);

  const userEvents = useMemo(() => {
    if (!matchEvents?.info?.frames) return [];

    return matchEvents.info.frames.flatMap((frame) =>
      Object.values(frame.participantFrames).filter(
        (event) => event.participantId === selectedParticipantId,
      ),
    );
  }, [matchEvents, selectedParticipantId]);

  const opponentEvents = useMemo(() => {
    if (!matchEvents?.info?.frames) return [];

    return matchEvents.info.frames.flatMap((frame) =>
      Object.values(frame.participantFrames).filter(
        (event) => event.participantId === opponent?.participantId,
      ),
    );
  }, [matchEvents, opponent]);

  const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

  const targetFrameIndex = useMemo(() => {
    const frameInterval = matchEvents?.info?.frameInterval;
    if (!frameInterval) return -1;

    const idx = Math.round(FIFTEEN_MINUTES_MS / frameInterval);
    return Math.min(idx, userEvents.length - 1);
  }, [matchEvents, userEvents.length]);

  const userAndOpponentDifference = useMemo(() => {
    if (!userEvents.length || !opponentEvents.length || targetFrameIndex < 0) {
      return null;
    }

    const userAtTarget = userEvents[targetFrameIndex];
    const opponentAtTarget = opponentEvents[targetFrameIndex];

    if (!userAtTarget || !opponentAtTarget) return null;

    return {
      user: {
        gold: userAtTarget.totalGold,
        level: userAtTarget.level,
        minions: userAtTarget.minionsKilled + userAtTarget.jungleMinionsKilled,
        damageDone: userAtTarget.damageStats?.totalDamageDoneToChampions,
      },
      opponent: {
        gold: opponentAtTarget.totalGold,
        level: opponentAtTarget.level,
        minions:
          opponentAtTarget.minionsKilled + opponentAtTarget.jungleMinionsKilled,
        damageDone: opponentAtTarget.damageStats?.totalDamageDoneToChampions,
      },
    };
  }, [userEvents, opponentEvents, targetFrameIndex]);

  const groupedItemEvents = useMemo(() => {
    if (!matchEvents?.info?.frames) {
      return [];
    }

    const ITEM_GROUP_WINDOW_MS = 30000; // 30 seconds

    const allItemEvents: ItemEvents[] = [];
    // Flatten all item purchase events for the selected participant
    matchEvents?.info?.frames.forEach((frame) => {
      frame.events.forEach((event) => {
        if (
          event.participantId === selectedParticipantId &&
          event.type === "ITEM_PURCHASED"
        ) {
          allItemEvents.push({
            itemId: event.itemId!,
            timestamp: event.timestamp,
          });
        }
      });
    });

    // Sort events by timestamp
    allItemEvents.sort((a, b) => a.timestamp - b.timestamp);

    // Group by 30s window
    const groupedItemEvents: GroupedItemEvent[] = [];

    let currentGroupStart = -1;
    let currentGroup: Record<number, number> = {};

    allItemEvents.forEach((event) => {
      if (
        currentGroupStart === -1 ||
        event.timestamp - currentGroupStart > ITEM_GROUP_WINDOW_MS
      ) {
        // Save previous group if exists
        if (currentGroupStart !== -1) {
          groupedItemEvents.push({
            timestamp: currentGroupStart,
            items: Object.entries(currentGroup).map(([itemId, count]) => ({
              itemId: Number(itemId),
              count,
            })),
          });
        }

        // Start a new group
        currentGroupStart = event.timestamp;
        currentGroup = {};
      }

      currentGroup[event.itemId] = (currentGroup[event.itemId] || 0) + 1;
    });

    // Push final group
    if (currentGroupStart !== -1 && Object.keys(currentGroup).length > 0) {
      groupedItemEvents.push({
        timestamp: currentGroupStart,
        items: Object.entries(currentGroup).map(([itemId, count]) => ({
          itemId: Number(itemId),
          count,
        })),
      });
    }
    return groupedItemEvents;
  }, [matchEvents, selectedParticipantId]);

  const skills = useMemo(() => {
    if (!matchEvents?.info?.frames) return [];

    return matchEvents.info.frames.flatMap((frame) =>
      frame.events.filter(
        (event) =>
          event.participantId === selectedParticipantId &&
          event.type === "SKILL_LEVEL_UP",
      ),
    );
  }, [selectedParticipantId, matchEvents]);

  function formatTimestamp(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  useEffect(() => {
    const getChampionSpell = async () => {
      const participant = game.participants.find(
        (participant) => participant.participantId === selectedParticipantId,
      );
      if (!participant) {
        return;
      }

      const champRes = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion/${participant.championName}.json`,
      );

      if (!champRes.ok) {
        console.error(`Error fetching data for: ${participant.championName}`);
        return;
      }

      const data: ChampionDetailData = await champRes.json();

      const champData = data.data;
      const championDetail = champData[participant.championName!];

      setChampion(championDetail);
    };

    getChampionSpell();
  }, [selectedParticipantId]);

  useEffect(() => {}, [selectedParticipantId]);
  useEffect(() => {}, []);

  if (!game.participants || game.participants.length === 0) {
    return <div>Loading game data...</div>;
  }

  const SPELLS = ["Q", "W", "E", "R"];
  return (
    <div className="bg-gradient-to-b from-[#121624] to-[#1B1F35] w-full p-4 animate-fade-down animate-duration-300 animate-ease-in-out">
      <header className="grid grid-cols-5 gap-1">
        {game.participants.map((participant, index) => (
          <div key={index}>
            <ul className="flex justify-center">
              <Image
                src={getChampionImageUrl(participant.championName!)}
                width={100}
                height={100}
                className={`w-14 h-14 sm:w-12 sm:h-12 rounded-full hover:opacity-50 cursor-pointer ${
                  selectedParticipantId === participant.participantId
                    ? "opacity-50"
                    : ""
                }`}
                alt={participant.championName!}
                onClick={() =>
                  setSelectedParticipantId(participant.participantId!)
                }
              />
            </ul>
            {index === 2 ? (
              <h1 className="col-span-5 my-8 w-full flex justify-center">
                <Image
                  src={VSIcon}
                  alt={"VS"}
                  width={100}
                  height={100}
                  className="scale-130 absolute top-14 sm:top-12"
                />
              </h1>
            ) : null}
          </div>
        ))}
      </header>
      <div className="w-full flex gap-4">
        {/* @15 stats */}
        <div className="w-1/3 p-2 mt-4 border border-gray-700/70 shadow-sm shadow-[#2A2A40] bg-gradient-to-b from-[#1e2238] to-[#2a2f4a] rounded-md flex flex-col items-center">
          <header className="text-sm sm:text-base text-slate-300 font-semibold mb-2 ml-2 text-center items-center flex flex-col sm:flex-row gap-1">
            <Image
              src={`https://wiki.leagueoflegends.com/en-us/images/Duelist_TFT_icon.svg?c69f3`}
              alt={`${(
                <GiCrossedSwords className="text-center items-center flex flex-col w-[20px] h-[20px]" />
              )}`}
              height={100}
              width={100}
              className="text-center w-5 h-5 items-center flex flex-col"
            />
            Laning Phase (at 15)
          </header>
          <main className="flex gap-2 flex-col sm:flex-row">
            <p className="flex flex-col tracking-tight text-center">
              {userAndOpponentDifference?.user.minions! -
                userAndOpponentDifference?.opponent.minions! >
              0
                ? "+"
                : ""}
              {userAndOpponentDifference?.user.minions! -
                userAndOpponentDifference?.opponent.minions!}
              <span className="text-gray-400 text-xs font-semibold">
                CS diff
              </span>
            </p>
            <p className="flex flex-col tracking-tight text-center">
              {userAndOpponentDifference?.user.gold! -
                userAndOpponentDifference?.opponent.gold! >
              0
                ? "+"
                : ""}
              {userAndOpponentDifference?.user.gold! -
                userAndOpponentDifference?.opponent.gold!}
              <span className="text-gray-400 text-xs font-semibold">
                Gold Diff
              </span>
            </p>
            <p className="flex flex-col tracking-tight text-center">
              {userAndOpponentDifference?.user.level! -
                userAndOpponentDifference?.opponent.level! >
              0
                ? "+"
                : ""}
              {userAndOpponentDifference?.user.level! -
                userAndOpponentDifference?.opponent.level!}
              <span className="text-gray-400 text-xs font-semibold">
                LvL Diff
              </span>
            </p>
          </main>
        </div>
        {user && (
          <div className="w-1/3 p-2 mt-4 border border-gray-700/70 shadow-sm shadow-[#2A2A40] bg-gradient-to-b from-[#1e2238] to-[#2a2f4a] rounded-md items-center flex flex-col">
            <header className="text-base text-slate-300 font-semibold items-center flex gap-1 mb-2 flex-col sm:flex-row">
              <Image
                src={ward}
                alt="ward"
                height={100}
                width={100}
                className="text-center w-5 h-5 items-center flex flex-col"
              />{" "}
              Wards
            </header>
            <main className="flex gap-2 flex-col sm:flex-row">
              <p className="flex flex-col tracking-tight text-center">
                {user.wardsPlaced}
                <span className="text-gray-400 text-xs font-semibold">
                  Placed
                </span>
              </p>
              <p className="flex flex-col tracking-tight text-center">
                {user.detectorWardsPlaced}
                <span className="text-gray-400 text-xs font-semibold">
                  Control
                </span>
              </p>
              <p className="flex flex-col tracking-tight text-center">
                {user.wardsKilled}
                <span className="text-gray-400 text-xs font-semibold">
                  Destroyed
                </span>
              </p>
              <p className="flex flex-col tracking-tight text-center">
                {user.visionScore}
                <span className="text-gray-400 text-xs font-semibold">
                  Score
                </span>
              </p>
            </main>
          </div>
        )}

        {/* Global Stats */}
        {user && (
          <div className="w-1/3 p-2 mt-4 border border-gray-700/70 shadow-sm shadow-[#2A2A40] bg-gradient-to-b from-[#1e2238] to-[#2a2f4a] rounded-md flex flex-col items-center">
            <header className="text-base text-slate-300 font-semibold items-center gap-1 flex mb-2 flex-col sm:flex-row">
              <Image
                src={helmet}
                alt="ward"
                height={100}
                width={100}
                className="text-center w-5 h-5 items-center flex flex-col"
              />{" "}
              Global Stats
            </header>
            <main className="flex gap-2 flex-col sm:flex-row">
              <p className="flex flex-col tracking-tight text-center">
                {(
                  user!.totalDamageDealtToChampions! /
                  (user!.timePlayed! / 60)
                ).toFixed(0)}
                <span className="text-gray-400 text-xs font-semibold">DPM</span>
              </p>
              <p className="flex flex-col tracking-tight text-center">
                {(user!.totalMinionsKilled! / (user!.timePlayed! / 60)).toFixed(
                  1,
                )}
                <span className="text-gray-400 text-xs font-semibold">
                  CS/m
                </span>
              </p>
              <p className="flex flex-col tracking-tight text-center">
                {(user.goldEarned! / (user.timePlayed! / 60)).toFixed(0)}
                <span className="text-gray-400 text-xs font-semibold">
                  Gold/m
                </span>
              </p>
            </main>
          </div>
        )}
      </div>
      {/* ITEMIZATION */}
      <div className="w-full mt-4 border border-gray-700/70 shadow-sm shadow-[#2A2A40] bg-gradient-to-b from-[#1e2238] to-[#2a2f4a] rounded-md items-center">
        <div className="flex items-start flex-wrap justify-center p-2">
          {groupedItemEvents!.map((group, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center p-1">
                <div className="flex gap-0.5 items-center">
                  {group.items.map((item) => (
                    <div key={item.itemId} className="relative">
                      <Image
                        src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item.itemId}.png`}
                        alt={`Item ${item.itemId}`}
                        width={100}
                        height={100}
                        className="w-8 h-8"
                      />
                      {item.count > 1 && (
                        <span className="absolute bottom-0 right-0 bg-black text-white text-[10px] rounded">
                          x{item.count}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-300">
                  {formatTimestamp(group.timestamp)}
                </p>
              </div>
              {i < groupedItemEvents!.length - 1 && (
                <MdKeyboardArrowRight className="mx-1 text-gray-300" />
              )}
            </div>
          ))}
        </div>
        <div className="text-base text-slate-300 font-semibold my-2 text-center">
          ITEMIZATION
        </div>
      </div>

      {/* SKILL LEVELING */}
      <div className="w-full mt-4 border border-gray-700/70 shadow-sm shadow-[#2A2A40] rounded-md bg-gradient-to-b from-[#1e2238] to-[#2a2f4a] p-4">
        <div className="flex items-start gap-4">
          {/* Left side - Spell Icons */}
          <div className="flex flex-col">
            {game.participants
              .filter(
                (participant) =>
                  participant.participantId === selectedParticipantId,
              )
              .map((participant) => (
                <div key={participant.puuid} className="flex flex-col gap-1">
                  {SPELLS.map((spell, index) => (
                    <div
                      key={index}
                      className="relative h-7 flex items-center mb-1"
                    >
                      <Image
                        src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${champion?.spells[index].image.full}`}
                        alt={`${participant.championName} ${champion?.id}`}
                        width={32}
                        height={32}
                        className="rounded border border-gray-600 hidden sm:block"
                      />
                      <div className="sm:absolute sm:-right-1 sm:-top-1 w-2 h-2 sm:w-4 sm:h-4 bg-gray-700 rounded-full border border-gray-500 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {spell}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
          </div>

          {/* Right side - Skill Progression Grid */}
          <div className="">
            {/* Create 4 rows for Q, W, E, R */}
            <div className="flex flex-col gap-1">
              {[1, 2, 3, 4].map((skillSlot) => (
                <div
                  key={skillSlot}
                  className="grid gap-0.5 h-7 items-center mb-1"
                  style={{ gridTemplateColumns: "repeat(18, 1fr)" }}
                >
                  {Array.from({ length: 18 }, (_, level) => {
                    const levelNumber = level + 1;
                    // Find if this skill slot was leveled at this level
                    const skillAtLevel = skills.find(
                      (skill, index) =>
                        index + 1 === levelNumber &&
                        skill.skillSlot === skillSlot,
                    );

                    if (!skillAtLevel) {
                      return (
                        <div
                          key={level}
                          className="w-4 h-4 sm:w-7 sm:h-7 border border-gray-600/30 rounded bg-transparent flex items-center justify-center"
                        >
                          {/* Empty slot */}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={level}
                        className={`w-4 h-4 sm:w-7 sm:h-7 bg-[#121624] rounded flex items-center justify-center border border-gray-300`}
                      >
                        <span className="text-xs font-bold text-slate-300">
                          {levelNumber}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-base text-slate-300 font-semibold mt-2 text-center">
          SKILL ORDER
        </div>
      </div>
    </div>
  );
};
export default Details;
