"use client";

import TypewriterComponent from "typewriter-effect";
import SearchForm from "@/components/SearchForm";

const HomePage = () => {
  return (
    <div className="container bg-[#2A2A40]/60 shadow-2xl shadow-violet-300 h-screen flex flex-col items-center justify-center">
      <div className="w-3xl flex flex-col flex-1 justify-center items-center text-center gap-4">
        <h1 className="font-bold text-4xl md:text-5xl text-white">
          Welcome to{" "}
          <span className="text-4xl md:text-5xl text-cyan-300 items-center text-center">
            SoL
          </span>
        </h1>
        <div className="text-gray-300 font-light text-sm md:text-base lg:text-lg ">
          <p className="text-wrap">
            Use the features we provide to learn the most important mechanics of
            the game.
          </p>
          <br />
          <span className="flex items-center gap-1 justify-center text-center">
            Such as:{" "}
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
          </span>
        </div>
        <SearchForm />
      </div>
      <br />
      <div className="text-white flex flex-col items-center w-full">
        <div className="flex flex-col items-center gap-6 pb-8 w-full">
          <h2 className="flex items-center py-2 text-center justify-center w-full font-bold md:font-extrabold text-2xl md:text-4xl bg-gradient-to-r from-cyan-200 via-pink-200 to-sky-300 text-transparent bg-clip-text">
            You don&apos;t have time <br />
            to study all the concepts by yourself?
          </h2>
          <p className="font-semibold text-base md:text-xl text-cyan-100">
            We have just the thing for you!
          </p>
        </div>
        <div className="flex flex-col w-full px-5">
          <h1 className="flex items-center justify-start text-start font-bold text-lg md:text-2xl">
            Our AI Agent makes studying feel like a breeze!
          </h1>

          <p className="font-semibold text-base md:text-xl flex gap-2 items-center">
            You can try it out for free!
            <span className="font-medium text-xs md:text-sm text-gray-400 italic">
              No credit card needed.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
