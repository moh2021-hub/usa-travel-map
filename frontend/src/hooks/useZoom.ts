import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { select } from "d3-selection";
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from "d3-zoom";

/**
 * Scroll, pinch and drag to zoom an <svg>. Returns the current transform to
 * apply to a <g> inside it, plus functions for + / - / reset buttons.
 */
export function useZoom(svgRef: RefObject<SVGSVGElement | null>, width: number, height: number, maxScale = 16) {
  const [transform, setTransform] = useState<ZoomTransform>(zoomIdentity);
  const behavior = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, maxScale])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .on("zoom", (event) => setTransform(event.transform));
    behavior.current = zoomBehavior;
    const selection = select(svg);
    selection.call(zoomBehavior).on("dblclick.zoom", null);
    return () => {
      selection.on(".zoom", null);
    };
  }, [svgRef, width, height, maxScale]);

  const zoomBy = useCallback(
    (factor: number) => {
      if (svgRef.current && behavior.current) behavior.current.scaleBy(select(svgRef.current), factor);
    },
    [svgRef],
  );

  const reset = useCallback(() => {
    if (svgRef.current && behavior.current) behavior.current.transform(select(svgRef.current), zoomIdentity);
  }, [svgRef]);

  return { transform, zoomIn: () => zoomBy(1.6), zoomOut: () => zoomBy(1 / 1.6), reset };
}
