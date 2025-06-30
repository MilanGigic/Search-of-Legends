"use client";

import Link from "next/link";

// Shadcn
import { Button } from "./ui/button";
import SearchForm from "./SearchForm";
import { MenuIcon, SearchIcon } from "lucide-react";
import { useState } from "react";

const Header = ({ showSearch }: { showSearch?: boolean }) => {
  const [searchOpen, setSearchOpen] = useState<boolean>(false);

  const toggleSearch = (e: React.MouseEvent) => {
    e.preventDefault();

    setSearchOpen((prev) => !prev);
  };

  return (
    <div className="w-full sticky top-0 z-50 bg-transparent backdrop-blur-sm backdrop-brightness-70 flex text-center items-center h-[60px] shadow-xl justify-center text-white">
      <div className="flex items-center justify-between w-full">
        <Link href="/">
          <Button className="flex items-center px-5 py-2  cursor-pointer bg-gradient-to-r from-sky-600 to-cyan-400 text-transparent bg-clip-text hover:bg-gradient-to-l hover:bg-clip-text hover:text-transparent hover:from-blue-300 hover:to-blue-200  font-bold text-lg transition-colors duration-200">
            <span className="absolute top-0 w-[48px] h-14 [@media(pointer:coarse)]:hidden"></span>
            <span>SoL</span>
          </Button>
        </Link>
        <ul className="flex items-center gap-2 sm:gap-5">
          {showSearch && searchOpen ? (
            <div className="flex items-center gap-2">
              <div className="sm:block sm:max-w-md h-12">
                <SearchForm placeholder="Search for a Summoner..." />
              </div>
              <span className="cursor-pointer relative flex items-center justify-center w-12 h-12 hover:opacity-70 transition-all duration-100">
                <span className="absolute top-0 right-0 w-[48px] h-12 [@media(pointer:coarse)]:hidden"></span>
                <MenuIcon className="size-6" />
              </span>
            </div>
          ) : showSearch && !searchOpen ? (
            <>
              <div className="sm:hidden flex items-center justify-center w-12 h-12">
                <SearchIcon
                  className="hover:opacity-70 transition-all duration-100 size-12 cursor-pointer"
                  onClick={(e: React.MouseEvent) => toggleSearch(e)}
                />
              </div>
              <Link
                href="/leaderboard"
                className="bg-gradient-to-r from-sky-600 to-cyan-400 text-transparent bg-clip-text hover:bg-gradient-to-l hover:bg-clip-text hover:text-transparent hover:from-blue-300 hover:to-blue-200  font-bold text-sm md:text-base lg:text-lg cursor-pointer transition-colors duration-200"
              >
                <span className="absolute top-0 w-[106px] h-12 [@media(pointer:fine)]:hidden"></span>
                Leaderboard
              </Link>
              <div className="hidden sm:block max-w-md h-12">
                <SearchForm placeholder="Asd" />
              </div>
              <Link
                href="/champions"
                className="bg-gradient-to-r from-sky-600 to-cyan-400 text-transparent bg-clip-text hover:bg-gradient-to-l hover:bg-clip-text hover:text-transparent hover:from-blue-300 hover:to-blue-200  font-bold text-sm md:text-base lg:text-lg cursor-pointer transition-colors duration-200"
              >
                <span className="absolute top-0 w-[106px] h-12 [@media(pointer:fine)]:hidden"></span>
                Champions
              </Link>
            </>
          ) : (
            !showSearch && (
              <>
                <Link
                  href="/leaderboard"
                  className="bg-gradient-to-r from-sky-600 to-cyan-400 text-transparent bg-clip-text hover:bg-gradient-to-l hover:bg-clip-text hover:text-transparent hover:from-blue-300 hover:to-blue-200  font-bold text-sm md:text-base lg:text-lg cursor-pointer transition-colors duration-200"
                >
                  <span className="absolute top-0 w-[106px] h-12 [@media(pointer:coarse)]:hidden"></span>
                  Leaderboard
                </Link>

                <Link
                  href="/champions"
                  className="bg-gradient-to-r from-sky-600 to-cyan-400 text-transparent bg-clip-text hover:bg-gradient-to-l hover:bg-clip-text hover:text-transparent hover:from-blue-300 hover:to-blue-200  font-bold text-sm md:text-base lg:text-lg cursor-pointer transition-colors duration-200"
                >
                  <span className="absolute top-0 w-[106px] h-12 [@media(pointer:coarse)]:hidden"></span>
                  Champions
                </Link>
              </>
            )
          )}
        </ul>
        <div className="hidden md:flex items-center">
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
  );
};
export default Header;
