import { ChampionSkillOrderResult } from "@/actions/champions/getChampionSkillOrder";

export default function SpellOrderCard({
  data,
}: {
  data: ChampionSkillOrderResult | null;
}) {
  console.log("Data for spell order card:", data);
  return <div>SpellOrderCard</div>;
}
