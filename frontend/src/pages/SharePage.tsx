import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { SharedMap } from "../api/types";
import { MapFrame } from "../components/MapFrame";
import { RoadSign } from "../components/RoadSign";
import { UsMap } from "../components/UsMap";
import { getTheme } from "../lib/themes";
import { US_STATES } from "../lib/usStates";

/** The read-only page behind a share link. Anyone can open it without logging in. */
export default function SharePage() {
  const { slug = "" } = useParams();
  const shared = useQuery({
    queryKey: ["share", slug],
    queryFn: () => api<SharedMap>(`/api/share/${encodeURIComponent(slug)}`),
    retry: false,
  });

  if (shared.isPending) {
    return <main className="mx-auto max-w-7xl px-4 py-6 text-lg">Loading the map…</main>;
  }

  if (shared.isError) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="m-0 text-3xl font-extrabold">This map can't be shown</h1>
        <p className="text-lg">{shared.error.message}</p>
        <Link to="/" className="button button-primary no-underline">
          Make your own map
        </Link>
      </main>
    );
  }

  const map = shared.data;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-5 mt-0 text-3xl font-extrabold tracking-tight sm:text-4xl">
        Where {map.displayName} has been
      </h1>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <MapFrame>
          <UsMap
            visitedStates={map.states}
            visitedCities={map.cities}
            theme={getTheme(map.theme)}
            showLabels={map.showLabels}
          />
        </MapFrame>
        <aside className="grid gap-6">
          <RoadSign
            rows={[
              { label: "States", value: map.states.length, total: US_STATES.length },
              { label: "Cities", value: map.cities.length },
              { label: "Countries", value: map.countries.length },
            ]}
          />
          <Link to="/" className="button button-primary no-underline">
            Make your own map
          </Link>
        </aside>
      </div>
    </main>
  );
}
