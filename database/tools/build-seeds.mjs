// Regenerates database/init/02_seed_states.sql and 03_seed_cities.sql.
//
//   cd database/tools && npm install && npm run build
//
// City data comes from the "all-the-cities" npm package, which repackages the
// GeoNames "cities1000" export (every populated place with 1,000+ residents).
// GeoNames data is licensed CC BY 4.0 - keep the credit in your app's footer.
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const allCities = require("all-the-cities");
const usAtlas = require("us-atlas/states-10m.json");
const states = JSON.parse(readFileSync(new URL("./states.json", import.meta.url)));

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

// --- states -----------------------------------------------------------------
// Cross-check our postal-code table against the map file the frontend draws,
// so a FIPS typo here can never silently break a state on the map.
const atlasNames = new Map(usAtlas.objects.states.geometries.map((g) => [g.id, g.properties.name]));
for (const [code, fips, name] of states) {
  if (atlasNames.get(fips) !== name) {
    throw new Error(`${code}: FIPS ${fips} is "${atlasNames.get(fips)}" in us-atlas, expected "${name}"`);
  }
}

const stateSql =
  "-- 50 states plus DC. code = postal abbreviation, fips = Census code used by the map file.\n" +
  "INSERT INTO states (code, fips, name) VALUES\n" +
  states.map(([code, fips, name]) => `  (${q(code)}, ${q(fips)}, ${q(name)})`).join(",\n") +
  "\nON CONFLICT (code) DO NOTHING;\n";
writeFileSync(new URL("../init/02_seed_states.sql", import.meta.url), stateSql);

// --- cities -----------------------------------------------------------------
const stateCodes = new Set(states.map((s) => s[0]));
// PPLX = neighbourhood inside a city, PPLQ = abandoned place. Everything else is a real town or city.
const skip = new Set(["PPLX", "PPLQ"]);
const cities = allCities
  .filter((c) => c.country === "US" && stateCodes.has(c.adminCode) && !skip.has(c.featureCode))
  .map((c) => ({
    id: Number(c.cityId),
    name: c.name,
    state: c.adminCode,
    lat: c.loc.coordinates[1],
    lon: c.loc.coordinates[0],
    population: c.population,
  }))
  .sort((a, b) => a.state.localeCompare(b.state) || b.population - a.population);

let citySql =
  `-- ${cities.length} US cities and towns with 1,000+ residents.\n` +
  "-- Source: GeoNames (https://www.geonames.org), CC BY 4.0. id is the GeoNames id.\n";
for (let i = 0; i < cities.length; i += 500) {
  citySql +=
    "INSERT INTO cities (id, name, state_code, lat, lon, population) VALUES\n" +
    cities
      .slice(i, i + 500)
      .map((c) => `  (${c.id}, ${q(c.name)}, ${q(c.state)}, ${c.lat}, ${c.lon}, ${c.population})`)
      .join(",\n") +
    "\nON CONFLICT (id) DO NOTHING;\n";
}
writeFileSync(new URL("../init/03_seed_cities.sql", import.meta.url), citySql);

console.log(`Wrote ${states.length} states and ${cities.length} cities.`);
