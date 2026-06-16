"use client";

import { motion, useAnimation } from "framer-motion";
import Image from "next/image";
import rammusOk from "@/assets/icons/rammus-ok.png";
import zedShocked from "@/assets/icons/zed-shocked.png";
import { useEffect, useRef } from "react";

export default function HomePageFooter({ isMounted }: { isMounted: boolean }) {
  const controls = useAnimation();
  const h1Ref = useRef(null);
  const pRef = useRef(null);
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
      { threshold: 0.3 },
    );

    const elements = [h1Ref.current, pRef.current].filter(Boolean);
    elements.forEach((el) => el && observer.observe(el));

    return () => {
      elements.forEach((el) => el && observer.unobserve(el));
    };
  }, [isMounted, controls]);
  return (
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
  );
}
