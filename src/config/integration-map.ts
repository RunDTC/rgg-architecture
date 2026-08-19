/**
 * The Integration Map — a hub-and-spoke system landscape diagram, and the app's landing
 * view.
 *
 * This is a HIGHER ALTITUDE view than the System Landscape. Where the landscape shows every
 * node individually in swimlanes, this collapses the model into a dozen boxes arranged
 * around SCAYLE as the hub, with the Confluent/Flink event mesh as a bus band beneath it —
 * the idiom commerce stack diagrams use.
 *
 * The vertical axis carries the cutover: the SCAYLE estate and the third parties hanging
 * off it sit above the bus, the monolith and everything dying with it sits below, and the
 * integration layer is the band between them that both eras cross.
 *
 * Two things stay derived from the model rather than restated here, so the map cannot drift
 * out of sync:
 *
 *  - **Edges.** Any flow between a member of group A and a member of group B produces an
 *    A → B edge. The label is built from the distinct underlying flow labels.
 *  - **Phase.** Members filter by the Current/Target toggle, and a group with no surviving
 *    members disappears rather than rendering empty.
 *
 * What IS stated here is grouping and position — the editorial judgement a hub-and-spoke
 * diagram exists to express. Auto-layout (dagre) deliberately isn't used: it produces a
 * layered DAG, which is the thing this view is meant to be an alternative to.
 *
 * Every node should belong to exactly one group. An ungrouped node silently vanishes from
 * the landing page, so `IntegrationMapView` logs a dev-only console warning naming anything
 * missing or double-counted.
 */

export type GroupRole = "hub" | "bus" | "cluster";

export interface MapGroup {
  id: string;
  title: string;
  /** Optional line under the title — used to name what the box actually is. */
  subtitle?: string;
  /** Model node ids collapsed into this box. */
  members: string[];
  /** Top-left position and width on the map canvas, in pixels. */
  x: number;
  y: number;
  width: number;
  /** `hub` and `bus` get distinct visual treatment; everything else is a cluster. */
  role?: GroupRole;
  /** Border/heading accent. Defaults to slate. */
  accent?: string;
  /** Path under `public/` to a logo rendered in the box header. */
  logo?: string;
  /** Chip columns inside the box. Defaults to 2. */
  columns?: number;
}

/**
 * Label overrides for derived edges, keyed `"<sourceGroup>->:<targetGroup>"`.
 *
 * Derivation concatenates the distinct flow labels, which is right for a thin edge and
 * noisy for a thick one — the SCAYLE → integration edge alone aggregates several flows.
 * Where that happens, name the traffic instead of listing it.
 */
export const EDGE_LABELS: Record<string, string> = {
  "storefronts->scayle": "Catalog & cart · Checkout · Segments · Search",
  "rgg-custom->scayle": "Boutique assembly · Promotions · Credit & tiers",
  "scayle->commerce-partners": "Payments · Fraud · Tax",
  "scayle->integration": "Product events · Reservations · Order & inventory events",
  "integration->scayle": "Product master · Availability · Fulfillment · Segments",
  "scayle->data-stores": "Product master · Catalog · Inventory · Orders",
  "supply-finance->integration": "DC & vendor stock · Shipment confirmations",
  "integration->supply-finance": "DC & vendor release · Financial posting",
  "legacy->data-stores": "Products · Boutiques · Orders · Sessions · Replication",
};

/**
 * Layout is a three-column spine: storefronts and SCAYLE down the middle, satellites left
 * and right, and the event mesh spanning the full width so everything visibly crosses it.
 * Heights are computed from member count at render time, so only x/y/width live here.
 *
 * Accents reuse the tier and node-kind colors from `taxonomy.ts`, so a box here reads as
 * the same thing it reads as in the Landscape legend. All three third-party clusters share
 * the external slate for the same reason — "these are the given, not the decision" is the
 * signal, and three different colors would imply three different kinds of thing.
 */
export const mapGroups: MapGroup[] = [
  {
    id: "storefronts",
    title: "Storefronts & Apps",
    subtitle: "Rue La La · Gilt · iOS · Android",
    members: ["rue-web", "gilt-web", "ios-app", "android-app", "client-mediation"],
    x: 705,
    y: 0,
    width: 330,
    accent: "#38bdf8",
  },
  {
    id: "experience",
    title: "Experience & Platform",
    members: ["algolia", "eppo", "lily-ai", "edge-cdn", "okta", "zendesk"],
    x: 250,
    y: 230,
    width: 300,
    accent: "#94a3b8",
  },
  {
    id: "scayle",
    title: "SCAYLE",
    subtitle: "Commerce platform · target state",
    members: [
      "scayle-pim",
      "scayle-panel",
      "scayle-admin-api",
      "scayle-storefront-api",
      "scayle-checkout",
      "scayle-promotions",
      "scayle-oms",
      "scayle-search",
      "scayle-seller-center",
    ],
    x: 680,
    y: 230,
    width: 380,
    role: "hub",
    accent: "#a78bfa",
  },
  {
    id: "commerce-partners",
    title: "Commerce Partners",
    subtitle: "Payments · Fraud · Tax · Cross-border",
    members: [
      "braintree",
      "wallets-bnpl",
      "gift-cards",
      "riskified",
      "avalara",
      "esw",
      "narvar",
      "seel",
    ],
    x: 1190,
    y: 230,
    width: 300,
    accent: "#94a3b8",
  },
  {
    id: "marketing",
    title: "Marketing & Data",
    members: ["tealium", "iterable", "hightouch", "tableau"],
    x: 250,
    y: 580,
    width: 300,
    accent: "#94a3b8",
  },
  {
    id: "rgg-custom",
    title: "RGG Custom",
    subtitle: "RGG-built · fills the SCAYLE gaps",
    members: [
      "merch-app",
      "boutique-studio",
      "csr-console",
      "membership-service",
      "personalization",
    ],
    x: 705,
    y: 580,
    width: 330,
    accent: "#fb7185",
  },
  {
    id: "supply-finance",
    title: "Supply & Finance",
    members: [
      "vendor-feeds",
      "manhattan-wms",
      "dropship-platform",
      "marketplace-feeds",
      "peoplesoft-erp",
      "canto",
    ],
    x: 1190,
    y: 580,
    width: 300,
    accent: "#94a3b8",
  },
  {
    id: "integration",
    title: "Integration & Events",
    subtitle: "Confluent + Flink data mesh · every integration crosses here",
    members: [
      "kafka",
      "stream-processing",
      "product-sync",
      "inventory-sync",
      "order-integration",
    ],
    x: 250,
    y: 860,
    width: 1240,
    role: "bus",
    accent: "#34d399",
    columns: 5,
  },
  {
    id: "loyalty-affiliate",
    title: "Loyalty, Credit & Affiliate",
    subtitle: "No agreed target owner",
    members: ["loyalty-engine", "store-credit-ledger", "affiliate-engine"],
    x: 250,
    y: 1030,
    width: 300,
    accent: "#ff8496",
  },
  {
    id: "legacy",
    title: "Legacy Platform",
    subtitle: "Retires at cutover",
    members: [
      "storefront-monolith",
      "store-manager",
      "legacy-oms",
      "csr-tool",
      "image-pipeline",
      "legacy-db-replication",
    ],
    x: 705,
    y: 1030,
    width: 330,
    accent: "#f59e0b",
  },
  {
    id: "data-stores",
    title: "Data Stores",
    members: [
      "data-platform",
      "redis-sessions",
      "s3-media",
      "monolith-db",
      "store-manager-db",
      "merch-app-db",
      "scayle-catalog-store",
      "scayle-order-store",
    ],
    x: 1190,
    y: 1030,
    width: 300,
    accent: "#22d3ee",
  },
];
