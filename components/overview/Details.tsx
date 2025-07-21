"use client";

import Image from "next/image";
import { ComponentState, useEffect, useMemo, useState } from "react";
import { MdKeyboardArrowRight } from "react-icons/md";
import SpellCard from "../champions-page/SpellCard";

const Details = ({
  game,
  puuid,
  showGame,
  region,
  isActive,
  matchEvents,
}: {
  game: DbGameInfo;
  puuid: string;
  showGame: boolean;
  region: string;
  isActive: ComponentState;
  matchEvents: MatchTimelineDto;
}) => {
  const [selectedParticipantId, setSelectedParticipantId] = useState<number>(1);
  const [champion, setChampion] = useState<ChampionDetail | null>(null);

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
    return `https://ddragon.leagueoflegends.com/cdn/15.14.1/img/champion/${mappedName}.png`;
  };

  const participantEvents = useMemo(() => {
    if (!matchEvents?.info?.frames) return [];

    return matchEvents.info.frames.flatMap((frame) =>
      frame.events.filter(
        (event) => event.participantId === selectedParticipantId
      )
    );
  }, [matchEvents, selectedParticipantId]);

  useEffect(() => {
    console.log(
      "Events for participant",
      selectedParticipantId,
      participantEvents
    );
  }, [participantEvents, selectedParticipantId]);

  const groupedItemEvents = useMemo(() => {
    if (!matchEvents?.info?.frames) {
      console.log("No frames in matchEvents");
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
          event.type === "SKILL_LEVEL_UP"
      )
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
      console.log("Fetching champion spell data...");
      const participant = game.participants.find(
        (participant) => participant.participantId === selectedParticipantId
      );
      if (!participant) {
        console.log(
          "No participant found for selectedParticipantId:",
          selectedParticipantId
        );
        return;
      }

      console.log("Fetching data for champion:", participant.championName);
      const champRes = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/15.14.1/data/en_US/champion/${participant.championName}.json`
      );

      if (!champRes.ok) {
        console.error(`Error fetching data for: ${participant.championName}`);
        return;
      }

      const data: ChampionDetailData = await champRes.json();
      console.log("Fetched champion data:", data);

      const champData = data.data;
      const championDetail = champData[participant.championName!];

      setChampion(championDetail);
      console.log("Set champion state");
    };

    getChampionSpell();
  }, [selectedParticipantId]);

  useEffect(() => {
    console.log("Champion state data:", champion);
  }, [selectedParticipantId]);

  const SPELLS = ["Q", "W", "E", "R"];
  return (
    <div className="bg-gradient-to-b from-[#121624] to-[#1B1F35] w-full p-4">
      <header className="flex justify-between">
        {game.participants.map((participant) => (
          <ul key={participant.puuid}>
            <Image
              src={getChampionImageUrl(participant.championName!)}
              width={40}
              height={40}
              className={`sm:w-12 sm:h-12 rounded-full hover:opacity-50 cursor-pointer ${
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
        ))}
      </header>
      <div className="w-full flex gap-4">
        {/* @15 stats */}
        <div className="w-1/2 p-2 mt-4 border border-gray-700/70 shadow-sm shadow-[#2A2A40] bg-gradient-to-b from-[#1e2238] to-[#2a2f4a] rounded-md items-center">
          <h1>Laning Phase</h1>
        </div>
        {/* Global Stats */}
        <div className="w-1/2 p-2 mt-4 border border-gray-700/70 shadow-sm shadow-[#2A2A40] bg-gradient-to-b from-[#1e2238] to-[#2a2f4a] rounded-md items-center">
          <h1>Global Stats</h1>
        </div>
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
                        src={`https://ddragon.leagueoflegends.com/cdn/15.14.1/img/item/${item.itemId}.png`}
                        alt={`Item ${item.itemId}`}
                        width={25}
                        height={25}
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
                  participant.participantId === selectedParticipantId
              )
              .map((participant) => (
                <div key={participant.puuid} className="flex flex-col gap-1">
                  {SPELLS.map((spell, index) => (
                    <div
                      key={index}
                      className="relative h-7 flex items-center mb-1"
                    >
                      <Image
                        src={`https://ddragon.leagueoflegends.com/cdn/15.14.1/img/spell/${champion?.spells[index].image.full}`}
                        alt={`${participant.championName} ${champion?.id}`}
                        width={32}
                        height={32}
                        className="rounded border border-gray-600"
                      />
                      <div className="absolute -right-1 -top-1 w-4 h-4 bg-gray-700 rounded-full border border-gray-500 flex items-center justify-center">
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
                        skill.skillSlot === skillSlot
                    );

                    if (!skillAtLevel) {
                      return (
                        <div
                          key={level}
                          className="w-7 h-7 border border-gray-600/30 rounded bg-transparent flex items-center justify-center"
                        >
                          {/* Empty slot */}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={level}
                        className={`w-7 h-7 bg-[#121624] rounded flex items-center justify-center border border-gray-300`}
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
