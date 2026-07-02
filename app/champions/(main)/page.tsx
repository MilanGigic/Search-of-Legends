"use client";

import { getMetaChampions } from "@/actions/performance/getMetaChampions";
import ChampionsTable from "@/components/champions-page/ChampionsTable";
import { getColumns } from "@/components/champions-page/columns";
import useBuildColumnFilters from "@/lib/champions/useBuildColumnFilters";
import { useChampionsFiltersStore } from "@/lib/store/useChampionsFiltersStore";
import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

export default function ChampionsPage() {
  const [metaChampions, setMetaChampions] = useState<MetaChampion[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const { filters } = useChampionsFiltersStore();

  const columns = useMemo(() => getColumns(), []);
  const table = useReactTable({
    data: metaChampions,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
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
    <div className="w-5xl mx-auto border">
      <ChampionsTable table={table} />
    </div>
  );
}
