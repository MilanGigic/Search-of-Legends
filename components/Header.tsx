"use client";

import Link from "next/link";

// Shadcn
import { House } from "lucide-react";
import { Button } from "./ui/button";
import SearchForm from "./SearchForm";

const Header = ({ showSearch = false }: { showSearch?: boolean }) => {
  return (
    <div className="w-full sticky top-0 z-50 bg-transparent backdrop-blur-sm backdrop-brightness-70 flex text-center items-center h-[70px] shadow-xl justify-center text-white">
      <div className="w-full absolute items-center px-5">
        <div className="flex items-center justify-between w-full">
          <Link href="/">
            <Button className="flex items-center px-5 py-2  cursor-pointer bg-gradient-to-r from-sky-600 to-cyan-400 text-transparent bg-clip-text hover:bg-gradient-to-l hover:bg-clip-text hover:text-transparent hover:from-blue-300 hover:to-blue-200  font-bold text-lg transition-colors duration-200">
              <span className="hidden sm:block">Home</span>
              <House className="text-white" />
            </Button>
          </Link>
          <ul className="flex items-center gap-2 sm:gap-5">
            <Link
              href="/leaderboard"
              className="bg-gradient-to-r from-sky-600 to-cyan-400 text-transparent bg-clip-text hover:bg-gradient-to-l hover:bg-clip-text hover:text-transparent hover:from-blue-300 hover:to-blue-200  font-bold text-sm md:text-base lg:text-lg cursor-pointer transition-colors duration-200"
            >
              Leaderboard
            </Link>
            {showSearch && <SearchForm />}
            <Link
              href="/champions"
              className="bg-gradient-to-r from-sky-600 to-cyan-400 text-transparent bg-clip-text hover:bg-gradient-to-l hover:bg-clip-text hover:text-transparent hover:from-blue-300 hover:to-blue-200  font-bold text-sm md:text-base lg:text-lg cursor-pointer transition-colors duration-200"
            >
              Champions
            </Link>
          </ul>
          <div className="flex items-center">
            <Link href="/">
              <Button
                variant="outline"
                className="mr-1 sm:mr-4 p-2 md:p-4 bg-gradient-to-r border-gray-500 from-sky-600 to-cyan-400 text-transparent bg-clip-text hover:bg-gradient-to-l hover:bg-clip-text hover:text-transparent hover:from-blue-300 hover:to-blue-200 font-bold text-sm md:text-base lg:text-lg cursor-pointer transition-colors duration-200"
              >
                Try Premium
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Header;
