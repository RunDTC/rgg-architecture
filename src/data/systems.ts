import type { SystemDef } from "./types";

// ──────────────────────────────────────────────────────────────────────────────
// SAMPLE DATA — a fictional mid-market retailer, "Acme Outfitters", running on
// Shopify with an iPaaS, OMS, and PIM. Everything here is illustrative; replace it
// with the real client model. See docs/data-model.md and docs/new-client.md.
//
// Node ids are the glue referenced by flows.ts and migrations.ts — keep them stable.
// A system's `tier` also decides its swimlane in the System Landscape view.
// ──────────────────────────────────────────────────────────────────────────────

export const systems: SystemDef[] = [
  // ── Internal Ops ───────────────────────────────────────────────
  {
    kind: "system",
    id: "ipaas",
    name: "Integration Platform (iPaaS)",
    tier: "internal",
    status: "production",
    description:
      "The integration hub. Routes events and syncs data between Shopify, the OMS, PIM, ERP, 3PL, and marketing tools, and owns the retry/queue semantics for cross-system flows.",
    stack: ["iPaaS (low-code flows)", "Webhooks", "Message queue"],
    runtime: "Managed iPaaS (SaaS)",
    notes: [
      "Central point for order, inventory, catalog, and customer syncs",
      "Publishes an internal event bus consumed by the analytics service",
    ],
  },
  {
    kind: "system",
    id: "oms",
    name: "Order Management System (OMS)",
    tier: "internal",
    status: "production",
    description:
      "System of record for orders and fulfillment. Orchestrates payment settlement, routing to the 3PL, and financial posting to the ERP.",
    stack: ["OMS platform", "PostgreSQL"],
    runtime: "Cloud-hosted",
    notes: [
      "Source of truth for order state and aggregated inventory",
      "Replaces the legacy custom OMS — dual-running during cutover",
    ],
  },
  {
    kind: "system",
    id: "pim",
    name: "Product Information Management (PIM)",
    tier: "internal",
    status: "production",
    description:
      "System of record for product content — attributes, categories, media, and enrichment. Publishes the catalog to Shopify and the search index.",
    stack: ["PIM platform", "MySQL"],
    runtime: "Cloud-hosted",
    notes: [
      "Imports supplier catalogs via EDI through the iPaaS",
      "Stores media in object storage, served via the CDN",
    ],
  },
  {
    kind: "system",
    id: "admin-console",
    name: "Admin Console",
    tier: "internal",
    status: "production",
    description:
      "Internal ops tool for customer service and merchandising — order lookups and adjustments plus product edits, backed by the OMS and PIM.",
    stack: ["TypeScript", "React", "Node.js"],
    runtime: "Internal web app",
    notes: ["Surfaces analytics dashboards modeled in the warehouse"],
  },
  {
    kind: "system",
    id: "analytics-service",
    name: "Analytics & ETL Service",
    tier: "internal",
    status: "production",
    description:
      "Batch and streaming ETL that loads the data warehouse from order, catalog, and finance sources and models reporting datasets.",
    stack: ["Python", "dbt", "Airflow"],
    runtime: "Scheduled jobs",
    notes: ["Consumes the iPaaS event bus and warehouse tables"],
  },

  // ── Storefront & Checkout ──────────────────────────────────────
  {
    kind: "system",
    id: "shopify-online-store",
    name: "Shopify Online Store",
    tier: "storefront",
    status: "production",
    description:
      "The customer-facing storefront hosted on Shopify — themes, product pages, cart, and CMS content. Primary sales channel.",
    stack: ["Shopify", "Liquid", "Online Store 2.0"],
    runtime: "Shopify (SaaS)",
    url: "https://www.example-store.com",
    notes: [
      "Product, inventory, and pricing are synced in from the PIM/OMS via the iPaaS",
      "Emits order and customer webhooks consumed by the iPaaS",
    ],
  },
  {
    kind: "system",
    id: "shopify-checkout",
    name: "Shopify Checkout",
    tier: "storefront",
    status: "production",
    description:
      "Shopify's hosted checkout — payment, tax, and shipping selection. Emits the order that kicks off fulfillment.",
    stack: ["Shopify Checkout", "Checkout Extensibility"],
    runtime: "Shopify (SaaS)",
    notes: [
      "Calls the payment gateway and tax service inline",
      "The order-created webhook is step 2 of the order lifecycle",
    ],
  },

  // ── Edge Services ──────────────────────────────────────────────
  {
    kind: "system",
    id: "storefront-bff",
    name: "Storefront BFF",
    tier: "edge",
    status: "production",
    description:
      "Backend-for-frontend that aggregates catalog, search, and content APIs for the headless storefront and caches hot reads at the edge.",
    stack: ["TypeScript", "Node.js", "GraphQL"],
    runtime: "Edge / serverless",
    notes: [
      "Reads product data via the Shopify Storefront API",
      "Fronts the search service and a Redis cache",
    ],
  },
  {
    kind: "system",
    id: "search-service",
    name: "Search Service",
    tier: "edge",
    status: "production",
    description:
      "Product search and autocomplete. Serves queries from a dedicated search index and handles reindexing from the PIM.",
    stack: ["TypeScript", "OpenSearch client"],
    runtime: "Containerized service",
    notes: ["Reindexed when the PIM publishes catalog changes"],
  },

  // ── Legacy ─────────────────────────────────────────────────────
  {
    kind: "system",
    id: "legacy-magento",
    name: "Legacy Magento Storefront",
    tier: "legacy",
    status: "migrating-out",
    description:
      "The previous storefront platform, being replaced by Shopify. Still serves a shrinking share of traffic and residual order flows during cutover.",
    stack: ["Magento 2", "PHP", "MySQL"],
    runtime: "Self-hosted",
    notes: [
      "Product feed kept in sync from the PIM during migration",
      "Decommission planned once Shopify handles 100% of catalog and traffic",
    ],
  },
  {
    kind: "system",
    id: "legacy-oms",
    name: "Legacy Custom OMS",
    tier: "legacy",
    status: "migrating-out",
    description:
      "Home-grown order management system being replaced by the modern OMS. Dual-runs to backfill historical orders and reconcile during cutover.",
    stack: ["PHP", "MySQL", "Cron jobs"],
    runtime: "Self-hosted",
    notes: ["Read-only for new orders once the modern OMS is authoritative"],
  },

  // ── Planned ────────────────────────────────────────────────────
  {
    kind: "system",
    id: "headless-storefront",
    name: "Headless Storefront",
    tier: "planned",
    status: "planned",
    description:
      "Planned React/Hydrogen storefront served through the Storefront BFF — a faster, fully custom front end to eventually replace the Shopify theme.",
    stack: ["Next.js / Hydrogen", "React", "TypeScript"],
    runtime: "Edge (planned)",
    notes: ["Depends on the Storefront BFF and Search Service"],
  },
  {
    kind: "system",
    id: "cdp",
    name: "Customer Data Platform (CDP)",
    tier: "planned",
    status: "planned",
    description:
      "Planned unified customer profile store to consolidate identity and behavioral data for segmentation and personalization.",
    stack: ["CDP platform"],
    runtime: "SaaS (planned)",
    notes: ["Will ingest customer and order events from the iPaaS and feed marketing"],
  },
];
