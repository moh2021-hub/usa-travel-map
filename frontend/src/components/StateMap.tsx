import { useMemo, useRef, type Ref } from "react";
import { geoAlbers, geoCentroid, geoPath } from "d3-geo";
import type { City } from "../api/types";
import type { StateFeature } from "../lib/geo";
import type { Theme } from "../lib/themes";
import { useZoom } from "../hooks/useZoom";
import { ZoomControls } from "./ZoomControls";

const WIDTH = 760;
const HEIGHT = 560;
const MARGIN = 24;
const LABEL_FONT = "'Overpass Variable', Arial, sans-serif";

type Props = {
  shape: StateFeature;
  stateVisited: boolean;
  /** Every city to draw as a dot. */
  cities: City[];
  visitedCityIds: Set<number>;
  theme: Theme;
  onToggleCity: (city: City, visited: boolean) => void;
  ref?: Ref<SVGSVGElement>;
};

export function StateMap({ shape, stateVisited, cities, visitedCityIds, theme, onToggleCity, ref }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { transform, zoomIn, zoomOut, reset } = useZoom(svgRef, WIDTH, HEIGHT);

  // A projection centred on this one state, so it is drawn upright and as large as possible.
  const { outline, project } = useMemo(() => {
    const [lon, lat] = geoCentroid(shape);
    const projection = geoAlbers()
      .rotate([-lon, 0])
      .center([0, lat])
      .parallels([lat - 2, lat + 2])
      .fitExtent(
        [
          [MARGIN, MARGIN],
          [WIDTH - MARGIN, HEIGHT - MARGIN],
        ],
        shape,
      );
    return { outline: geoPath(projection)(shape) ?? "", project: projection };
  }, [shape]);

  // Dots and text stay the same size on screen however far the map is zoomed in.
  const k = transform.k;

  // Name the visited cities first, then the biggest ones, skipping any name
  // that would be drawn on top of one already placed.
  const labelled = new Set<number>();
  const placed: { left: number; right: number; top: number; bottom: number }[] = [];
  const candidates = [...cities].sort(
    (a, b) => Number(visitedCityIds.has(b.id)) - Number(visitedCityIds.has(a.id)) || b.population - a.population,
  );
  for (const city of candidates) {
    const isVisited = visitedCityIds.has(city.id);
    if (!isVisited && labelled.size >= Math.round(10 * k)) break;
    const point = project([city.lon, city.lat]);
    if (!point) continue;
    // Where the dot is on screen after zooming and dragging. Skip cities outside the picture.
    const [x, y] = transform.apply(point);
    if (x < 0 || x > WIDTH || y < 0 || y > HEIGHT) continue;
    // A letter is roughly 7 wide and 14 tall.
    const box = { left: x - 8, right: x + 12 + city.name.length * 7, top: y - 9, bottom: y + 9 };
    const overlaps = placed.some(
      (other) => box.left < other.right && box.right > other.left && box.top < other.bottom && box.bottom > other.top,
    );
    if (overlaps && !isVisited) continue;
    labelled.add(city.id);
    placed.push(box);
  }

  // Visited dots are drawn last so they sit on top.
  const ordered = [...cities].sort(
    (a, b) => Number(visitedCityIds.has(a.id)) - Number(visitedCityIds.has(b.id)) || a.population - b.population,
  );

  const setRefs = (element: SVGSVGElement | null) => {
    svgRef.current = element;
    if (typeof ref === "function") ref(element);
    else if (ref) ref.current = element;
  };

  return (
    <div className="relative">
      <svg
        ref={setRefs}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="block h-auto w-full cursor-grab touch-none active:cursor-grabbing"
        role="img"
        aria-label={`Map of ${shape.state.name} showing ${cities.length} cities, ${visitedCityIds.size} marked as visited`}
      >
        <rect width={WIDTH} height={HEIGHT} fill={theme.background} />
        <g transform={transform.toString()}>
          <path
            d={outline}
            fill={stateVisited ? theme.visited : theme.land}
            stroke={theme.border}
            strokeWidth={1.5 / k}
            strokeLinejoin="round"
          />
          {ordered.map((city) => {
            const point = project([city.lon, city.lat]);
            if (!point) return null;
            const isVisited = visitedCityIds.has(city.id);
            return (
              <g
                key={city.id}
                className="map-region"
                onClick={() => onToggleCity(city, !isVisited)}
              >
                <title>{`${city.name} (${city.population.toLocaleString("en-US")})`}</title>
                {/* A larger invisible circle makes small dots easy to hit. */}
                <circle cx={point[0]} cy={point[1]} r={9 / k} fill="transparent" />
                <circle
                  cx={point[0]}
                  cy={point[1]}
                  r={(isVisited ? 5.5 : 3) / k}
                  fill={isVisited ? theme.dot : theme.background}
                  stroke={theme.dotOutline}
                  strokeWidth={(isVisited ? 1.5 : 1) / k}
                  opacity={isVisited ? 1 : 0.85}
                />
                {labelled.has(city.id) && (
                  <text
                    x={point[0] + 8 / k}
                    y={point[1]}
                    dominantBaseline="central"
                    fontFamily={LABEL_FONT}
                    fontSize={12 / k}
                    fontWeight={isVisited ? 800 : 600}
                    fill={stateVisited ? theme.inkOnVisited : theme.ink}
                    stroke={stateVisited ? theme.visited : theme.land}
                    strokeWidth={3 / k}
                    paintOrder="stroke"
                    pointerEvents="none"
                  >
                    {city.name}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={reset} />
    </div>
  );
}
