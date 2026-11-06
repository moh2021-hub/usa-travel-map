import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { City } from "../api/types";
import { formatNumber } from "../lib/geo";

type Props = {
  stateCode: string;
  stateName: string;
  visitedCityIds: Set<number>;
  onToggleCity: (city: City, visited: boolean) => void;
};

/** Type the start of a city name, pick it from the list. */
export function CitySearch({ stateCode, stateName, visitedCityIds, onToggleCity }: Props) {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");

  // Wait until typing pauses before asking the server.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(text.trim()), 200);
    return () => clearTimeout(timer);
  }, [text]);

  const search = useQuery({
    queryKey: ["city-search", stateCode, query],
    queryFn: () =>
      api<City[]>(`/api/cities/search?q=${encodeURIComponent(query)}&state=${stateCode}&limit=8`),
    enabled: query.length > 0,
  });

  return (
    <section>
      <label htmlFor="city-search" className="mb-2 block text-base font-bold">
        Add a city in {stateName}
      </label>
      <input
        id="city-search"
        type="search"
        className="field"
        placeholder="Start typing a city name"
        autoComplete="off"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      {query && search.isError && (
        <p role="alert" className="mb-0 mt-2 text-sm text-red-800">
          {search.error.message}
        </p>
      )}
      {query && search.data?.length === 0 && (
        <p className="mb-0 mt-2 text-sm text-gravel">
          No city in {stateName} starts with "{query}". Towns under 1,000 people aren't listed.
        </p>
      )}
      {query && search.data && search.data.length > 0 && (
        <ul className="m-0 mt-2 list-none divide-y divide-curb rounded-md border border-curb bg-white p-0">
          {search.data.map((city) => {
            const visited = visitedCityIds.has(city.id);
            return (
              <li key={city.id}>
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-baseline justify-between gap-3 border-0 bg-transparent px-3 py-2 text-left hover:bg-concrete"
                  aria-pressed={visited}
                  onClick={() => onToggleCity(city, !visited)}
                >
                  <span className={visited ? "font-bold" : undefined}>
                    {city.name}
                    <span className="ml-2 text-sm text-gravel">pop. {formatNumber(city.population)}</span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-sign">{visited ? "Visited" : "Add"}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
