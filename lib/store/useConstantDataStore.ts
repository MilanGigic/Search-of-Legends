import { create } from "zustand";

type DataStore = {
  version: string;
  setVersion: (version: string) => void;
  topFive: TopFivePerRegion[];
  setTopFive: (topFive: TopFivePerRegion[]) => void;
};

export const useDataStore = create<DataStore>((set) => ({
  version: "",
  setVersion: (version: string) => set({ version }),
  topFive: [],
  setTopFive: (topFive: TopFivePerRegion[]) => set({ topFive }),
}));
