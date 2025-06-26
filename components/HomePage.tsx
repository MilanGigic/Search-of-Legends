"use client";

import { motion, useAnimation } from "framer-motion";

import TypewriterComponent from "typewriter-effect";
import SearchForm from "@/components/SearchForm";
import { useEffect, useRef, useState } from "react";
import Spotlight from "./ui/spotlight";

const HomePage = () => {
  const h1Ref = useRef(null);
  const pRef = useRef(null);
  const controls = useAnimation();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    const elements = [h1Ref.current, pRef.current].filter(Boolean);
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

    elements.forEach((el) => el && observer.observe(el));

    return () => {
      elements.forEach((el) => el && observer.unobserve(el));
    };
  }, [hasMounted, controls]);
  return (
    <div className="container bg-[#2A2A40]/60 shadow-2xl shadow-violet-300 h-screen flex flex-col items-center justify-center">
      <div className="w-3xl flex flex-col flex-1 justify-center items-center text-center gap-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-bold text-4xl md:text-5xl text-white"
        >
          Welcome to{" "}
          <span className="text-4xl md:text-5xl text-cyan-300 items-center text-center">
            SoL
          </span>
        </motion.h1>
        <div className="text-gray-300 font-light text-sm md:text-base lg:text-lg ">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-6 max-w-xl mx-auto text-lg text-muted-foreground"
          >
            Use the features we provide to learn the most important mechanics of
            the game.
          </motion.p>
          <div className="flex items-center gap-1 justify-center text-center">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              Such as:{" "}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <TypewriterComponent
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
          <SearchForm placeholder={"Enter Summoner Name (e.g. Faker#KR1)"} />
        </motion.div>
      </div>
      <br />
      <div className="text-white flex flex-col items-center w-full">
        <div className="flex flex-col items-center gap-6 pb-8 w-full">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex items-center py-2 text-center justify-center w-full font-bold md:font-extrabold text-2xl md:text-4xl bg-gradient-to-r from-cyan-200 via-pink-200 to-sky-300 text-transparent bg-clip-text"
          >
            You don&apos;t have time <br />
            to study all the concepts by yourself?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-semibold text-base md:text-xl text-cyan-100"
          >
            We have just the thing for you!
          </motion.p>
        </div>
        <div className="flex flex-col w-full px-5">
          <motion.h1
            ref={h1Ref}
            initial={{ opacity: 0, x: -25 }} // Slide in from the left
            animate={controls}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center justify-start text-start font-bold text-lg md:text-2xl"
          >
            Our AI Agent makes studying feel like a breeze!
          </motion.h1>

          <motion.p
            ref={pRef}
            initial={{ opacity: 0, x: -25 }} // Slide in from the left
            animate={controls}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-semibold text-base md:text-xl flex gap-2 items-center"
          >
            You can try it out for free!
            <span className="font-medium text-xs md:text-sm text-gray-400 italic">
              No credit card needed.
            </span>
          </motion.p>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
