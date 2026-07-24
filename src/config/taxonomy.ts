/**
 * Taxonomy — the single source of truth for every categorical vocabulary in the model.
 *
 * Each vocabulary is a readonly array of `{ id, label, ...colors }`. The union *types*
 * (`Tier`, `Domain`, …) are derived from the arrays, and `src/lib/theme.ts` derives its
 * color/label maps from them too. So adding (say) a new domain is a ONE-LINE edit here —
 * the type, the chip color, the legend, and the chip order all follow automatically.
 *
 * Array order is display order (e.g. the Data Flows chip order).
 *
 * This file, `site.ts`, `landscape.ts`, and everything under `src/data/` are the only
 * files a new client should need to touch.
 */

/** System tiers — drive a node's accent/background and the default swimlane grouping. */
export const TIERS = [
  { id: "legacy", label: "Legacy", accent: "#f59e0b", bg: "#2a2115" },
  { id: "storefront", label: "Storefront", accent: "#38bdf8", bg: "#132433" },
  { id: "edge", label: "Edge Service", accent: "#a78bfa", bg: "#221d33" },
  { id: "internal", label: "Internal Ops", accent: "#34d399", bg: "#132b22" },
  { id: "planned", label: "Planned", accent: "#94a3b8", bg: "#1e242d" },
] as const;
export type Tier = (typeof TIERS)[number]["id"];

/** Lifecycle status of a first-party system. */
export const SYSTEM_STATUSES = [
  { id: "production", label: "Production", color: "#34d399" },
  { id: "migrating-in", label: "Ramping up", color: "#38bdf8" },
  { id: "migrating-out", label: "Being replaced", color: "#f59e0b" },
  { id: "planned", label: "Planned", color: "#94a3b8" },
  { id: "deprecated", label: "Deprecated", color: "#f87171" },
] as const;
export type SystemStatus = (typeof SYSTEM_STATUSES)[number]["id"];

/** Kinds of edges between two nodes. */
export const FLOW_KINDS = [
  { id: "api-call", label: "API call" },
  { id: "read", label: "Read" },
  { id: "write", label: "Write" },
  { id: "read-write", label: "Read/write" },
  { id: "sync", label: "Sync" },
  { id: "webhook", label: "Webhook" },
  { id: "cron", label: "Cron job" },
  { id: "queue", label: "Queue" },
  { id: "handoff", label: "User handoff" },
  { id: "export", label: "Data export" },
] as const;
export type FlowKind = (typeof FLOW_KINDS)[number]["id"];

/** Business domains a flow can belong to. Array order = Data Flows chip order. */
export const DOMAINS = [
  { id: "orders", label: "Orders", color: "#38bdf8" },
  { id: "payments", label: "Payments", color: "#34d399" },
  { id: "catalog", label: "Catalog", color: "#f59e0b" },
  { id: "inventory", label: "Inventory", color: "#4ade80" },
  { id: "fulfillment", label: "Fulfillment", color: "#fb923c" },
  { id: "customers", label: "Customers", color: "#a78bfa" },
  { id: "marketing", label: "Marketing", color: "#f472b6" },
  { id: "search", label: "Search", color: "#22d3ee" },
  { id: "reporting", label: "Reporting", color: "#fb7185" },
] as const;
export type Domain = (typeof DOMAINS)[number]["id"];

/** Progress of a legacy → modern migration. */
export const MIGRATION_STATUSES = [
  { id: "planned", label: "Planned", color: "#94a3b8" },
  { id: "in-progress", label: "In progress", color: "#38bdf8" },
  { id: "near-complete", label: "Near complete", color: "#34d399" },
  { id: "complete", label: "Complete", color: "#10b981" },
] as const;
export type MigrationStatus = (typeof MIGRATION_STATUSES)[number]["id"];

/**
 * Fixed visuals for the non-system node kinds. Datastores and externals don't have a
 * tier — they get one constant look each, used by `nodeVisual()` and the legend.
 */
export const NODE_KIND_VISUALS = {
  datastore: { accent: "#22d3ee", bg: "#12292e", label: "Data Store" },
  external: { accent: "#fb7185", bg: "#2c1a20", label: "External" },
} as const;
