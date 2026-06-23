"use client";

import Link from "next/link";

// Shadcn
import { Button } from "./ui/button";
import SearchForm from "./SearchForm";
import { MenuIcon, SearchIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchStore } from "@/lib/store/useSearchStore";

const Header = ({ showSearch }: { showSearch?: boolean }) => {
  const [searchOpen, setSearchOpen] = useState<boolean>(false);

  const { isOpen, toggle } = useSearchStore();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 641px)");

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        // screen is sm or larger
        setSearchOpen(false);
      }
    };

    // Initial check
    handleChange(mediaQuery);

    // Listen for screen size changes
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleSearch = (e: React.MouseEvent) => {
    e.preventDefault();

    setSearchOpen((prev) => !prev);
  };

  return (
    <div className="w-full sticky top-0 z-50 bg-transparent backdrop-blur-sm backdrop-brightness-70 flex text-center items-center h-[60px] shadow-xl justify-center text-white">
      <div className="flex items-center justify-between w-full">
        {!isOpen && (
          <Link href="/">
            <Button className="flex items-center px-5 py-2  cursor-pointer bg-gradient-to-r from-sky-600 to-cyan-400 text-transparent bg-clip-text hover:bg-gradient-to-l hover:bg-clip-text hover:text-transparent hover:from-blue-300 hover:to-blue-200  font-bold text-lg transition-colors duration-200">
              <span className="absolute top-0 w-[48px] h-16 [@media(pointer:coarse)]:hidden"></span>
              <span>SoL</span>
            </Button>
          </Link>
        )}
        <ul
          className={`flex ${isOpen && "flex-1"} items-center gap-2 sm:gap-5`}
        >
          {showSearch && searchOpen ? (
            <div className="flex items-center w-full gap-2">
              <div className="max-w-xs sm:block sm:max-w-md h-12 mr-8">
                {!isOpen ? (
                  <SearchForm
                    placeholder="Search for a Summoner..."
                    version={"16.6.1"}
                  />
                ) : null}
              </div>
              <span className="cursor-pointer relative flex items-center justify-center z-100 w-12 h-12 hover:opacity-70 transition-all duration-100">
                <span className="absolute top-0 right-0 w-[48px] h-12 [@media(pointer:coarse)]:hidden"></span>
                <button
                  className="sm:hidden fixed top-4 right-4 p-2 bg-[#1E1E2F] z-100 hover:opacity-80 cursor-pointer rounded-md text-white"
                  onClick={toggle}
                >
                  {isOpen ? <X size={24} /> : <MenuIcon size={24} />}
                </button>
              </span>
            </div>
          ) : showSearch && !searchOpen ? (
            <>
              <div
                className="sm:hidden flex items-center justify-center w-12 h-12 cursor-pointer hover:opacity-70 transition-all duration-100 "
                onClick={(e: React.MouseEvent) => toggleSearch(e)}
              >
                <span className="absolute top-0 w-[48px] h-16 [@media(pointer:coarse)]:hidden"></span>
                <SearchIcon className="size-6" />
              </div>
              <Link
                href="/leaderboard"
                className="bg-gradient-to-r from-sky-600 to-cyan-400 text-transparent bg-clip-text hover:bg-gradient-to-l hover:bg-clip-text hover:text-transparent hover:from-blue-300 hover:to-blue-200  font-bold text-sm md:text-base lg:text-lg cursor-pointer transition-colors duration-200"
              >
                <span className="absolute top-0 w-[86px] h-16 [@media(pointer:coarse)]:hidden"></span>
                Leaderboard
              </Link>
              <div className="hidden sm:block max-w-md h-12">
                <SearchForm
                  placeholder="Search for a Summoner..."
                  version={"16.6.1"}
                />
              </div>
              <Link
                href="/champions"
                className="bg-gradient-to-r from-sky-600 to-cyan-400 text-transparent bg-clip-text hover:bg-gradient-to-l hover:bg-clip-text hover:text-transparent hover:from-blue-300 hover:to-blue-200  font-bold text-sm md:text-base lg:text-lg cursor-pointer transition-colors duration-200"
              >
                <span className="absolute top-0 w-[70px] h-16 [@media(pointer:coarse)]:hidden"></span>
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
                  <span className="absolute top-0 w-[86px] h-12 [@media(pointer:coarse)]:hidden"></span>
                  Leaderboard
                </Link>

                <Link
                  href="/champions"
                  className="bg-gradient-to-r from-sky-600 to-cyan-400 text-transparent bg-clip-text hover:bg-gradient-to-l hover:bg-clip-text hover:text-transparent hover:from-blue-300 hover:to-blue-200  font-bold text-sm md:text-base lg:text-lg cursor-pointer transition-colors duration-200"
                >
                  <span className="absolute top-0 w-[70px] h-12 [@media(pointer:coarse)]:hidden"></span>
                  Champions
                </Link>
              </>
            )
          )}
        </ul>
        <div></div>
        {/* <div className="hidden md:flex items-center">
          {session ? (
            <>
              <h1>Welcome, Riot User</h1>
              <button onClick={() => signOut()}>Sign Out</button>
            </>
          ) : (
            <button onClick={() => signIn("riot")}>Sign In with Riot</button>
          )}

        </div> */}
      </div>
    </div>
  );
};
export default Header;
