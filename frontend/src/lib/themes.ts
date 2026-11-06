/** Colors for one look of the map. Used both on screen and in the downloaded image. */
export type Theme = {
  id: string;
  name: string;
  background: string;
  /** Places not visited yet. */
  land: string;
  visited: string;
  /** Lines between states or countries. */
  border: string;
  /** A visited city. */
  dot: string;
  dotOutline: string;
  /** Text drawn on the background and on unvisited land. */
  ink: string;
  mutedInk: string;
  /** Text drawn on top of a visited shape. */
  inkOnVisited: string;
};

export const THEMES: Theme[] = [
  {
    id: "interstate",
    name: "Interstate",
    background: "#f4f6f3",
    land: "#d5dbd3",
    visited: "#006747",
    border: "#ffffff",
    dot: "#ffcd00",
    dotOutline: "#1d2327",
    ink: "#1d2327",
    mutedInk: "#59636a",
    inkOnVisited: "#ffffff",
  },
  {
    id: "canyon",
    name: "Canyon",
    background: "#f7efe6",
    land: "#e5d3c0",
    visited: "#b4491f",
    border: "#f7efe6",
    dot: "#2b2118",
    dotOutline: "#f7efe6",
    ink: "#2b2118",
    mutedInk: "#6f5d4d",
    inkOnVisited: "#ffffff",
  },
  {
    id: "lake",
    name: "Lake",
    background: "#eff5f8",
    land: "#cddbe5",
    visited: "#1d5e8c",
    border: "#ffffff",
    dot: "#ff9d2e",
    dotOutline: "#12283a",
    ink: "#12283a",
    mutedInk: "#4f6577",
    inkOnVisited: "#ffffff",
  },
  {
    id: "dusk",
    name: "Dusk",
    background: "#f3eef6",
    land: "#d9cfe3",
    visited: "#5b3a8c",
    border: "#ffffff",
    dot: "#f2b33d",
    dotOutline: "#24173a",
    ink: "#24173a",
    mutedInk: "#63567a",
    inkOnVisited: "#ffffff",
  },
  {
    id: "night",
    name: "Night",
    background: "#111b24",
    land: "#263b4d",
    visited: "#f2c14e",
    border: "#111b24",
    dot: "#ffffff",
    dotOutline: "#111b24",
    ink: "#f4f6f3",
    mutedInk: "#9fb1c1",
    inkOnVisited: "#111b24",
  },
];

export const DEFAULT_THEME_ID = "interstate";

export function getTheme(id: string): Theme {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0];
}
