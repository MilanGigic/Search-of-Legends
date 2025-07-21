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
              className="sm:w-12 sm:h-12 rounded-full hover:opacity-50 cursor-pointer"
              alt={participant.championName!}
              onClick={() =>
                setSelectedParticipantId(participant.participantId!)
              }
            />
          </ul>
        ))}
      </header>
      {/* ITEMIZATION */}
      <div className="w-full mt-4 border border-gray-700/70 shadow-sm shadow-[#2A2A40] rounded-md flex bg-gradient-to-b from-[#1e2238] to-[#2a2f4a] justify-center flex-wrap gap-2 p-2 items-center">
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
                      <span className="absolute bottom-0 right-0 bg-black text-white text-xs rounded">
                        x{item.count}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-sm text-gray-300">
                {formatTimestamp(group.timestamp)}
              </p>
            </div>
            {i < groupedItemEvents!.length - 1 && (
              <MdKeyboardArrowRight className="mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* SKILL LEVELING */}
      <div className="w-full mt-4 border border-gray-700/70 shadow-sm shadow-[#2A2A40] rounded-md flex bg-gradient-to-b from-[#1e2238] to-[#2a2f4a] justify-center flex-wrap gap-2 p-2 items-center">
        <div className="border w-full flex p-2">
          {game.participants
            .filter((participant) => participant.puuid === puuid)
            .map((participant) => (
              <div
                key={participant.puuid}
                className="flex flex-col gap-2 items-center"
              >
                {SPELLS.map((spell, index) => (
                  <Image
                    src={`https://ddragon.leagueoflegends.com/cdn/15.14.1/img/spell/${participant.championName}${spell}.png`}
                    alt={`${participant.championName} ${spell}`}
                    width={30}
                    height={30}
                    key={index}
                  />
                ))}
              </div>
            ))}
          {skills.map((skill, index) => (
            <div>{skill.skillSlot}</div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Details;
