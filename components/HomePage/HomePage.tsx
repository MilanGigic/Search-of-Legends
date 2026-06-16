"use client";

import { useEffect, useState } from "react";
import Spotlight from "../ui/spotlight";
import { useDataStore } from "@/lib/store/useConstantDataStore";
import { fetchLatestVersion } from "@/lib/riot";
import HomePageHero from "@/components/HomePage/HomePageHero";
import TopFiveSection from "@/components/HomePage/TopFiveSection";
import HomePageFooter from "@/components/HomePage/HomePageFooter";

const HomePage = () => {
  const { setVersion } = useDataStore();
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    (async () => {
      const data = await fetchLatestVersion();

      if (data) {
        setVersion(data);
      }
    })();
  }, []);

  return (
    <div className="container relative h-full flex flex-col items-center justify-between">
      <Spotlight />

      <main className="relative z-10 w-full flex flex-col items-center justify-center">
        <HomePageHero />

        <TopFiveSection />

        <HomePageFooter isMounted={isMounted} />
      </main>
    </div>
  );
};
export default HomePage;
