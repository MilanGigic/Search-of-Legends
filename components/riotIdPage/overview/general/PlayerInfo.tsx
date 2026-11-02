import Image from "next/image";
import Link from "next/link";

type PlayerInfoProps = {
  version: string;
  participant: DbParticipantData;
  puuid: string;
};

export default function PlayerInfo({
  version,
  participant,
  puuid,
}: PlayerInfoProps) {
  return (
    <div className="flex-1 min-w-0 flex justify-center items-center">
      {/* Items and Summoner Spells */}
    </div>
  );
}
