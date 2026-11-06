/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

// The map files are large JSON documents. Declaring their type here stops
// TypeScript from trying to work out a type for every coordinate in them.
declare module "us-atlas/states-10m.json" {
  const topology: import("topojson-specification").Topology;
  export default topology;
}

declare module "world-atlas/countries-50m.json" {
  const topology: import("topojson-specification").Topology;
  export default topology;
}
