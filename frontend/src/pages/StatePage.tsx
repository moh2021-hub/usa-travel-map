import { useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { City } from "../api/types";
import { CitySearch } from "../components/CitySearch";
import { DownloadButtons } from "../components/DownloadButtons";
import { MapFrame } from "../components/MapFrame";
import { RoadSign } from "../components/RoadSign";
import { StateMap } from "../components/StateMap";
import { ThemePicker } from "../components/ThemePicker";
import { formatNumber, STATE_FEATURE_BY_CODE } from "../lib/geo";
import { setCityVisited, setStateVisited } from "../lib/sync";
import { getTheme } from "../lib/themes";
import { useTravelStore } from "../store/travelStore";

const POPULATION_STEPS = [1000, 5000, 10000, 50000, 100000];

export default function StatePage() {
  const code = (useParams().code ?? "").toUpperCase();
  const shape = STATE_FEATURE_BY_CODE.get(code);

  const { states, cities: allVisited, theme: themeId } = useTravelStore();
  const [minPopulation, setMinPopulation] = useState(10000);
  const svg = useRef<SVGSVGElement>(null);

  const cityList = useQuery({
    queryKey: ["cities", code],
    queryFn: () => api<City[]>(`/api/states/${code}/cities`),
    enabled: shape !== undefined,
  });

  const visitedHere = useMemo(
    () => allVisited.filter((city) => city.stateCode === code).sort((a, b) => a.name.localeCompare(b.name)),
    [allVisited, code],
  );
  const visitedIds = useMemo(() => new Set(visitedHere.map((city) => city.id)), [visitedHere]);

  // Dots on the map: cities above the chosen size, plus everything visited (whatever its size).
  const dots = useMemo(() => {
    const shown = (cityList.data ?? []).filter((city) => city.population >= minPopulation);
    const shownIds = new Set(shown.map((city) => city.id));
    return [...shown, ...visitedHere.filter((city) => !shownIds.has(city.id))];
  }, [cityList.data, minPopulation, visitedHere]);

  if (!shape) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="m-0 text-3xl font-extrabold">There's no state with the code "{code}"</h1>
        <p className="text-lg">
          <Link to="/" className="font-semibold text-sign">
            Back to the United States map
          </Link>
        </p>
      </main>
    );
  }

  const { name } = shape.state;
  const stateVisited = states.includes(code);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <Link to="/" className="font-semibold text-sign">
        Back to the United States
      </Link>
      <div className="mb-5 mt-1 flex flex-wrap items-center gap-x-5 gap-y-2">
        <h1 className="m-0 text-3xl font-extrabold tracking-tight sm:text-4xl">{name}</h1>
        <label className="flex cursor-pointer items-center gap-2 text-lg font-semibold">
          <input
            type="checkbox"
            className="size-5 accent-sign"
            checked={stateVisited}
            onChange={(event) => setStateVisited(code, event.target.checked)}
          />
          I've been to {name}
        </label>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          <MapFrame>
            <StateMap
              key={code}
              ref={svg}
              shape={shape}
              stateVisited={stateVisited}
              cities={dots}
              visitedCityIds={visitedIds}
              theme={getTheme(themeId)}
              onToggleCity={setCityVisited}
            />
          </MapFrame>
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
            <p className="m-0 text-gravel">Click a dot to mark a city. Scroll or pinch to zoom, drag to move.</p>
            <label className="ml-auto flex items-center gap-2 font-semibold">
              Show places with at least
              <select
                className="field !w-auto font-normal"
                value={minPopulation}
                onChange={(event) => setMinPopulation(Number(event.target.value))}
              >
                {POPULATION_STEPS.map((step) => (
                  <option key={step} value={step}>
                    {formatNumber(step)} people
                  </option>
                ))}
              </select>
            </label>
          </div>
          {cityList.isError && (
            <p role="alert" className="mt-3 rounded-md bg-lane px-3 py-2 font-semibold">
              The cities in {name} couldn't be loaded. {cityList.error.message}{" "}
              <button
                type="button"
                className="cursor-pointer border-0 bg-transparent p-0 font-semibold underline"
                onClick={() => cityList.refetch()}
              >
                Try again
              </button>
            </p>
          )}
        </div>

        <aside className="grid gap-6">
          <RoadSign rows={[{ label: `Cities in ${code}`, value: visitedHere.length }]} />
          <CitySearch
            stateCode={code}
            stateName={name}
            visitedCityIds={visitedIds}
            onToggleCity={setCityVisited}
          />
          <section>
            <h2 className="mb-2 mt-0 text-base font-bold">Visited in {name}</h2>
            {visitedHere.length === 0 ? (
              <p className="m-0 text-sm text-gravel">
                Nothing yet. Click a dot on the map or search for a city above.
              </p>
            ) : (
              <ul className="m-0 list-none p-0">
                {visitedHere.map((city) => (
                  <li key={city.id} className="flex items-center justify-between gap-3 border-b border-curb py-1.5">
                    <span className="font-semibold">{city.name}</span>
                    <button
                      type="button"
                      className="cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-gravel underline"
                      onClick={() => setCityVisited(city, false)}
                      aria-label={`Remove ${city.name}`}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <ThemePicker />
          <DownloadButtons
            getSvg={() => svg.current}
            title={`${name}`}
            summary={`${visitedHere.length} ${visitedHere.length === 1 ? "city" : "cities"} visited`}
            fileName={`my-${name.toLowerCase().replace(/\s+/g, "-")}-map`}
          />
        </aside>
      </div>
    </main>
  );
}
