"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

const UserCard = ({
  accountData,
  region,
}: {
  accountData: DbSummonerInfo;
  region: string;
}) => {
  const puuid = accountData.puuid;

  const rank = accountData.rank;
  const tier = accountData.tier;

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
    <div className="container max-w-6xl mx-auto bg-[#1E1E2F] border-b shadow-[#2A2A40] h-[200] p-5">
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
        {tier ? (
          <div className="flex items-center gap-3">
            <Image
              src={`https://ddragon.leagueoflegends.com/cdn/13.24.1/img/profileicon/Season10_${tier}`}
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
    </div>
  );
};

export default UserCard;
