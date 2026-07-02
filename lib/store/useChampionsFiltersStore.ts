import { create } from "zustand";

export type ChampionsFilters = {
  lane: string | null;
  tier: string | null;
  winRate: string | null;
  pickRate: string | null;
  gamesPlayed: string | null;
};

type ChampionsFiltersStore = {
  filters: ChampionsFilters;
  setFilters: (filters: Partial<ChampionsFilters>) => void;

  resetFilters: () => void;
};

const initialFilters: ChampionsFilters = {
  lane: null,
  tier: null,
  winRate: null,
  pickRate: null,
  gamesPlayed: null,
};

export const useChampionsFiltersStore = create<ChampionsFiltersStore>(
  (set) => ({
    filters: initialFilters,

    setFilters: (updates) =>
      set((state) => ({
        filters: {
          ...state.filters,
          ...updates,
        },
      })),

    resetFilters: () =>
      set({
        filters: initialFilters,
      }),
  }),
);
