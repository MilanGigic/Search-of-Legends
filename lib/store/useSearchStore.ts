import { create } from "zustand";

type SearchStore = {
  championVideoKeySpell: string | null;
  setChampionVideoKeySpell: (spell: string) => void;
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
