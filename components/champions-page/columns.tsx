import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

type Tier = "S" | "A" | "B" | "C" | "D" | "F";

const tierColors: Record<Tier, string> = {
  S: "text-amber-400",
  A: "text-rose-400",
  B: "text-violet-400",
  C: "text-blue-400",
  D: "text-slate-400",
  F: "text-slate-500",
};

export const getColumns = (version: string): ColumnDef<MetaChampion>[] => {
  return [
    {
      accessorKey: "rank",
      header: "Rank",
      cell: ({ row }) => {
        return <div className="text-lg font-semibold">{row.original.rank}</div>;
      },
    },
    {
      accessorKey: "championName",
      header: "Champion",
      cell: ({ row }) => {
        return (
          <div className="flex justify-center">
            <div className="flex items-center justify-start gap-4 w-56">
              <div className="relative w-24 h-[40px] min-h-[40px] overflow-hidden rounded bg-black-700 shrink-0">
                <Image
                  src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${row.original.championImage}`}
                  alt={row.original.championName}
                  width={1000}
                  height={1000}
                  className="object-cover scale-110 absolute h-[100%] w-[100%] inset-0 bg-transparent"
                />
              </div>
              <h1 className="font-semibold text-lg truncate">
                {row.original.championName}
              </h1>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "lane",
      header: "Lane",
      enableSorting: true,
      cell: ({ row }) => {
        return (
          <div>
            <h1>
              {row.original.lane === "MIDDLE"
                ? "MID"
                : row.original.lane === "UTILITY"
                  ? "SUPPORT"
                  : row.original.lane === "BOTTOM"
                    ? "ADC"
                    : row.original.lane}
            </h1>
          </div>
        );
      },
    },
    {
      accessorKey: "tier",
      header: "Tier",
      enableSorting: true,
      cell: ({ row }) => {
        return (
          <div
            className={`font-semibold ${tierColors[row.original.tier as Tier]}`}
          >
            {row.original.tier}
          </div>
        );
      },
    },
    {
      accessorKey: "winRate",
      header: "Winrate",
      enableSorting: true,
      cell: ({ row }) => {
        return (
          <div>
            {Math.round((row.original.wins / row.original.gamesPlayed) * 100)}%
          </div>
        );
      },
    },
    {
      accessorKey: "pickRate",
      header: "Pickrate",
      enableSorting: true,
      cell: ({ row }) => {
        return (
          <div>
            {Math.round(
              (row.original.gamesPlayed / row.original.totalGames) * 100,
            )}
            %
          </div>
        );
      },
    },
    {
      accessorKey: "gamesPlayed",
      header: "Games",
      enableSorting: true,
      cell: ({ row }) => {
        return <div className="text-slate-400">{row.original.gamesPlayed}</div>;
      },
    },
  ];
};
