"use client";

import { Home, User, BarChart2, Zap, X } from "lucide-react";
import Link from "next/link";
import { useSearchStore } from "@/lib/store/useSearchStore";
import SearchForm from "./SearchForm";

export default function Sidebar() {
  const { isOpen, toggle } = useSearchStore();

  return (
    <>
      {/* Toggle button for mobile */}
      <button
        className={`${
          !isOpen && "hidden"
        } sm:hidden fixed top-4 right-4 p-2 bg-[#1E1E2F] z-100 hover:opacity-80 cursor-pointer rounded-md text-white`}
        onClick={toggle}
      >
        {isOpen && <X size={24} />}
      </button>
      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-64 z-60 bg-gradient-to-b from-[#121624] to-[#1B1F35] border-l border-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out sm:hidden
        ${isOpen ? "translate-x-0" : "translate-x-full"} lg:translate-x-0`}
      >
        <div className="p-6 flex flex-col h-full justify-between">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-white">
              <Home size={20} /> Home
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-2 text-white"
            >
              <User size={20} /> My Profile
            </Link>
            <Link href="/stats" className="flex items-center gap-2 text-white">
              <BarChart2 size={20} /> Champion Stats
            </Link>
            <Link
              href="/ai-agent"
              className="flex items-center gap-2 text-white"
            >
              <Zap size={20} /> AI Coach
            </Link>
            <SearchForm placeholder={"Search..."} version={"16.6.1"} />
          </div>
          <div className="text-xs text-gray-500 text-center">SoL.gg © 2026</div>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={toggle}
        />
      )}
    </>
  );
}
