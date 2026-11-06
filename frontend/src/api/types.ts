// These match the JSON described in /api/API.md.

export type User = { id: number; email: string; displayName: string };

export type AuthResponse = { token: string; user: User };

export type City = {
  id: number;
  name: string;
  stateCode: string;
  lat: number;
  lon: number;
  population: number;
};

export type Visits = { states: string[]; countries: string[]; cities: City[] };

export type Settings = { theme: string; showLabels: boolean };

export type ShareLink = { slug: string };

export type SharedMap = Settings & Visits & { displayName: string };
