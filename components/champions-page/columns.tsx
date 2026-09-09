// components/champions-page/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

type Tier = "S_PLUS" | "S" | "A" | "B" | "C" | "D" | "F";

const tierColors: Record<Tier, string> = {
  S_PLUS: "text-cyan-300",
  S: "text-amber-400",
  A: "text-rose-400",
  B: "text-violet-400",
  C: "text-blue-400",
  D: "text-slate-400",
  F: "text-slate-500",
};

export const getColumns = (version: string): ColumnDef<MetaChampion>[] => [
  {
    accessorKey: "rank",
    header: "Rank",
    cell: ({ row }) => (
      <span className="text-lg font-semibold">{row.original.rank}</span>
    ),
  },
  {
    accessorKey: "championName",
    header: "Champion",
    cell: ({ row }) => (
      <div className="mx-auto flex w-full max-w-xs items-center gap-3 text-left">
        <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded bg-black/40">
          <Image
            src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${row.original.championImage}`}
            alt={row.original.championName}
            fill
            sizes="64px"
            loading="eager"
            className="object-cover"
          />
        </div>
        <span className="truncate font-semibold">
          {row.original.championName}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "lane",
    header: "Lane",
    enableSorting: true,
    cell: ({ row }) => {
      const lane = row.original.lane;
      const label =
        lane === "MIDDLE"
          ? "MID"
          : lane === "UTILITY"
            ? "SUPPORT"
            : lane === "BOTTOM"
              ? "ADC"
              : lane;
      return <span>{label}</span>;
    },
  },
  {
    accessorKey: "tier",
    header: "Tier",
    enableSorting: true,
    cell: ({ row }) => {
      const tier = row.original.tier as Tier;
      return (
        <span className={`font-semibold ${tierColors[tier]}`}>
          {tierLabel(tier)}
        </span>
      );
    },
  },
  {
    id: "winRate",
    header: "Winrate",
    enableSorting: true,
    accessorFn: (row) => row.wins / row.gamesPlayed,
    cell: ({ row }) => (
      <span>
        {Math.round((row.original.wins / row.original.gamesPlayed) * 100)}%
      </span>
    ),
  },
  {
    id: "pickRate",
    header: "Pickrate",
    enableSorting: true,
    accessorFn: (row) => row.gamesPlayed / row.totalGames,
    cell: ({ row }) => (
      <span>
        {Math.round((row.original.gamesPlayed / row.original.totalGames) * 100)}
        %
      </span>
    ),
  },
  {
    accessorKey: "gamesPlayed",
    header: "Games",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="text-slate-400">{row.original.gamesPlayed}</span>
    ),
  },
];

function tierLabel(tier: Tier) {
  return tier === "S_PLUS" ? "S+" : tier;
}
