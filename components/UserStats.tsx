"use client";

import { useEffect, useState } from "react";

interface UserStatsProps {
  matchHistory: string[];
  puuid: string;
}

const UserStats = ({ matchHistory, puuid }: UserStatsProps) => {
  const [championData, setChampionData] = useState<ChampionDetailData | null>(
    null
  );

  useEffect(() => {
    const fetchChampions = async () => {
      try {
        const res = await fetch(
          "https://ddragon.leagueoflegends.com/cdn/15.10.1/data/en_US/champion.json"
        );

        if (!res.ok) {
          console.error("Failed to fetch champions", res.statusText);
        }

        const data: ChampionDetailData = await res.json();
        setChampionData(data);
      } catch (error) {
        console.error("Error fetching champions", error);
        return null;
      }
    };
    fetchChampions();
  }, [puuid]);

  return <div className="h-full border">UserStats</div>;
};
export default UserStats;
