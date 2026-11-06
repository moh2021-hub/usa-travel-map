import { api, ApiError } from "../api/client";
import type { City, Settings, Visits } from "../api/types";
import { useAuthStore } from "../store/authStore";
import { useTravelStore } from "../store/travelStore";

/*
  Every change the user makes goes through these functions.

  1. The change is applied in the browser straight away, so the map feels instant.
  2. If someone is logged in, the same change is sent to the backend.
  3. If the backend refuses or can't be reached, the change is undone and a
     message is shown, so the screen never claims something was saved when it wasn't.
*/

const travel = () => useTravelStore.getState();
const loggedIn = () => useAuthStore.getState().token !== null;

async function save(request: () => Promise<unknown>, undo: () => void) {
  if (!loggedIn()) return;
  try {
    await request();
    travel().setSyncError(null);
  } catch (error) {
    undo();
    travel().setSyncError(error instanceof ApiError ? error.message : "That change could not be saved.");
  }
}

export function setStateVisited(code: string, visited: boolean) {
  travel().setStateVisited(code, visited);
  return save(
    () => api(`/api/me/visits/states/${code}`, { method: visited ? "PUT" : "DELETE" }),
    () => travel().setStateVisited(code, !visited),
  );
}

export function setCountryVisited(code: string, visited: boolean) {
  travel().setCountryVisited(code, visited);
  return save(
    () => api(`/api/me/visits/countries/${encodeURIComponent(code)}`, { method: visited ? "PUT" : "DELETE" }),
    () => travel().setCountryVisited(code, !visited),
  );
}

export function setCityVisited(city: City, visited: boolean) {
  const before = { states: travel().states, countries: travel().countries, cities: travel().cities };
  travel().setCityVisited(city, visited);
  return save(
    () => api(`/api/me/visits/cities/${city.id}`, { method: visited ? "PUT" : "DELETE" }),
    () => travel().replaceVisits(before),
  );
}

export function setSettings(change: Partial<Settings>) {
  const before: Settings = { theme: travel().theme, showLabels: travel().showLabels };
  travel().setSettings(change);
  return save(
    () => api("/api/me/settings", { method: "PUT", body: { ...before, ...change } }),
    () => travel().setSettings(before),
  );
}

/**
 * Called right after logging in or creating an account. Places picked while
 * logged out are added to the account, then the account's full map is loaded.
 */
export async function syncAfterLogin(isNewAccount: boolean) {
  const { states, countries, cities, theme, showLabels } = travel();
  try {
    const visits = await api<Visits>("/api/me/visits/merge", {
      method: "POST",
      body: { states, countries, cityIds: cities.map((city) => city.id) },
    });
    travel().replaceVisits(visits);
    if (isNewAccount) {
      await api("/api/me/settings", { method: "PUT", body: { theme, showLabels } });
    } else {
      travel().setSettings(await api<Settings>("/api/me/settings"));
    }
    travel().setSyncError(null);
  } catch (error) {
    travel().setSyncError(error instanceof ApiError ? error.message : "Your map could not be loaded.");
  }
}

/** Called when the app opens with a saved login, to pick up changes made on another device. */
export async function loadFromAccount() {
  if (!loggedIn()) return;
  try {
    travel().replaceVisits(await api<Visits>("/api/me/visits"));
    travel().setSettings(await api<Settings>("/api/me/settings"));
    travel().setSyncError(null);
  } catch (error) {
    if (error instanceof ApiError && error.status !== 401) travel().setSyncError(error.message);
  }
}

/**
 * Logging out also clears the map from this browser. It is safe in the
 * account, and the next person to use this browser should start with a blank map.
 */
export function logOut() {
  useAuthStore.getState().logOut();
  travel().replaceVisits({ states: [], countries: [], cities: [] });
  travel().setSyncError(null);
}
