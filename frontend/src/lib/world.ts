import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection } from "topojson-specification";
import worldTopology from "world-atlas/countries-50m.json";

export type Country = { code: string; name: string; shape: Feature<Geometry> };

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const seen = new Set<string>();

/**
 * Countries and territories from the Natural Earth world map. `code` is the
 * ISO 3166-1 numeric code ("840" for the United States). A handful of disputed
 * areas have no ISO code, so they get one made from their name ("x-kosovo").
 */
export const COUNTRIES: Country[] = (
  feature(worldTopology, worldTopology.objects.countries as GeometryCollection) as FeatureCollection<
    Geometry,
    { name: string }
  >
).features
  .map((shape) => ({
    code: shape.id !== undefined ? String(shape.id) : `x-${slug(shape.properties.name)}`,
    name: shape.properties.name,
    shape,
  }))
  .filter((country) => !seen.has(country.code) && seen.add(country.code))
  .sort((a, b) => a.name.localeCompare(b.name));
