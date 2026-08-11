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

/**
 * System tiers — drive a node's accent/background and the default swimlane grouping.
 *
 * Tier answers "what role does this play", NOT "when does it exist" — `status` carries
 * the cutover timeline. That split is deliberate: a `planned` tier would collapse the
 * whole SCAYLE target architecture into one gray column, which is the opposite of what
 * this model is for. `status: "planned"` already dashes a node's border (`ArchNode.tsx`).
 *
 * `legacy` vs `custom` is the other load-bearing distinction: both are RGG-built, but
 * legacy systems die at cutover while custom systems survive and get re-integrated.
 */
export const TIERS = [
  { id: "legacy", label: "Legacy Platform", accent: "#f59e0b", bg: "#2a2115" },
  { id: "experience", label: "Experience Layer", accent: "#38bdf8", bg: "#132433" },
  { id: "commerce", label: "SCAYLE Commerce Core", accent: "#a78bfa", bg: "#221d33" },
  { id: "integration", label: "Integration & Events", accent: "#34d399", bg: "#132b22" },
  { id: "custom", label: "RGG Custom", accent: "#fb7185", bg: "#2c1a20" },
] as const;
export type Tier = (typeof TIERS)[number]["id"];

/**
 * Lifecycle status of a first-party system, expressed against the cutover.
 *
 * `at-risk` is for capabilities with no agreed target owner — calling them "production"
 * or "planned" would both be untrue. Today that's the loyalty engine, the store credit
 * ledger, the affiliate engine, and personalization/boutique sort.
 *
 * Every color here clears WCAG AA (4.5:1) as small text on all seven node backgrounds
 * and on the panel surfaces — status is rendered as a *text label*, not just a dot, so
 * the 3:1 non-text threshold isn't the one that applies. `planned` and `deprecated` are
 * deliberately far apart in lightness rather than both mid-slate: they're the two neutral
 * statuses, so lightness is the only channel left to tell them apart.
 */
export const SYSTEM_STATUSES = [
  { id: "production", label: "Unchanged", color: "#34d399" },
  { id: "migrating-in", label: "Retained · re-pointed", color: "#38bdf8" },
  { id: "migrating-out", label: "Retiring at cutover", color: "#f59e0b" },
  { id: "planned", label: "Target state", color: "#bac6d6" },
  { id: "at-risk", label: "Unresolved · open risk", color: "#ff8496" },
  { id: "deprecated", label: "Decommissioned", color: "#8896ab" },
] as const;
export type SystemStatus = (typeof SYSTEM_STATUSES)[number]["id"];

/**
 * Kinds of edges between two nodes.
 *
 * `event` (not `queue`) because RGG's backbone is a Confluent/Flink data mesh, not a job
 * queue; `batch` (not `cron`) because the batch traffic here is file feeds — vendor
 * offer sheets, ERP posting, marketplace feeds — rather than scheduled jobs.
 */
export const FLOW_KINDS = [
  { id: "api-call", label: "API call" },
  { id: "read", label: "Read" },
  { id: "write", label: "Write" },
  { id: "read-write", label: "Read/write" },
  { id: "sync", label: "Sync" },
  { id: "webhook", label: "Webhook" },
  { id: "event", label: "Event stream" },
  { id: "batch", label: "Batch / file feed" },
  { id: "export", label: "Data export" },
  { id: "handoff", label: "User handoff" },
] as const;
export type FlowKind = (typeof FLOW_KINDS)[number]["id"];

/**
 * Business domains a flow can belong to. Array order = Data Flows chip order.
 *
 * `merchandising` is separate from `catalog` because the boutique lifecycle — ~200 live
 * boutiques, ~50 tiles/day, five day-parts per brand — is the thing SCAYLE least
 * natively supports and the largest scope item in the migration. There is deliberately
 * no `content` domain: RGG is not buying a CMS, and a chip would imply one exists.
 *
 * Each color doubles as its own chip's text color over a 10–15% wash of itself, so every
 * entry has to clear WCAG AA (4.5:1) against that tint — `marketing` is the one that had
 * to move (pink-500 landed at 4.46:1).
 */
export const DOMAINS = [
  { id: "catalog", label: "Catalog & PIM", color: "#f59e0b" },
  { id: "merchandising", label: "Merchandising", color: "#c084fc" },
  { id: "inventory", label: "Inventory", color: "#4ade80" },
  { id: "orders", label: "Orders", color: "#38bdf8" },
  { id: "payments", label: "Payments", color: "#34d399" },
  { id: "fulfillment", label: "Fulfillment", color: "#fb923c" },
  { id: "customers", label: "Customers", color: "#a78bfa" },
  { id: "loyalty", label: "Loyalty & Credit", color: "#f472b6" },
  { id: "marketing", label: "Marketing", color: "#f75fa8" },
  { id: "search", label: "Search", color: "#22d3ee" },
  { id: "reporting", label: "Data & Reporting", color: "#fb7185" },
] as const;
export type Domain = (typeof DOMAINS)[number]["id"];

/**
 * Progress of a legacy → target migration.
 *
 * `unresolved` and `planned` intentionally match `at-risk` and `planned` in
 * `SYSTEM_STATUSES` — the same idea in two vocabularies should not be two shades.
 */
export const MIGRATION_STATUSES = [
  { id: "unresolved", label: "No agreed target", color: "#ff8496" },
  { id: "planned", label: "Planned", color: "#bac6d6" },
  { id: "in-progress", label: "In progress", color: "#38bdf8" },
  { id: "near-complete", label: "Cutover ready", color: "#34d399" },
  { id: "complete", label: "Complete", color: "#10b981" },
] as const;
export type MigrationStatus = (typeof MIGRATION_STATUSES)[number]["id"];

/**
 * Fixed visuals for the non-system node kinds. Datastores and externals don't have a
 * tier — they get one constant look each, used by `nodeVisual()` and the legend.
 *
 * Externals are slate rather than rose: rose belongs to the `custom` tier, and 24
 * third-party nodes in a saturated color would dominate a picture whose subject is
 * first-party systems. The third parties are the given, not the decision.
 */
export const NODE_KIND_VISUALS = {
  datastore: { accent: "#22d3ee", bg: "#12292e", label: "Data Store" },
  external: { accent: "#94a3b8", bg: "#1e242d", label: "External" },
} as const;
