import { ColumnDef } from "@tanstack/react-table";

export const getColumns = (): ColumnDef<MetaChampion>[] => {
  return [
    {
      accessorKey: "rank",
      header: "Rank",
      cell: ({ row }) => {
        return <div>{row.original.rank}</div>;
      },
    },
    {
      accessorKey: "championName",
      header: "Champion",
      cell: ({ row }) => {
        return <div>{row.original.championName}</div>;
      },
    },
    {
      accessorKey: "lane",
      header: "Lane",
      enableSorting: true,
      cell: ({ row }) => {
        return (
          <div>
            {row.original.lane === "MIDDLE"
              ? "MID"
              : row.original.lane === "UTILITY"
                ? "SUPPORT"
                : row.original.lane === "BOTTOM"
                  ? "ADC"
                  : row.original.lane}
          </div>
        );
      },
    },
    {
      accessorKey: "tier",
      header: "Tier",
      enableSorting: true,
      cell: ({ row }) => {
        return <div>{row.original.tier}</div>;
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
        return <div>{row.original.gamesPlayed}</div>;
      },
    },
  ];
};
