import type { Ref } from "react";
import { geoAlbersUsa, geoPath } from "d3-geo";
import type { City } from "../api/types";
import { STATE_FEATURES, US_COLLECTION } from "../lib/geo";
import type { Theme } from "../lib/themes";

export const US_MAP_WIDTH = 975;
export const US_MAP_HEIGHT = 610;

// Albers USA is the usual projection for US maps: it tucks Alaska and Hawaii
// under the Southwest so all 50 states fit in one picture.
const projection = geoAlbersUsa().fitSize([US_MAP_WIDTH, US_MAP_HEIGHT], US_COLLECTION);
const path = geoPath(projection);

// The mathematical centre of a few oddly shaped states falls outside the part
// people think of as "the state", so their labels are moved by hand.
const LABEL_NUDGE: Record<string, [number, number]> = {
  FL: [16, 8],
  MI: [14, 22],
  LA: [-8, 0],
};

// The outline of every state is worked out once, not on every render.
const SHAPES = STATE_FEATURES.map((shape) => {
  const [x, y] = path.centroid(shape);
  const [dx, dy] = LABEL_NUDGE[shape.state.code] ?? [0, 0];
  return {
    state: shape.state,
    d: path(shape) ?? "",
    center: [x + dx, y + dy],
    roomForLabel: path.area(shape) > 900,
  };
});

const LABEL_FONT = "'Overpass Variable', Arial, sans-serif";

type Props = {
  visitedStates: string[];
  visitedCities: City[];
  theme: Theme;
  showLabels: boolean;
  /** Leave out to make the map read-only (used on shared maps). */
  onToggleState?: (code: string, visited: boolean) => void;
  ref?: Ref<SVGSVGElement>;
};

export function UsMap({ visitedStates, visitedCities, theme, showLabels, onToggleState, ref }: Props) {
  const visited = new Set(visitedStates);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${US_MAP_WIDTH} ${US_MAP_HEIGHT}`}
      className="block h-auto w-full"
      role="img"
      aria-label={`Map of the United States with ${visited.size} states marked as visited`}
    >
      <rect width={US_MAP_WIDTH} height={US_MAP_HEIGHT} fill={theme.background} />

      {SHAPES.map(({ state, d }) => {
        const isVisited = visited.has(state.code);
        return (
          <path
            key={state.code}
            d={d}
            fill={isVisited ? theme.visited : theme.land}
            stroke={theme.border}
            strokeWidth={1}
            strokeLinejoin="round"
            className={onToggleState ? "map-region" : undefined}
            onClick={onToggleState ? () => onToggleState(state.code, !isVisited) : undefined}
          >
            <title>{state.name}</title>
          </path>
        );
      })}

      {showLabels &&
        SHAPES.filter((shape) => shape.roomForLabel).map(({ state, center }) => (
          <text
            key={state.code}
            x={center[0]}
            y={center[1]}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily={LABEL_FONT}
            fontSize={12}
            fontWeight={700}
            fill={visited.has(state.code) ? theme.inkOnVisited : theme.mutedInk}
            pointerEvents="none"
          >
            {state.code}
          </text>
        ))}

      {visitedCities.map((city) => {
        const point = projection([city.lon, city.lat]);
        if (!point) return null;
        return (
          <circle
            key={city.id}
            cx={point[0]}
            cy={point[1]}
            r={3.5}
            fill={theme.dot}
            stroke={theme.dotOutline}
            strokeWidth={1.2}
            pointerEvents="none"
          />
        );
      })}
    </svg>
  );
}
