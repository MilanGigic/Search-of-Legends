import { ChampionMatchupResult } from "@/actions/champions/getChampionMatchups";

type MatchupsProps = {
  baselineWinRate: number;
  goodAgainst: ChampionMatchupResult[];
  badAgainst: ChampionMatchupResult[];
};

export default function MatchupsPanel({
  data,
}: {
  data: MatchupsProps | null | undefined;
}) {
  console.log("Data for matchups panel:", data);
  return <div>MatchupsPanel</div>;
}
