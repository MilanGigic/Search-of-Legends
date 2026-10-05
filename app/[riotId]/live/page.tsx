import fetchChampions from "@/actions/champions/fetchChampions";
import { fetchAccountByName } from "@/actions/fetchAccountByName";
import ClientLivePage from "@/components/riotIdPage/ClientLivePage";
import { LiveGameSkeleton } from "@/components/riotIdPage/LiveGameSkeleton";
import { fetchLatestVersion } from "@/lib/riot-server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface AccountPageProps {
  params: Promise<{ riotId: string }>;
}

const LivePage = ({ params }: AccountPageProps) => {
  return (
    <div className="text-white">
      <Suspense fallback={<LiveGameSkeleton />}>
        <LiveContent params={params} />
      </Suspense>
    </div>
  );
};
export default LivePage;

const LiveContent = async ({ params }: AccountPageProps) => {
  const { riotId } = await params;
  const decodedRiotId = decodeURIComponent(riotId);
  const separator = decodedRiotId.lastIndexOf("-");
  if (separator === -1) return notFound();

  const gameName = decodedRiotId.slice(0, separator);
  const tagLine = decodedRiotId.slice(separator + 1);
  if (!gameName || !tagLine) return notFound();

  const version = await fetchLatestVersion();
  if (!version) return notFound();

  const accountData = await fetchAccountByName(gameName, tagLine);
  if (!accountData?.region) return notFound();

  const [champions, spellsJson, runesJson] = await Promise.all([
    fetchChampions(),
    fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/summoner.json`,
      {
        next: { revalidate: 3600 },
      },
    ).then((r) => r.json()),
    fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/runesReforged.json`,
      {
        next: { revalidate: 3600 },
      },
    ).then((r) => r.json()),
  ]);
  const championsByKey = Object.fromEntries(
    champions.map((c) => [Number(c.key), { id: c.id, name: c.name }]),
  ) as Record<number, { id: string; name: string }>;

  const spellsByKey: Record<number, string> = Object.fromEntries(
    Object.values(spellsJson.data).map((s: any) => [Number(s.key), s.id]),
  );

  const runeIcons: Record<number, string> = {};
  for (const style of runesJson) {
    runeIcons[style.id] = style.icon;
    for (const slot of style.slots) {
      for (const rune of slot.runes) runeIcons[rune.id] = rune.icon;
    }
  }

  return (
    <div className="text-white">
      <ClientLivePage
        accountData={accountData}
        version={version}
        championsByKey={championsByKey}
        spellsByKey={spellsByKey}
        runeIcons={runeIcons}
        gameName={gameName}
        tagLine={tagLine}
      />
    </div>
  );
};
