import { ChampionBuildResult } from "@/actions/champions/getChampionBuild";

export default function SummonerSpellsGrid({
  data,
}: {
  data: ChampionBuildResult | null;
}) {
  console.log("Data for summoner spells grid:", data);
  return <div>SummonerSpellsGrid</div>;
}
