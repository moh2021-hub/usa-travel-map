import { useRef, useState } from "react";
import { DownloadButtons } from "../components/DownloadButtons";
import { MapFrame } from "../components/MapFrame";
import { RoadSign } from "../components/RoadSign";
import { ShareLink } from "../components/ShareLink";
import { ThemePicker } from "../components/ThemePicker";
import { WorldMap } from "../components/WorldMap";
import { setCountryVisited } from "../lib/sync";
import { getTheme } from "../lib/themes";
import { COUNTRIES } from "../lib/world";
import { useAuthStore } from "../store/authStore";
import { useTravelStore } from "../store/travelStore";

export default function WorldPage() {
  const { countries, theme: themeId } = useTravelStore();
  const userName = useAuthStore((s) => s.user?.displayName);
  const [filter, setFilter] = useState("");
  const svg = useRef<SVGSVGElement>(null);

  const listed = COUNTRIES.filter((country) => country.name.toLowerCase().includes(filter.trim().toLowerCase()));

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="m-0 text-3xl font-extrabold tracking-tight sm:text-4xl">Mark the countries you've visited</h1>
      <p className="mb-5 mt-2 max-w-[65ch] text-lg text-gravel">
        Click a country on the map or tick it in the list. Small countries are easier to find in the list.
      </p>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <MapFrame>
          <WorldMap
            ref={svg}
            visitedCountries={countries}
            theme={getTheme(themeId)}
            onToggleCountry={setCountryVisited}
          />
        </MapFrame>

        <aside className="grid gap-6">
          <RoadSign rows={[{ label: "Countries", value: countries.length, total: COUNTRIES.length }]} />
          <ThemePicker />
          <DownloadButtons
            getSvg={() => svg.current}
            title={userName ? `${userName}'s world` : "My world"}
            summary={`${countries.length} of ${COUNTRIES.length} countries and territories`}
            fileName="my-world-map"
          />
          <ShareLink />
        </aside>
      </div>

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <h2 className="m-0 text-2xl font-extrabold">Countries and territories</h2>
          <label className="grid gap-1 font-semibold">
            Find a country
            <input
              type="search"
              className="field font-normal"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
          </label>
        </div>
        {listed.length === 0 ? (
          <p className="text-gravel">No country matches "{filter}". Check the spelling or clear the box.</p>
        ) : (
          <ul className="m-0 grid list-none gap-x-6 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listed.map((country) => (
              <li key={country.code} className="border-b border-curb py-2">
                <label className="flex cursor-pointer items-center gap-2 font-semibold">
                  <input
                    type="checkbox"
                    className="size-4 accent-sign"
                    checked={countries.includes(country.code)}
                    onChange={(event) => setCountryVisited(country.code, event.target.checked)}
                  />
                  {country.name}
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
