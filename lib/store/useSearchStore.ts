import { create } from "zustand";

type SearchStore = {
  championVideoKeySpell: string | null;
  setChampionVideoKeySpell: (spell: string) => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  hydrateFromCookies: () => void;
};

let hasHydrated = false;

export const useSearchStore = create<SearchStore>((set) => {
  const store = {
    championVideoKeySpell: null,
    setChampionVideoKeySpell: (spell: string) => {
      set({ championVideoKeySpell: spell });
      if (typeof document !== "undefined") {
        document.cookie = `championVideoKeySpell=${spell}; path=/; max-age=86400`;
      }
    },
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    // Hydrate from cookies on initial load
    hydrateFromCookies: () => {
      if (typeof document !== "undefined") {
        const cookies = document.cookie.split(";");
        const getCookieValue = (name: string) => {
          const match = cookies.find((c) => c.trim().startsWith(`${name}=`));
          return match ? match.split("=")[1] : null;
        };
        const championVideoKeySpell = getCookieValue("championVideoKeySpell");

        set({
          championVideoKeySpell: championVideoKeySpell || null,
        });

        hasHydrated = true;
      }
    },
  };

  if (typeof window !== "undefined" && !hasHydrated) {
    store.hydrateFromCookies();
  }

  return store;
});
