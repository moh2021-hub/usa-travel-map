import type { ReactNode } from "react";

/** The bordered panel every map sits in. */
export function MapFrame({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden rounded-xl border border-curb bg-white">{children}</div>;
}
