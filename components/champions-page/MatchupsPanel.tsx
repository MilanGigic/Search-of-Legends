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
  return <div>MatchupsPanel</div>;
}
