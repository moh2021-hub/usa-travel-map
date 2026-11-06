import { useState } from "react";
import { api, ApiError } from "../api/client";
import type { City } from "../api/types";
import { setCityVisited } from "../lib/sync";
import { useTravelStore } from "../store/travelStore";

type Status =
  | { step: "idle" }
  | { step: "looking" }
  | { step: "found"; city: City }
  | { step: "failed"; message: string };

/** Uses the browser's location to work out which city the user is in right now. */
export function LocateButton() {
  const [status, setStatus] = useState<Status>({ step: "idle" });
  const visitedCities = useTravelStore((s) => s.cities);

  function locate() {
    if (!("geolocation" in navigator)) {
      setStatus({ step: "failed", message: "This browser can't share its location. Search for your city instead." });
      return;
    }
    setStatus({ step: "looking" });
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const city = await api<City>(`/api/cities/nearest?lat=${coords.latitude}&lon=${coords.longitude}`);
          setStatus({ step: "found", city });
        } catch (error) {
          setStatus({
            step: "failed",
            message: error instanceof ApiError ? error.message : "Your city could not be looked up.",
          });
        }
      },
      (error) =>
        setStatus({
          step: "failed",
          message:
            error.code === error.PERMISSION_DENIED
              ? "Location is blocked for this site. Allow it in your browser, or open a state and search for your city."
              : "Your location could not be found. Open a state and search for your city instead.",
        }),
      { timeout: 10000 },
    );
  }

  const found = status.step === "found" ? status.city : null;
  const alreadyVisited = found !== null && visitedCities.some((city) => city.id === found.id);

  return (
    <section>
      <h2 className="mb-2 mt-0 text-base font-bold">Where you are now</h2>
      <button type="button" className="button w-full" onClick={locate} disabled={status.step === "looking"}>
        {status.step === "looking" ? "Finding your city…" : "Find the city I'm in"}
      </button>
      {found && (
        <div className="mt-2 text-sm" role="status">
          <p className="my-1">
            The nearest city is{" "}
            <strong>
              {found.name}, {found.stateCode}
            </strong>
            .
          </p>
          {alreadyVisited ? (
            <p className="my-1">It's on your map.</p>
          ) : (
            <button type="button" className="button button-primary" onClick={() => setCityVisited(found, true)}>
              Add {found.name} to my map
            </button>
          )}
        </div>
      )}
      {status.step === "failed" && (
        <p role="alert" className="mb-0 mt-2 text-sm text-red-800">
          {status.message}
        </p>
      )}
    </section>
  );
}
