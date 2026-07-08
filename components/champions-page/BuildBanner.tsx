import { ChampionBuildResult } from "@/actions/champions/getChampionBuild";

export default function BuildBanner({
  data,
}: {
  data: ChampionBuildResult | null;
}) {
  console.log("Data for build banner:", data);
  return <div>BuildBanner</div>;
}
