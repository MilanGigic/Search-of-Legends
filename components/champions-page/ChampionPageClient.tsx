"use client";

import ChampionCard from "@/components/champions-page/ChampionCard";
import { ChangeEvent, useEffect, useState } from "react";

const ChampionPageClient = ({ version }: { version: string }) => {
  const [posts, setPosts] = useState<ChampionDetailData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredChampions, setFilteredChampions] = useState<ChampionDetail[]>(
    []
  );

  useEffect(() => {
    async function fetchPosts() {
      try {
        setIsLoading(true);
        const res = await fetch(
          `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
        );
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
        }
        const data: ChampionDetailData = await res.json();
        setPosts(data);
        setFilteredChampions(Object.values(data.data));
        setError(null);
      } catch (error) {
        console.error("Error fetching champions data:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, []);

  useEffect(() => {
    if (!posts) return;

    const query = searchQuery.toLowerCase().trim();
    if (query === "") {
      setFilteredChampions(Object.values(posts.data));
      return;
    }

    const filtered = Object.values(posts.data).filter(
      (champion) =>
        champion.name.toLowerCase().includes(query) ||
        champion.tags.some((tag) => tag.toLowerCase().includes(query))
    );

    setFilteredChampions(filtered);
  }, [searchQuery, posts]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  return (
    <div className="bg-gradient-to-b w-full z-10 from-[#1B1F35] to-[#121624] shadow-sm shadow-[#2A2A40] border border-gray-700/70 mt-4 max-w-6xl">
      <input
        placeholder="Search for a champion..."
        type="search"
        className="border-b-2 border-slate-400 shadow-[#2A2A40] text-white text-center rounded-md p-2 my-4 text-xl w-full outline-none"
        value={searchQuery}
        onChange={(e) => handleSearch(e)}
      />
      {isLoading && (
        <div className="flex justify-center items-center">
          <div className="loader animate-spin ease-linear rounded-full border-y-4 border-cyan-500 h-12 w-12" />
          {error && <p className="text-red-500">Error: {error}</p>}
        </div>
      )}
      {posts && !isLoading && (
        <div className="flex flex-col max-w-4xl items-center justify-center mt-4 mx-auto">
          <div className="grid grid-cols-4 md:grid-cols-7 lg:grid-cols-8 gap-2">
            {filteredChampions.map((champion) => (
              <div key={champion.id} className="cursor-pointer">
                <ChampionCard
                  name={champion.name}
                  title={champion.title}
                  champion={champion}
                  role={champion.tags[0]}
                  version={version}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default ChampionPageClient;
