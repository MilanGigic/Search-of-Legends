"use client";

import Image, { StaticImageData } from "next/image";
import { Button } from "@/components/ui/button";
import Iron from "@/public/ranked-emblems/Rank=Iron.png";
import Bronze from "@/public/ranked-emblems/Rank=Bronze.png";
import Silver from "@/public/ranked-emblems/Rank=Silver.png";
import Gold from "@/public/ranked-emblems/Rank=Gold.png";
import Platinum from "@/public/ranked-emblems/Rank=Platinum.png";
import Emerald from "@/public/ranked-emblems/Rank=Emerald.png";
import Diamond from "@/public/ranked-emblems/Rank=Diamond.png";
import Master from "@/public/ranked-emblems/Rank=Master.png";
import Grandmaster from "@/public/ranked-emblems/Rank=Grandmaster.png";
import Challenger from "@/public/ranked-emblems/Rank=Challenger.png";
import { useEffect, useState, useTransition } from "react";
import { RxActivityLog } from "react-icons/rx";
import { GiCrestedHelmet } from "react-icons/gi";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import VODCarousel from "./VodCarousel";
import { useDataStore } from "@/lib/store/useConstantDataStore";
import { updateAccountAction } from "@/actions/updateAccount";

type PageContent = "overview" | "champions" | "live";

const UserCard = ({
  accountData,
  region,
  riotId,
}: {
  accountData: DbSummonerInfo;
  region: string;
  riotId: string;
}) => {
  const [tierImage, setTierImage] = useState<StaticImageData | undefined>(
    undefined,
  );
  const [isPending, startTransition] = useTransition();
  const [updateError, setUpdateError] = useState<string | null>(null);

  const { version } = useDataStore();
  const router = useRouter();
  const puuid = accountData.puuid;

  const rank = accountData.rank;
  const tier = accountData.tier;

  useEffect(() => {
    if (tier) {
      switch (tier) {
        case "IRON":
          setTierImage(Iron);
          break;
        case "BRONZE":
          setTierImage(Bronze);
          break;
        case "SILVER":
          setTierImage(Silver);
          break;
        case "GOLD":
          setTierImage(Gold);
          break;
        case "PLATINUM":
          setTierImage(Platinum);
          break;
        case "EMERALD":
          setTierImage(Emerald);
          break;
        case "DIAMOND":
          setTierImage(Diamond);
          break;
        case "MASTER":
          setTierImage(Master);
          break;
        case "GRANDMASTER":
          setTierImage(Grandmaster);
          break;
        case "CHALLENGER":
          setTierImage(Challenger);
          break;
        default:
          setTierImage(undefined);
      }
    }
  }, [tier]);

  const handleUpdate = () => {
    setUpdateError(null);
    startTransition(async () => {
      const result = await updateAccountAction(puuid);
      if (!result.ok) {
        setUpdateError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const pathname = usePathname();
  const activeTab: PageContent = pathname.includes("/champions")
    ? "champions"
    : pathname.includes("/live")
      ? "live"
      : "overview";

  if (!accountData) {
    return null;
  }

  return (
    <div className="container max-w-6xl mx-auto bg-gradient-to-b text-slate-300 from-[#121624] to-[#1B1F35] border-b border-slate-400 shadow-[#2A2A40] px-6 sm:px-4 pt-4">
      <div className="flex flex-col sm:flex-row w-full justify-between">
        <div>
          <div className="flex items-center">
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${accountData.profileIconId}.png`}
              width={80}
              className="rounded-full border-2 border-[#5C87F8] animate-pulse animate-duration-5000 mr-4"
            />

            <h1 className="text-white font-bold text-2xl flex flex-col">
              {accountData.gameName}#{accountData.tagLine}{" "}
              <span className="text-lg font-semibold text-gray-200 flex items-center flex-wrap gap-2">
                Level {accountData.summonerLevel || "N/A"}
                <Button
                  onClick={handleUpdate}
                  disabled={isPending}
                  className="p-3 cursor-pointer hover:bg-[#5C87F8]/50 transition-all duration-200 text-white bg-[#5C87F8] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div
                    className={`p-1 rounded-full bg-violet-600 ${
                      isPending ? "animate-pulse animate-duration-1000" : ""
                    }`}
                  />{" "}
                  {isPending ? "Updating…" : "Update"}
                </Button>
              </span>
              {updateError && (
                <span className="text-xs font-normal text-red-400 mt-1">
                  {updateError}
                </span>
              )}
            </h1>
          </div>
          <div className="flex items-center">
            {tierImage ? (
              <div className="flex items-center gap-3">
                <Image
                  src={tierImage}
                  alt={`${tier} Rank`}
                  width={80}
                  height={80}
                />
                <div className="text-white">
                  <p className="font-bold">{tier || "Unranked"}</p>
                  <p>
                    {rank || ""}{" "}
                    {rank ? `- ${accountData.leaguePoints} LP` : ""}
                  </p>
                  {rank && (
                    <p className="text-sm text-gray-300">
                      {accountData.wins}W-{accountData.losses}L (
                      {Math.round(
                        (accountData.wins! /
                          (accountData.wins! + accountData.losses!)) *
                          100,
                      )}
                      %)
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-white">Unranked</p>
            )}
          </div>
        </div>
        <div className="flex flex-col justify-center w-[350px] sm:w-3xl gap-1">
          <VODCarousel />
        </div>
      </div>
      <ul className="flex justify-center gap-4 w-full">
        <Link
          href={`/${riotId}`}
          className={`border-none bg-transparent w-[100px] ${
            activeTab === "overview" ? "text-slate-200" : "text-gray-400"
          } h-[64px] px-2 text-center flex flex-col justify-between items-center rounded-b-none hover:text-slate-200`}
        >
          <span className="font-semibold text-base mt-4 flex items-center gap-1 text-center">
            <RxActivityLog /> Overview
          </span>
          {activeTab === "overview" && (
            <div className="border border-slate-400 rounded-t-md w-2/3 py-0.5 shadow-inner shadow-sky-500" />
          )}
        </Link>
        <Link
          href={`/${riotId}/champions`}
          className={`border-none bg-transparent px-2 w-[100px] h-[64px] ${
            activeTab === "champions" ? "text-slate-200" : "text-gray-400"
          } text-center flex flex-col justify-between items-center rounded-b-none hover:text-slate-200`}
        >
          <span className="font-semibold text-base mt-4 flex items-center gap-1 text-center">
            <GiCrestedHelmet />
            Champions
          </span>
          {activeTab === "champions" && (
            <div className="border border-slate-400 rounded-t-md w-2/3 py-0.5 shadow-inner shadow-sky-500" />
          )}
        </Link>
        <Link
          href={`/${riotId}/live`}
          className={`border-none bg-transparent px-2 h-[64px] w-[70px] text-center flex flex-col justify-between items-center rounded-b-none ${
            activeTab === "live" ? "text-slate-200" : "text-gray-400"
          } hover:text-slate-200`}
        >
          <span className="font-semibold text-base mt-4 flex items-center gap-1 text-center">
            {activeTab === "live" ? (
              <div className="p-1 rounded-full bg-red-600 animate-pulse animate-duration-5000" />
            ) : (
              <div className="p-1 rounded-full bg-red-900 text-center" />
            )}
            Live
          </span>
          {activeTab === "live" && (
            <div className="border border-slate-400 rounded-t-md w-2/3 py-0.5 shadow-inner shadow-sky-500" />
          )}
        </Link>
      </ul>
    </div>
  );
};

export default UserCard;
