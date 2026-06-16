import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import SearchForm from "../SearchForm";
import { useDataStore } from "@/lib/store/useConstantDataStore";

const Typewriter = dynamic(() => import("typewriter-effect"), {
  ssr: false,
  loading: () => <span className="text-cyan-500">Macro</span>,
});

export default function HomePageHero() {
  const { version } = useDataStore();

  return (
    <div className="flex flex-col items-center">
      <div className="w-3xl flex flex-col mt-12 items-center text-center gap-4 relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-bold text-4xl text-white md:text-5xl text-shadow-2xs flex items-center justify-center"
        >
          SoL
        </motion.h1>
        <div className="text-[#9CAACF] font-light text-sm md:text-base lg:text-lg">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-6 w-sm md:w-xl mx-auto text-lg text-slate-300"
          >
            Learn the most important mechanics of the game.
          </motion.p>
          <div className="flex items-center gap-1 justify-center text-center">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="text-[#9CAACF]"
            >
              Such as:{" "}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Typewriter
                options={{
                  autoStart: true,
                  loop: true,
                  strings: ["Macro", "Micro", "Itemization", "Laning"],
                  delay: 100,
                  deleteSpeed: 50,
                  wrapperClassName: "text-cyan-500",
                }}
              />
            </motion.div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="w-full"
        >
          <SearchForm
            placeholder={"Enter Summoner Name (e.g. Faker#KR1)"}
            version={version}
          />
        </motion.div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 text-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-white/5 p-4 rounded-xl backdrop-blur border border-gray-700 shadow-sm shadow-slate-800"
        >
          <h3 className="text-lg font-bold text-gray-200">Champion Insights</h3>
          <p className="text-sm text-slate-300 mt-2">
            Track top picks, winrates & matchups.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="bg-white/5 p-4 rounded-xl backdrop-blur border border-gray-700 shadow-sm shadow-slate-800"
        >
          <h3 className="text-lg font-bold text-gray-200">Pro Player Stats</h3>
          <p className="text-sm text-slate-300 mt-2">
            Explore how pros play in real time.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-white/5 p-4 rounded-xl backdrop-blur border border-gray-700 shadow-sm shadow-slate-800"
        >
          <h3 className="text-lg font-bold text-gray-200">AI Learning</h3>
          <p className="text-sm text-slate-300 mt-2">
            Let our agent guide you through macro concepts.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
