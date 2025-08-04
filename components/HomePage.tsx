"use client";

import { motion, useAnimation } from "framer-motion";
const Typewriter = dynamic(() => import("typewriter-effect"), {
  ssr: false,
  loading: () => <span className="text-cyan-500">Macro</span>,
});
import SearchForm from "@/components/SearchForm";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import TopFiveChampions from "./TopFiveChampions";
import Spotlight from "./ui/spotlight";
import rammusOk from "@/assets/icons/rammus-ok.png";
import zedShocked from "@/assets/icons/zed-shocked.png";
import TopFivePlayers from "./TopFivePlayers";

const HomePage = ({
  topFive,
  version,
}: {
  topFive: DbSummonerInfo[];
  version: string;
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const controls = useAnimation();
  const h1Ref = useRef(null);
  const pRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            controls.start({ opacity: 1, x: 0 });
          }
        });
      },
      { threshold: 0.3 }
    );

    const elements = [h1Ref.current, pRef.current].filter(Boolean);
    elements.forEach((el) => el && observer.observe(el));

    return () => {
      elements.forEach((el) => el && observer.unobserve(el));
    };
  }, [isMounted, controls]);

  // if (!isMounted) {
  //   return (
  //     <div className="container h-full flex flex-col items-center justify-between bg-transparent text-white">
  //       {/* Static version of your content */}
  //       <div className="w-3xl flex flex-col mt-24 items-center text-center gap-4">
  //         <h1 className="font-bold text-4xl md:text-5xl text-shadow-2xs flex items-center justify-center">
  //           SoL
  //         </h1>
  //         <div className="text-[#9CAACF] font-light text-sm md:text-base lg:text-lg ">
  //           <p className="mt-6 max-w-xl mx-auto text-lg text-muted-foreground">
  //             Use the features we provide to learn the most important mechanics
  //             of the game.
  //           </p>
  //           <div className="flex items-center gap-1 justify-center text-center">
  //             <p className="text-[#9CAACF]">Such as: </p>
  //             <div>
  //               <Typewriter
  //                 options={{
  //                   autoStart: true,
  //                   loop: true,
  //                   strings: ["Macro", "Micro", "Itemization", "Laning"],
  //                   delay: 100,
  //                   deleteSpeed: 50,
  //                   wrapperClassName: "text-cyan-500",
  //                 }}
  //               />
  //             </div>
  //           </div>
  //         </div>
  //         <div className="w-full">
  //           <SearchForm placeholder={"Enter Summoner Name (e.g. Faker#KR1)"} />
  //         </div>
  //       </div>

  //       <section className="flex gap-12 items-center w-3xl">
  //         <div className="w-full">
  //           <TopFiveChampions />
  //         </div>
  //         <div className="border w-full">Top 5 players</div>
  //       </section>
  //       <br />
  //       <div className="text-white flex flex-col items-center w-full">
  //         <div className="flex flex-col items-center gap-6 pb-8 w-full">
  //           <h2 className="flex items-center py-2 text-center justify-center w-full font-bold md:font-extrabold text-2xl md:text-4xl bg-gradient-to-r from-cyan-200 via-pink-200 to-sky-300 text-transparent bg-clip-text">
  //             You don&apos;t have time <br />
  //             to study all the concepts by yourself?
  //           </h2>
  //           <p className="font-semibold text-base md:text-xl text-cyan-100">
  //             We have just the thing for you!
  //           </p>
  //         </div>
  //         <div className="flex flex-col w-full px-5">
  //           <h1 className="flex items-center justify-start text-start font-bold text-lg md:text-2xl">
  //             Our AI Agent makes studying feel like a breeze!
  //           </h1>

  //           <p className="font-semibold text-base md:text-xl flex gap-2 items-center">
  //             You can try it out for free!
  //             <span className="font-medium text-xs md:text-sm text-gray-400 italic">
  //               No credit card needed.
  //             </span>
  //           </p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // 4xl/5xl sm/base lg xl
  return (
    <div className="container relative h-full flex flex-col items-center justify-between">
      {/* <BackgroundShrooms /> */}
      <Spotlight />

      <main className="relative z-10 w-full flex flex-col items-center justify-center">
        <div className="w-3xl flex flex-col mt-12 items-center text-center gap-4 relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-bold text-4xl text-white md:text-5xl text-shadow-2xs flex items-center justify-center"
          >
            SoL
          </motion.h1>
          <div className="text-[#9CAACF] font-light text-sm md:text-base lg:text-lg ">
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
            <h3 className="text-lg font-bold text-gray-200">
              Champion Insights
            </h3>
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
            <h3 className="text-lg font-bold text-gray-200">
              Pro Player Stats
            </h3>
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
        <section className="flex flex-col sm:flex-row gap-4 md:gap-12 items-center w-sm sm:w-2xl md:w-3xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7 }}
            className="w-full"
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
            className="w-full"
          >
            <h2 className="text-lg font-semibold my-4 text-gray-200 text-center">
              Best of the Best
            </h2>
            <TopFivePlayers topFive={topFive} version={version} />
          </motion.div>
        </section>

        <div className="text-white flex flex-col items-center w-full">
          <div className="flex flex-col items-center gap-4 pb-8 w-full">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex items-center py-4 text-center justify-center w-sm md:w-2xl font-bold md:font-extrabold text-2xl md:text-4xl text-[#E2E6F2]"
            >
              You don&apos;t have time <br />
              to study all the concepts by yourself?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="font-semibold text-base md:text-lg text-[#9CAACF]"
            >
              We have just the thing for you!{" "}
              <span>
                <Image
                  src={rammusOk}
                  alt="Rammus OK"
                  width={40}
                  height={40}
                  className="inline-block ml-2 opacity-75"
                />
              </span>
            </motion.p>
          </div>
          <div className="flex flex-col w-full px-5">
            <motion.h1
              ref={h1Ref}
              initial={{ opacity: 0, x: -25 }} // Slide in from the left
              animate={controls}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex items-center justify-start text-start font-bold w-sm md:w-xl text-[#E2E6F2] text-lg md:text-2xl"
            >
              Our AI Agent makes studying feel like a breeze!
            </motion.h1>

            <motion.p
              ref={pRef}
              initial={{ opacity: 0, x: -25 }} // Slide in from the left
              animate={controls}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="font-semibold text-base md:text-lg text-[#9CAACF] flex flex-col sm:flex-row gap-2 items-center"
            >
              You can try it out for free!
              <span className="font-medium text-xs md:text-sm text-gray-400 text-center items-center italic">
                No credit card needed.{" "}
                <span>
                  <Image
                    src={zedShocked}
                    alt="Rammus OK"
                    width={40}
                    height={40}
                    className="inline-block ml-2 opacity-50"
                  />
                </span>
              </span>
            </motion.p>
          </div>
        </div>
      </main>
    </div>
  );
};
export default HomePage;
