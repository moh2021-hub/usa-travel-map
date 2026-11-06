import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection } from "topojson-specification";
import usTopology from "us-atlas/states-10m.json";
import { STATE_BY_FIPS, type UsState } from "./usStates";

export type StateFeature = Feature<Geometry> & { state: UsState };

/**
 * The shapes of the 50 states and DC, converted once from the compact TopoJSON
 * map file into ordinary GeoJSON that d3-geo can draw.
 */
export const STATE_FEATURES: StateFeature[] = (
  feature(usTopology, usTopology.objects.states as GeometryCollection) as FeatureCollection<Geometry>
).features.flatMap((shape) => {
  const state = STATE_BY_FIPS.get(String(shape.id));
  return state ? [{ ...shape, state }] : []; // drops territories such as Puerto Rico
});

export const STATE_FEATURE_BY_CODE = new Map(STATE_FEATURES.map((f) => [f.state.code, f]));

export const US_COLLECTION: FeatureCollection<Geometry> = {
  type: "FeatureCollection",
  features: STATE_FEATURES,
};

export const formatNumber = (value: number) => value.toLocaleString("en-US");
