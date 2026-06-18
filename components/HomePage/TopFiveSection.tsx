import { useDataStore } from "@/lib/store/useConstantDataStore";
import TopFiveChampions from "./TopFiveChampions";
import TopFivePlayers from "./TopFivePlayers";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { useState } from "react";

export default function TopFiveSection() {
  const { version } = useDataStore();

  const [selectedRegion, setSelectedRegion] = useState<string>("euw1");

  return (
    <section className="flex flex-col sm:flex-row gap-4 md:gap-12 items-center w-sm sm:w-2xl md:w-3xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.7 }}
        className="w-full space-y-4"
      >
        <h2 className="text-lg font-semibold my-4 text-gray-200 text-center">
          Top Champions This Patch
        </h2>

        <TopFiveChampions version={version} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.7 }}
        className="w-full space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold my-4 text-gray-200 text-center">
            Best of the Best
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              onClick={() => setSelectedRegion("euw1")}
              className="h-full px-4 text-center bg-transparent flex flex-col relative group items-center justify-between hover:bg-transparent transition-colors duration-200 cursor-pointer"
            >
              <h1 className="text-center flex-1 h-full flex flex-col justify-center font-semibold tracking-wider  text-white hover:text-white">
                EUW
              </h1>
              <div
                className={`absolute bottom-0 left-1/2 h-0.5 w-0 bg-gradient-to-r from-white/15 to-white/25 transition-all duration-300 ease-out transform -translate-x-1/2 ${selectedRegion === "euw1" ? "w-full" : "group-hover:w-full"}`}
              ></div>
            </Button>
            <Button
              variant="default"
              onClick={() => setSelectedRegion("kr")}
              className="h-full px-4 text-center bg-transparent flex flex-col relative group items-center justify-between hover:bg-transparent transition-colors duration-200 cursor-pointer"
            >
              <h1 className="text-center flex-1 h-full flex flex-col justify-center font-semibold tracking-wider  text-white hover:text-white">
                KR
              </h1>
              <div
                className={`absolute bottom-0 left-1/2 h-0.5 w-0 bg-gradient-to-r from-white/15 to-white/25 transition-all duration-300 ease-out transform -translate-x-1/2 ${selectedRegion === "kr" ? "w-full" : "group-hover:w-full"}`}
              ></div>
            </Button>
            <Button
              variant="default"
              onClick={() => setSelectedRegion("na1")}
              className="h-full px-4 text-center bg-transparent flex flex-col relative group items-center justify-between hover:bg-transparent transition-colors duration-200 cursor-pointer"
            >
              <h1 className="text-center flex-1 h-full flex flex-col justify-center font-semibold tracking-wider  text-white hover:text-white">
                NA
              </h1>
              <div
                className={`absolute bottom-0 left-1/2 h-0.5 w-0 bg-gradient-to-r from-white/15 to-white/25 transition-all duration-300 ease-out transform -translate-x-1/2 ${selectedRegion === "na1" ? "w-full" : "group-hover:w-full"}`}
              ></div>
            </Button>
          </div>
        </div>

        <TopFivePlayers selectedRegion={selectedRegion} version={version} />
      </motion.div>
    </section>
  );
}
