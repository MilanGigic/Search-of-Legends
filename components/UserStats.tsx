"use client";

import { useEffect, useState } from "react";

interface UserStatsProps {
  games: {
    id: string;
    data: DbGameInfo | null;
  }[];
  matchHistory: string[];
}

const UserStats = ({ games, matchHistory }: UserStatsProps) => {
  const [champions, setChampions] = useState<ChampionDetail[]>([]);

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
        const championData = data.data;

        setChampions(Object.values(championData));
        console.log("Champions:", champions);
      } catch (error) {
        console.error("Error fetching champions", error);
        return null;
      }
    };
    fetchChampions();
  }, []);

  console.log("Games:", games);

  return <div>UserStats</div>;
};
export default UserStats;
