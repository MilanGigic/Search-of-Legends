import { create } from "zustand";

type RefreshState = {
  token: number;
  bump: () => void;
};

export const useRefreshStore = create<RefreshState>((set) => ({
  token: 0,
  bump: () => set((state) => ({ token: state.token + 1 })),
}));
