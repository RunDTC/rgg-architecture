import type { Tier } from "@/config/taxonomy";

/**
 * A swimlane column in the System Landscape view. Membership resolves in one of three ways:
 *  - `{ tier }`  — every system of that tier, in `systems.ts` order (the usual case)
 *  - `{ kind }`  — every datastore, or every external, in file order
 *  - `{ ids }`   — an explicit id list, for custom groupings that don't map to a tier/kind
 *
 * With tier/kind lanes, a newly-added system automatically appears in its lane — no need
 * to touch this file for routine additions. Keep a lane for every tier and both kinds so
 * no node is left unpositioned (unpositioned nodes silently disappear from this view).
 */
export type LaneSpec =
  | { title: string; tier: Tier }
  | { title: string; kind: "datastore" | "external" }
  | { title: string; ids: string[] };

export const lanes: LaneSpec[] = [
  { title: "Internal Ops", tier: "internal" },
  { title: "Storefront & Checkout", tier: "storefront" },
  { title: "Edge Services", tier: "edge" },
  { title: "Legacy", tier: "legacy" },
  { title: "Planned", tier: "planned" },
  { title: "Data Stores", kind: "datastore" },
  { title: "External Services", kind: "external" },
];
