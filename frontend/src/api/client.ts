import { useAuthStore } from "../store/authStore";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

/** An error with a message that is safe to show to the user. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

type Options = { method?: "GET" | "POST" | "PUT" | "DELETE"; body?: unknown };

/** Calls the backend. Adds the login token when there is one and turns failures into ApiError. */
export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const token = useAuthStore.getState().token;
  const response = await send(path, options, token);

  if (response.status === 401 && token) {
    // The saved login has expired. Forget it, and if this was a public
    // request (states, cities, shared maps) just ask again without it.
    useAuthStore.getState().logOut();
    if (!path.startsWith("/api/me") && path !== "/api/share") {
      return read<T>(await send(path, options, null));
    }
    throw new ApiError(401, "Your login has expired. Log in again to keep saving your map.");
  }
  return read<T>(response);
}

async function send(path: string, options: Options, token: string | null): Promise<Response> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    return await fetch(BASE_URL + path, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(0, "Can't reach the server. Check your connection and that the backend is running.");
  }
}

async function read<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // Not JSON: handled below.
  }
  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data && typeof data.message === "string"
        ? data.message
        : response.status >= 500
          ? "The server isn't responding. Check that the backend is running."
          : `Request failed (${response.status})`;
    throw new ApiError(response.status, message);
  }
  return data as T;
}
