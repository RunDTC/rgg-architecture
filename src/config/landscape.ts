import type { Tier } from "@/config/taxonomy";

/**
 * A swimlane column in the System Landscape view. Membership resolves in one of three ways:
 *  - `{ tier }`  — every system of that tier, in `systems.ts` order (the usual case)
 *  - `{ kind }`  — every datastore/external NOT already claimed by an explicit `{ ids }`
 *                  lane, in file order. Acts as a catch-all, so a node added later can
 *                  never silently vanish from this view.
 *  - `{ ids }`   — an explicit id list, for custom groupings that don't map to a tier/kind
 *
 * With tier/kind lanes, a newly-added system automatically appears in its lane — no need
 * to touch this file for routine additions. Keep a lane for every tier and both kinds so
 * no node is left unpositioned (unpositioned nodes silently disappear from this view).
 *
 * Ordering matters twice: a node listed in two lanes lands in the LATER one, and the
 * `{ kind }` catch-all only subtracts ids claimed elsewhere — so keep catch-alls last.
 */
export type LaneSpec =
  | { title: string; tier: Tier }
  | { title: string; kind: "datastore" | "external" }
  | { title: string; ids: string[] };

export const lanes: LaneSpec[] = [
  { title: "Legacy Platform", tier: "legacy" },
  { title: "Experience Layer", tier: "experience" },
  { title: "SCAYLE Commerce Core", tier: "commerce" },
  { title: "Integration & Events", tier: "integration" },
  { title: "RGG Custom", tier: "custom" },
  { title: "Data Stores", kind: "datastore" },

  // The 24 third parties are split by role — one column would be a ~2,700px lane.
  {
    title: "Commerce Partners",
    ids: [
      "braintree",
      "wallets-bnpl",
      "gift-cards",
      "riskified",
      "avalara",
      "esw",
      "narvar",
      "seel",
    ],
  },
  {
    title: "Supply & Finance",
    ids: [
      "vendor-feeds",
      "manhattan-wms",
      "dropship-platform",
      "marketplace-feeds",
      "peoplesoft-erp",
      "canto",
    ],
  },
  {
    title: "Data, Growth & Platform",
    ids: [
      "algolia",
      "eppo",
      "tealium",
      "iterable",
      "hightouch",
      "lily-ai",
      "zendesk",
      "okta",
      "tableau",
      "edge-cdn",
    ],
  },

  // Catch-all for any external not claimed above. Renders empty today; keep it LAST.
  { title: "Other External Services", kind: "external" },
];
