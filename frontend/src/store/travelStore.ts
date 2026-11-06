import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { City, Settings, Visits } from "../api/types";
import { DEFAULT_THEME_ID } from "../lib/themes";

type TravelState = Visits &
  Settings & {
    /** Set when saving to the account failed. Shown in a banner. */
    syncError: string | null;
    setStateVisited: (code: string, visited: boolean) => void;
    setCountryVisited: (code: string, visited: boolean) => void;
    setCityVisited: (city: City, visited: boolean) => void;
    setSettings: (settings: Partial<Settings>) => void;
    replaceVisits: (visits: Visits) => void;
    setSyncError: (message: string | null) => void;
  };

const withOrWithout = (list: string[], code: string, include: boolean) =>
  include ? (list.includes(code) ? list : [...list, code]) : list.filter((item) => item !== code);

/**
 * The map the user is building. It lives in the browser (localStorage), so the
 * app works without an account. When someone is logged in, lib/sync.ts also
 * sends every change to the backend.
 */
export const useTravelStore = create<TravelState>()(
  persist(
    (set) => ({
      states: [],
      countries: [],
      cities: [],
      theme: DEFAULT_THEME_ID,
      showLabels: true,
      syncError: null,

      setStateVisited: (code, visited) =>
        set((s) => ({ states: withOrWithout(s.states, code, visited) })),

      setCountryVisited: (code, visited) =>
        set((s) => ({ countries: withOrWithout(s.countries, code, visited) })),

      setCityVisited: (city, visited) =>
        set((s) => ({
          cities: visited
            ? s.cities.some((c) => c.id === city.id)
              ? s.cities
              : [...s.cities, city]
            : s.cities.filter((c) => c.id !== city.id),
          // Visiting a city means you have been in its state.
          states: visited ? withOrWithout(s.states, city.stateCode, true) : s.states,
        })),

      setSettings: (settings) => set(settings),
      replaceVisits: (visits) =>
        set({ states: visits.states, countries: visits.countries, cities: visits.cities }),
      setSyncError: (syncError) => set({ syncError }),
    }),
    {
      name: "travelmap-map",
      partialize: ({ states, countries, cities, theme, showLabels }) => ({
        states,
        countries,
        cities,
        theme,
        showLabels,
      }),
    },
  ),
);
