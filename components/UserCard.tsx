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
import { useEffect, useState } from "react";

const UserCard = ({
  accountData,
  region,
}: {
  accountData: DbSummonerInfo;
  region: string;
}) => {
  const [tierImage, setTierImage] = useState<StaticImageData | undefined>(
    undefined
  );
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
      console.log("Set tier image for:", tier);
    }
  }, [tier]);

  const handleUpdate = () => {
    const update = async () => {
      const response = await fetch("/api/game-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ puuid, region }),
      });

      if (!response.ok) {
        console.error("Failed to update summoner data");
        return;
      }

      const data = await response.json();
      console.log("Revalidation response:", data);

      if (data.revalidated) {
        console.log("Summoner data updated successfully");
      } else {
        console.error("Failed to update summoner data");
      }
    };
    update();
  };

  if (!accountData) {
    return;
  }

  return (
    <div className="container max-w-6xl mx-auto bg-[#1E1E2F] border-b shadow-[#2A2A40] px-5 pt-5">
      <div className="flex items-center">
        <img
          src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/profileicon/${accountData.profileIconId}.png`}
          width={80}
          className="rounded-full border-2 border-[#5C87F8] animate-pulse animate-duration-5000 mr-4"
        />

        <h1 className="text-white font-bold text-2xl flex flex-col">
          {accountData.gameName}#{accountData.tagLine}{" "}
          <span className="text-lg font-semibold text-gray-200">
            Level {accountData.summonerLevel || "N/A"}
            <Button
              onClick={handleUpdate}
              className="p-3 cursor-pointer hover:bg-[#5C87F8]/50 transition-all duration-200 ml-2 text-white bg-[#5C87F8]"
            >
              <div className="p-1 bg-violet-600 animate-pulse animate-duration-2000 rounded-full" />{" "}
              Update
            </Button>
          </span>
        </h1>
      </div>
      <div className="mb-4 flex items-center">
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
                {rank || ""} {rank ? `- ${accountData.leaguePoints} LP` : ""}
              </p>
              {rank && (
                <p className="text-sm text-gray-300">
                  {accountData.wins}W {accountData.losses}L (
                  {Math.round(
                    (accountData.wins! /
                      (accountData.wins! + accountData.losses!)) *
                      100
                  )}
                  % WR)
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-white">Unranked</p>
        )}
      </div>
      <ul>
        <Button className="border-none bg-transparent rounded-b-none text-slate-300 hover:bg-[#2A2A40]">
          Overview
        </Button>
        <Button className="border-none bg-transparent rounded-b-none text-slate-300 hover:bg-[#2A2A40]">
          Champions
        </Button>
      </ul>
    </div>
  );
};

export default UserCard;
