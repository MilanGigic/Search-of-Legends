"use client";

const Runes = ({ game }: { game: DbGameInfo }) => {
  console.log("Perks:", game.perkStyleSelections, game);
  // if (!game.perks || game.perks.length === 0) return;
  return (
    <div className="bg-gradient-to-b from-[#121624] to-[#1B1F35] w-full p-4">
      {/* {game.perks.map((perks, index) => (
        <h1>{perks.primaryStyleId}</h1>
      ))} */}
      {game.perkStyleSelections.map((perk, index) => (
        <h1>{perk.perk}</h1>
      ))}
    </div>
  );
};
export default Runes;

// I THINK THE PROBLEM IS IN THE DATABASE, PERKS ARE NOT CONNECTED TO ANY PUUID, FIGURE OUT A WAY TO CONNECT PERKS TO PARTICIPANTS PUUID
