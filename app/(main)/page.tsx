import { getTopFiveChampions } from "@/actions/champions/getTopFiveChampions";
import HomePage from "@/components/HomePage/HomePage";
import { fetchLatestVersion } from "@/lib/riot-server";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="flex justify-center items-center mx-auto bg-gradient-to-br from-[#121624] to-[#1B1F35]/20">
      <Suspense fallback={<div>Loading...</div>}>
        <HomeContent />
      </Suspense>
    </div>
  );
}

async function HomeContent() {
  const [version, topFiveChampions] = await Promise.all([
    fetchLatestVersion(),
    getTopFiveChampions(),
  ]);
  return <HomePage champions={topFiveChampions} version={version} />;
}
