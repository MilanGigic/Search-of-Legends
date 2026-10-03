"use client";

import { AccountWithHistory } from "@/actions/fetchAccountByName";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ParticipantCard } from "./ParticipantCard";
import { SoloRank } from "@/lib/riot-rank";

type ChampionLookup = Record<number, { id: string; name: string }>;

export default function ClientLivePage({
  accountData,
  version,
  championsByKey,
  spellsByKey,
  runeIcons,
}: {
  accountData: AccountWithHistory;
  version: string;
  championsByKey: ChampionLookup;
  spellsByKey: Record<number, string>;
  runeIcons: Record<number, string>;
}) {
  const [data, setData] = useState<CurrentGameInfo | null>(null);

  const [ranks, setRanks] = useState<Record<string, SoloRank>>({});

  useEffect(() => {
    if (!data?.participants) return;
    const puuids = data.participants.map((p) => p.puuid).filter(Boolean);

    fetch("/api/get-ranks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ puuids, region: accountData.region }),
    })
      .then((r) => r.json())
      .then(setRanks)
      .catch(() => {});
  }, [data, accountData.region]);

  useEffect(() => {
    (async () => {
      const res = await fetch(
        `/api/get-live-match?puuid=${accountData.puuid}&region=${accountData.region}`,
        {
          method: "GET",
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setData(null); // or set an error state
        return;
      }
      setData(data);
    })();
  }, [accountData.puuid, accountData.region]);

  console.log("Region:", accountData.region);

  if (!data) {
    return <div>Not in game</div>;
  }

  const blueTeamParticipants =
    data.participants?.filter((p) => p.teamId === 100) || [];
  const redTeamParticipants =
    data.participants?.filter((p) => p.teamId === 200) || [];

  console.log("Game id:", data.gameQueueConfigId);

  const renderTeam = (participants: typeof blueTeamParticipants) => (
    <div className="flex w-full flex-col items-center gap-4 lg:flex-row lg:gap-3">
      {participants.map((participant) => (
        <div key={participant.puuid} className="w-full">
          <ParticipantCard
            participant={participant}
            version={version}
            champ={championsByKey[participant.championId]}
            spellsByKey={spellsByKey}
            runeIcons={runeIcons}
            rank={ranks[participant.puuid] || null}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-4 w-full p-8">
      <div className="flex w-full justify-between">
        {renderTeam(blueTeamParticipants)}
      </div>
      <div className="flex w-full justify-between">
        {renderTeam(redTeamParticipants)}
      </div>
    </div>
  );
}
