"use client";

import ChampionCard from "@/components/champions-page/ChampionCard";
import { ChangeEvent, useEffect, useState } from "react";

const ChampionsPage = () => {
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
          "https://ddragon.leagueoflegends.com/cdn/15.5.1/data/en_US/champion.json"
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
    <div className="flex items-center justify-center min-h-screen text-gray-100">
      <div className="container bg-[#2A2A40]/50 pt-16 border-x p-4 shadow-2xl min-h-screen border-gray-500 flex flex-col items-center justify-start">
        <input
          placeholder="Search for a champion..."
          type="search"
          className="border-b-2 border-b-white text-white text-center rounded-md p-2 my-4 text-xl w-full outline-none"
          value={searchQuery}
          onChange={(e) => handleSearch(e)}
        />
        <div className="flex justify-center items-center">
          {isLoading && (
            <div className="loader animate-spin ease-linear rounded-full border-y-4 border-cyan-500 h-12 w-12" />
          )}
          {error && <p className="text-red-500">Error: {error}</p>}
        </div>
        {posts && !isLoading && (
          <div className="container flex flex-col items-center justify-center">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-10 gap-2">
              {filteredChampions.map((champion) => (
                <div
                  key={champion.id}
                  className="hover:shadow-2xl transition-all duration-200 cursor-pointer"
                >
                  <ChampionCard
                    name={champion.name}
                    title={champion.title}
                    role={champion.tags[0]}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ChampionsPage;
