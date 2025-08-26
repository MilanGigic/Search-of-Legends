"use client";

import ChampionCard from "@/components/champions-page/ChampionCard";
import ChampionHoverPreview from "@/components/champions-page/ChampionHoverPreview";
import { fetchLatestVersion } from "@/lib/riot";
import { ChangeEvent, useEffect, useState } from "react";

const ChampionsPage = () => {
  const [posts, setPosts] = useState<ChampionDetailData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredChampions, setFilteredChampions] = useState<ChampionDetail[]>(
    []
  );
  // const [top10Champions, setTop10Champions] = useState<
  //   Record<string, number>[]
  // >([]);

  // useEffect(() => {
  //   const fetchTop10Champions = async () => {
  //     try {
  //       const res = await fetch(
  //         `${process.env.NEXT_PUBLIC_BASE_URL}/api/most-popular-champions`,
  //         {
  //           method: "GET",
  //         }
  //       );
  //       if (!res.ok) {
  //         throw new Error(`Failed to fetch, ${res.status} ${res.statusText}`);
  //       }
  //       const data: Record<string, number>[] = await res.json();
  //       setTop10Champions(data);
  //       console.log("Top 10 Champions:", data);
  //     } catch (error) {
  //       console.error("Error fetching top 10 champions:", error);
  //     }
  //   };
  //   fetchTop10Champions();
  // }, []);
  // useEffect(() => {
  //   const fetchVersion = async () => {

  //     console.log("Version:", version);

  //     setLatestVersion(version!);
  //   };

  //   fetchVersion();
  // }, []);

  useEffect(() => {
    async function fetchPosts() {
      const version = await fetchLatestVersion();
      try {
        setIsLoading(true);
        const res = await fetch(
          `https://ddragon.leagueoflegends.com/cdn/${version!}/data/en_US/champion.json`
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
    <div className="flex flex-col min-h-screen items-center text-gray-100">
      <div className="container max-w-6xl z-10 mx-auto bg-gradient-to-b text-slate-300 from-[#121624] to-[#1B1F35] border-b border-slate-400 shadow-[#2A2A40] px-6 sm:px-4 pt-4">
        Popular champions
        {/* {top10Champions.map((champion, index) => (
          <div>{/* {champion}</div>
        ))} */}
      </div>
      <div className="bg-gradient-to-b w-full z-10 from-[#121624] via-[#1B1F35] to-[#121624] shadow-sm shadow-[#2A2A40] border rounded-md border-gray-700/70 mt-4 max-w-6xl">
        <input
          placeholder="Search for a champion..."
          type="search"
          className="border-b-2 border-b-white text-white text-center rounded-md p-2 my-4 text-xl w-full outline-none"
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
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* {posts && !isLoading && (
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
        )} */}
    </div>
  );
};
export default ChampionsPage;
