"use client";

import { ColumnFiltersState } from "@tanstack/react-table";
import { ChampionsFilters } from "../store/useChampionsFiltersStore";
import { useEffect } from "react";

type BuildColumnFiltersProps = {
  filters: ChampionsFilters;
  setColumnFilters: (columnFilters: ColumnFiltersState) => void;
};

export default function useBuildColumnFilters({
  filters,
  setColumnFilters,
}: BuildColumnFiltersProps) {
  useEffect(() => {
    const nextFilters: ColumnFiltersState = [];

    if (filters.lane) {
      nextFilters.push({
        id: "lane",
        value: filters.lane,
      });
    }
    if (filters.tier) {
      nextFilters.push({
        id: "tier",
        value: filters.tier,
      });
    }
    if (filters.winRate) {
      nextFilters.push({
        id: "winRate",
        value: filters.winRate,
      });
    }
    if (filters.pickRate) {
      nextFilters.push({
        id: "pickRate",
        value: filters.pickRate,
      });
    }
    if (filters.gamesPlayed) {
      nextFilters.push({
        id: "gamesPlayed",
        value: filters.gamesPlayed,
      });
    }

    setColumnFilters(nextFilters);
  }, [filters, setColumnFilters]);
}
