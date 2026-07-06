"use client";

import { getMetaChampions } from "@/actions/performance/getMetaChampions";
import ChampionsTable from "@/components/champions-page/ChampionsTable";
import { getColumns } from "@/components/champions-page/columns";
import useBuildColumnFilters from "@/lib/champions/useBuildColumnFilters";
import { useChampionsFiltersStore } from "@/lib/store/useChampionsFiltersStore";
import { useDataStore } from "@/lib/store/useConstantDataStore";
import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { startTransition, useEffect, useMemo, useState } from "react";

export default function ChampionsPage() {
  const [metaChampions, setMetaChampions] = useState<MetaChampion[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const { filters } = useChampionsFiltersStore();
  const { version } = useDataStore();

  const columns = useMemo(() => getColumns(version), [version]);
  const table = useReactTable({
    data: metaChampions,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: (updater) => {
      startTransition(() => {
        setSorting(updater);
      });
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  useBuildColumnFilters({ filters, setColumnFilters });

  useEffect(() => {
    (async () => {
      const data = await getMetaChampions();

      if (data.length > 0) {
        setMetaChampions(data);
      }
    })();
  }, []);
  return (
    <div className="w-5xl mx-auto flex flex-col gap-4">
      <header className="flex items-center justify-center flex-col p-4 bg-gradient-to-b from-[#1B1F35] to-[#121624] border-b border-slate-400 z-50">
        <div className="flex flex-col items-center">
          <h1 className="text-white font-semibold text-2xl">
            Tierlist & Builds Master+
          </h1>
          <h4 className="text-white font-semibold text-2xl">
            Patch: {version.slice(0, 5)}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-slate-300 uppercase font-semibold text-lg tracking-wider">
            Champions Analyzed
          </h1>{" "}
          <span className="text-cyan-300 font-semibold tracking-wider text-lg">
            {metaChampions.length}
          </span>
        </div>
      </header>
      <ChampionsTable table={table} />
    </div>
  );
}
