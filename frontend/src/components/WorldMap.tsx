import { useRef, type Ref } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { COUNTRIES } from "../lib/world";
import type { Theme } from "../lib/themes";
import { useZoom } from "../hooks/useZoom";
import { ZoomControls } from "./ZoomControls";

const WIDTH = 975;
const HEIGHT = 500;

const projection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], { type: "Sphere" });
const path = geoPath(projection);
const SHAPES = COUNTRIES.map((country) => ({ ...country, d: path(country.shape) ?? "" }));

type Props = {
  visitedCountries: string[];
  theme: Theme;
  onToggleCountry: (code: string, visited: boolean) => void;
  ref?: Ref<SVGSVGElement>;
};

export function WorldMap({ visitedCountries, theme, onToggleCountry, ref }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { transform, zoomIn, zoomOut, reset } = useZoom(svgRef, WIDTH, HEIGHT, 24);
  const visited = new Set(visitedCountries);

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
        aria-label={`World map with ${visited.size} countries marked as visited`}
      >
        <rect width={WIDTH} height={HEIGHT} fill={theme.background} />
        <g transform={transform.toString()}>
          {SHAPES.map(({ code, name, d }) => {
            const isVisited = visited.has(code);
            return (
              <path
                key={code}
                d={d}
                fill={isVisited ? theme.visited : theme.land}
                stroke={theme.border}
                strokeWidth={0.5 / transform.k}
                strokeLinejoin="round"
                className="map-region"
                onClick={() => onToggleCountry(code, !isVisited)}
              >
                <title>{name}</title>
              </path>
            );
          })}
        </g>
      </svg>
      <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={reset} />
    </div>
  );
}
