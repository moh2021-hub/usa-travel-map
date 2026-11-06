import { useRef } from "react";
import { Link } from "react-router";
import { DownloadButtons } from "../components/DownloadButtons";
import { LocateButton } from "../components/LocateButton";
import { MapFrame } from "../components/MapFrame";
import { RoadSign } from "../components/RoadSign";
import { ShareLink } from "../components/ShareLink";
import { ThemePicker } from "../components/ThemePicker";
import { UsMap } from "../components/UsMap";
import { setStateVisited } from "../lib/sync";
import { getTheme } from "../lib/themes";
import { US_STATES } from "../lib/usStates";
import { useAuthStore } from "../store/authStore";
import { useTravelStore } from "../store/travelStore";

export default function UsPage() {
  const { states, cities, countries, theme: themeId, showLabels } = useTravelStore();
  const userName = useAuthStore((s) => s.user?.displayName);
  const svg = useRef<SVGSVGElement>(null);

  const citiesByState = new Map<string, number>();
  for (const city of cities) citiesByState.set(city.stateCode, (citiesByState.get(city.stateCode) ?? 0) + 1);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="m-0 text-3xl font-extrabold tracking-tight sm:text-4xl">Mark the states you've visited</h1>
      <p className="mb-5 mt-2 max-w-[65ch] text-lg text-gravel">
        Click a state on the map or tick it in the list. Open a state to add the cities you've been to.
      </p>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <MapFrame>
          <UsMap
            ref={svg}
            visitedStates={states}
            visitedCities={cities}
            theme={getTheme(themeId)}
            showLabels={showLabels}
            onToggleState={setStateVisited}
          />
        </MapFrame>

        <aside className="grid gap-6">
          <RoadSign
            rows={[
              { label: "States", value: states.length, total: US_STATES.length },
              { label: "Cities", value: cities.length },
              { label: "Countries", value: countries.length },
            ]}
          />
          <ThemePicker labelsOption="Show state abbreviations" />
          <DownloadButtons
            getSvg={() => svg.current}
            title={userName ? `${userName}'s United States` : "My United States"}
            summary={`${states.length} of the 50 states and DC, ${cities.length} ${cities.length === 1 ? "city" : "cities"}`}
            fileName="my-us-map"
          />
          <LocateButton />
          <ShareLink />
        </aside>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 mt-0 text-2xl font-extrabold">States and DC</h2>
        <ul className="m-0 grid list-none gap-x-6 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {US_STATES.map((state) => {
            const cityCount = citiesByState.get(state.code) ?? 0;
            return (
              <li key={state.code} className="flex items-center justify-between gap-3 border-b border-curb py-2">
                <label className="flex cursor-pointer items-center gap-2 font-semibold">
                  <input
                    type="checkbox"
                    className="size-4 accent-sign"
                    checked={states.includes(state.code)}
                    onChange={(event) => setStateVisited(state.code, event.target.checked)}
                  />
                  {state.name}
                </label>
                <Link
                  to={`/state/${state.code}`}
                  className="shrink-0 text-sm font-semibold text-sign"
                  aria-label={`Cities in ${state.name}, ${cityCount} visited`}
                >
                  {cityCount === 0 ? "Add cities" : cityCount === 1 ? "1 city" : `${cityCount} cities`}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
