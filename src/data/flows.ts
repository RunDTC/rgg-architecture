import type { FlowDef } from "./types";

// ──────────────────────────────────────────────────────────────────────────────
// Directed edges between node ids.
//
// Two conventions carry most of the meaning here:
//
//  1. `planned: true` (dashed) marks every edge that only exists in the target state —
//     anything touching a SCAYLE node, an integration service, the mediation layer,
//     Boutique Studio, the CSR console, or the membership service. The current
//     architecture therefore renders solid and the target dashed, so the Landscape reads
//     as a before/after in one frame.
//
//  2. The numbered `step` trace belongs to `merchandising`, not `orders` — the boutique
//     lifecycle is what SCAYLE least natively supports and the largest scope item in the
//     migration. Multi-domain stepped flows set `stepDomain` so their numbers don't leak
//     into the Catalog chip.
//
// The legacy side is modelled selectively: only the edges that carry migration meaning,
// not the monolith's internals. The Migration Map does the before/after pairing.
//
// Every `source`/`target` must be a real node id — there is no runtime validation, so a
// typo silently drops the edge.
// ──────────────────────────────────────────────────────────────────────────────

export const flows: FlowDef[] = [
  // ════════════════════════════════════════════════════════════════
  // Merchandising — the boutique lifecycle (numbered trace, steps 1–9)
  // ════════════════════════════════════════════════════════════════
  {
    id: "vendor-feeds-to-merch-app",
    source: "vendor-feeds",
    target: "merch-app",
    kind: "batch",
    domains: ["merchandising", "catalog"],
    stepDomain: "merchandising",
    label: "Offer-to-buy sheets",
    description:
      "Roughly 7,500 vendors submit offer sheets; Merch App derives product skeletons and the PO skeleton together. This is the start of the product lifecycle and the origin of the 110-step manual process RGG wants to retire.",
    step: 1,
  },
  {
    id: "merch-app-to-product-sync",
    source: "merch-app",
    target: "product-sync",
    kind: "api-call",
    domains: ["merchandising", "catalog"],
    stepDomain: "merchandising",
    label: "Skeletons + hierarchies",
    description:
      "Product and PO skeletons, master hierarchies, brand data, and size masters leave the PLM. PO placement and PO states stay behind in Merch App — SCAYLE has no concept for them.",
    planned: true,
    step: 2,
  },
  {
    id: "product-sync-to-scayle-pim",
    source: "product-sync",
    target: "scayle-pim",
    kind: "api-call",
    domains: ["merchandising", "catalog"],
    stepDomain: "merchandising",
    label: "Master → product → variant",
    description:
      "Maps RGG's style/SKU model onto SCAYLE's Master (style) → Product (colorway) → Variant (SKU). Two open blockers: the source has no master/style key linking colorways, and color drives the SKU where SCAYLE needs it promoted to product level.",
    planned: true,
    step: 3,
  },
  {
    id: "lily-ai-to-scayle-pim",
    source: "lily-ai",
    target: "scayle-pim",
    kind: "api-call",
    domains: ["merchandising", "catalog"],
    stepDomain: "merchandising",
    label: "AI attribute enrichment",
    description:
      "Attribute enrichment via product webhooks and a review workflow. Keep-or-replace against SCAYLE's own AI roadmap is a Phase 1 decision.",
    planned: true,
    step: 4,
  },
  {
    id: "canto-to-s3-media",
    source: "canto",
    target: "s3-media",
    kind: "sync",
    domains: ["merchandising", "catalog"],
    stepDomain: "merchandising",
    label: "Boutique doors & assets",
    description:
      "Boutique doors and marketing assets come from the DAM; product images stay in S3 and were never moved into Canto. A DAM transformation is explicitly out of Phase 1.",
    step: 4,
  },
  {
    id: "scayle-panel-to-scayle-pim",
    source: "scayle-panel",
    target: "scayle-pim",
    kind: "write",
    domains: ["merchandising", "catalog"],
    stepDomain: "merchandising",
    label: "Merchandiser enrichment",
    description:
      "Around 200 merchandisers enrich products in the panel rather than Store Manager. The productinfo_* workflow dates — sample received, photo, imaging, feature, check-off, AI enrichment — must survive as queryable SCAYLE attributes so worklists still function.",
    planned: true,
    step: 5,
  },
  {
    id: "boutique-studio-to-scayle-admin-api",
    source: "boutique-studio",
    target: "scayle-admin-api",
    kind: "api-call",
    domains: ["merchandising"],
    label: "Assemble boutique",
    description:
      "Creates the shop category, attributes products into it, and writes the custom data objects that carry boutique content — headline, door asset, layout treatment, ranking boost, segmentation. Draft/review/approved/live states are NOT native to shop categories, so the add-on holds them in custom data.",
    planned: true,
    step: 6,
  },
  {
    id: "personalization-to-scayle-admin-api",
    source: "personalization",
    target: "scayle-admin-api",
    kind: "write",
    domains: ["merchandising", "customers"],
    stepDomain: "merchandising",
    label: "Sort keys + manual pins",
    description:
      "RGG's in-house model pushes boutique sort keys; merchandisers pin the first two to four doors by hand. Ownership is unresolved between SCAYLE Smart Sorting, custom sort keys, storefront logic, and RGG's own models.",
    planned: true,
    step: 7,
  },
  {
    id: "boutique-studio-to-scayle-promotions",
    source: "boutique-studio",
    target: "scayle-promotions",
    kind: "api-call",
    domains: ["merchandising"],
    label: "Schedule day-part",
    description:
      "Five day-parts per brand, offset roughly an hour between Rue and Gilt. Sellable timeframes schedule per shop and country and are enforced at checkout, not only in the UI — which removes operational risk and also removes today's informal flexibility.",
    planned: true,
    step: 8,
  },
  {
    id: "scayle-storefront-api-to-rue-web-boutique",
    source: "scayle-storefront-api",
    target: "client-mediation",
    kind: "read",
    domains: ["merchandising"],
    label: "Boutique goes live",
    description:
      "At the day-part boundary the boutique becomes visible through the Storefront API. Cache behaviour at drop boundaries is a first-class engineering concern given flash-sale traffic patterns.",
    planned: true,
    step: 9,
  },

  // ── Merchandising — supporting (unnumbered) ────────────────────
  {
    id: "boutique-studio-to-scayle-panel",
    source: "boutique-studio",
    target: "scayle-panel",
    kind: "handoff",
    domains: ["merchandising"],
    label: "Panel micro-frontend",
    description:
      "Registered as a custom add-on inside the panel, sharing its session, permissions, and component library. It stores nothing of its own, so SCAYLE remains the single source of truth.",
    planned: true,
  },
  {
    id: "boutique-studio-to-scayle-storefront-api",
    source: "boutique-studio",
    target: "scayle-storefront-api",
    kind: "read",
    domains: ["merchandising"],
    label: "Preview (gap)",
    description:
      "GAP: no Storefront API parameter returns a future date's catalog, boutique, pricing, and campaign state. RGG needs to preview each day-part before it launches, so this requires custom work that has not been proven.",
    planned: true,
  },
  {
    id: "personalization-to-data-platform",
    source: "personalization",
    target: "data-platform",
    kind: "read",
    domains: ["merchandising", "reporting"],
    label: "Model features",
    description:
      "Boutique sort models train on member behaviour in the warehouse. A default sort always exists as a fallback when the model or its API is unavailable.",
  },
  {
    id: "store-manager-to-store-manager-db",
    source: "store-manager",
    target: "store-manager-db",
    kind: "read-write",
    domains: ["merchandising", "catalog"],
    label: "Boutiques & sort order",
  },
  {
    id: "store-manager-to-storefront-monolith",
    source: "store-manager",
    target: "storefront-monolith",
    kind: "sync",
    domains: ["merchandising"],
    label: "Publish boutique",
    description:
      "Today's publish path: boutiques, day-part schedules, PLP sort, pinning, and site content are pushed from Store Manager to the monolith by convention-based, largely automated tooling.",
  },
  {
    id: "store-manager-to-monolith-db",
    source: "store-manager",
    target: "monolith-db",
    kind: "write",
    domains: ["merchandising", "catalog"],
    label: "Product & boutique data",
  },

  // ════════════════════════════════════════════════════════════════
  // Catalog & PIM
  // ════════════════════════════════════════════════════════════════
  {
    id: "merch-app-to-merch-app-db",
    source: "merch-app",
    target: "merch-app-db",
    kind: "read-write",
    domains: ["catalog"],
    label: "POs & taxonomy",
    description:
      "Products and POs are tightly coupled — neither can be created without the other. That coupling is why Merch App stays as the PLM rather than folding into SCAYLE.",
  },
  {
    id: "merch-app-to-peoplesoft-erp",
    source: "merch-app",
    target: "peoplesoft-erp",
    kind: "batch",
    domains: ["catalog", "reporting"],
    label: "Purchase orders",
    description:
      "PO states (placed, approved, released) publish to finance. SCAYLE has no concept for PO states or import validation, which is what keeps this flow outside the commerce platform.",
  },
  {
    id: "scayle-pim-to-scayle-catalog-store",
    source: "scayle-pim",
    target: "scayle-catalog-store",
    kind: "read-write",
    domains: ["catalog"],
    label: "Product master",
    planned: true,
  },
  {
    id: "scayle-admin-api-to-scayle-catalog-store",
    source: "scayle-admin-api",
    target: "scayle-catalog-store",
    kind: "write",
    domains: ["catalog", "merchandising"],
    label: "Catalog writes",
    description:
      "Rate limited to roughly 1,000 reads and 300 writes per minute on products and shop categories.",
    planned: true,
  },
  {
    id: "scayle-catalog-store-to-scayle-storefront-api",
    source: "scayle-catalog-store",
    target: "scayle-storefront-api",
    kind: "read",
    domains: ["catalog", "merchandising"],
    label: "Indexed catalog",
    description:
      "The storefront product index rebuilds roughly hourly. Admin API changes are invisible to shoppers until the next rebuild, and no on-demand trigger was found — a real constraint for same-day merchandising corrections.",
    planned: true,
  },
  {
    id: "scayle-pim-to-product-sync",
    source: "scayle-pim",
    target: "product-sync",
    kind: "webhook",
    domains: ["catalog"],
    label: "Product updated",
    description:
      "SCAYLE broadcasts product create/update events. This is the egress half of the jobs framework and how surrounding systems learn about catalog change.",
    planned: true,
  },
  {
    id: "product-sync-to-merch-app",
    source: "product-sync",
    target: "merch-app",
    kind: "api-call",
    domains: ["catalog"],
    label: "PIM id write-back",
    description:
      "SCAYLE product, master, and variant ids return to the PLM so POs and vendor communication reference the same identifiers the storefront uses.",
    planned: true,
  },
  {
    id: "product-sync-to-kafka",
    source: "product-sync",
    target: "kafka",
    kind: "event",
    domains: ["catalog", "reporting"],
    label: "Product change events",
    planned: true,
  },
  {
    id: "scayle-panel-to-s3-media",
    source: "scayle-panel",
    target: "s3-media",
    kind: "read",
    domains: ["catalog"],
    label: "Reference images",
    description:
      "Product imagery is referenced from RGG's existing S3 estate rather than uploaded into SCAYLE. Constraint: SCAYLE supports a single image-giving level, so multi-image variation needs separate products.",
    planned: true,
  },
  {
    id: "s3-media-to-edge-cdn",
    source: "s3-media",
    target: "edge-cdn",
    kind: "read",
    domains: ["catalog", "merchandising"],
    label: "Asset delivery",
  },
  {
    id: "image-pipeline-to-s3-media",
    source: "image-pipeline",
    target: "s3-media",
    kind: "write",
    domains: ["catalog"],
    label: "Pre-generated variants",
    description:
      "Fixed variants exist because the current site has no dynamic image sizing. RGG's stated preference is to keep originals only.",
  },
  {
    id: "storefront-monolith-to-image-pipeline",
    source: "storefront-monolith",
    target: "image-pipeline",
    kind: "read",
    domains: ["catalog"],
    label: "Resolve image URLs",
  },
  {
    id: "scayle-pim-to-marketplace-feeds",
    source: "scayle-pim",
    target: "marketplace-feeds",
    kind: "export",
    domains: ["catalog", "marketing"],
    label: "Marketplace catalog",
    description:
      "Outbound listings to Rithum/ChannelAdvisor. SCAYLE has no committed connector, so this is a custom build.",
    planned: true,
  },
  {
    id: "scayle-pim-to-scayle-seller-center",
    source: "scayle-pim",
    target: "scayle-seller-center",
    kind: "sync",
    domains: ["catalog"],
    label: "Vendor listing model",
    description:
      "Seller Center generates its data model from PIM master categories. Scope unresolved — dropship vendors stay on VendorNet regardless.",
    planned: true,
  },
  {
    id: "scayle-pim-to-scayle-search",
    source: "scayle-pim",
    target: "scayle-search",
    kind: "sync",
    domains: ["catalog", "search"],
    label: "Index catalog",
    planned: true,
  },
  {
    id: "scayle-pim-to-algolia",
    source: "scayle-pim",
    target: "algolia",
    kind: "sync",
    domains: ["catalog", "search"],
    label: "Index catalog (A/B)",
    planned: true,
  },

  // ════════════════════════════════════════════════════════════════
  // Inventory
  // ════════════════════════════════════════════════════════════════
  {
    id: "manhattan-wms-to-kafka",
    source: "manhattan-wms",
    target: "kafka",
    kind: "event",
    domains: ["inventory", "fulfillment"],
    label: "DC stock movement",
    description:
      "Single distribution centre. NOTE: whether Manhattan also plays an OMS role was asked in discovery and never answered — it bears on the SCAYLE-as-OMS target.",
  },
  {
    id: "dropship-platform-to-kafka",
    source: "dropship-platform",
    target: "kafka",
    kind: "event",
    domains: ["inventory", "fulfillment"],
    label: "Vendor stock feeds",
    description:
      "375 active dropship vendors. Dropship carries the highest oversell exposure because vendor stock is neither owned nor observed in real time.",
  },
  {
    id: "kafka-to-stream-processing",
    source: "kafka",
    target: "stream-processing",
    kind: "event",
    domains: ["inventory", "reporting"],
    label: "Consume stock topics",
    planned: true,
  },
  {
    id: "stream-processing-to-inventory-sync",
    source: "stream-processing",
    target: "inventory-sync",
    kind: "event",
    domains: ["inventory"],
    label: "Netted availability",
    planned: true,
  },
  {
    id: "scayle-oms-to-inventory-sync",
    source: "scayle-oms",
    target: "inventory-sync",
    kind: "api-call",
    domains: ["inventory", "orders"],
    label: "In-flight reservations",
    description:
      "RGG adjusts availability for orders already in flight rather than sending pure deltas — the mechanism that keeps replacement values correct.",
    planned: true,
  },
  {
    id: "inventory-sync-to-scayle-admin-api",
    source: "inventory-sync",
    target: "scayle-admin-api",
    kind: "api-call",
    domains: ["inventory"],
    label: "Push availability",
    description:
      "CONFLICTING RECORD: SCAYLE's technical deep-dive describes this API as delta-based ('to set 10, send +10'); the storefront documentation describes it as set-only. Must be resolved in discovery — the difference is an oversell risk at 250,000 active SKUs.",
    planned: true,
  },
  {
    id: "scayle-admin-api-to-scayle-order-store",
    source: "scayle-admin-api",
    target: "scayle-order-store",
    kind: "write",
    domains: ["inventory", "customers"],
    label: "Inventory & segments",
    planned: true,
  },
  {
    id: "inventory-sync-to-kafka",
    source: "inventory-sync",
    target: "kafka",
    kind: "event",
    domains: ["inventory", "reporting"],
    label: "Reconciliation exceptions",
    description:
      "SCAYLE keeps a local inventory view and decrements on order placement, but it is not the system of record — divergence has to be detected and reported.",
    planned: true,
  },
  {
    id: "storefront-monolith-to-monolith-db-inventory",
    source: "storefront-monolith",
    target: "monolith-db",
    kind: "read-write",
    domains: ["inventory", "orders"],
    label: "Inventory & orders",
    description:
      "Inventory updates today are periodic rather than real-time, with no availability check at cart or checkout.",
  },

  // ════════════════════════════════════════════════════════════════
  // Orders
  // ════════════════════════════════════════════════════════════════
  {
    id: "rue-web-to-client-mediation",
    source: "rue-web",
    target: "client-mediation",
    kind: "api-call",
    domains: ["orders", "customers"],
    label: "Storefront reads",
    planned: true,
  },
  {
    id: "gilt-web-to-client-mediation",
    source: "gilt-web",
    target: "client-mediation",
    kind: "api-call",
    domains: ["orders", "customers"],
    label: "Storefront reads",
    planned: true,
  },
  {
    id: "ios-app-to-client-mediation",
    source: "ios-app",
    target: "client-mediation",
    kind: "api-call",
    domains: ["orders", "customers"],
    label: "App reads",
    description:
      "Over 50% of GMV. Preference is to consume the API directly rather than wrap a web view, which would make every site release a regression risk for the app.",
    planned: true,
  },
  {
    id: "android-app-to-client-mediation",
    source: "android-app",
    target: "client-mediation",
    kind: "api-call",
    domains: ["orders", "customers"],
    label: "App reads",
    planned: true,
  },
  {
    id: "client-mediation-to-scayle-storefront-api",
    source: "client-mediation",
    target: "scayle-storefront-api",
    kind: "api-call",
    domains: ["orders", "catalog", "customers"],
    label: "Catalog & cart",
    planned: true,
  },
  {
    id: "client-mediation-to-scayle-checkout",
    source: "client-mediation",
    target: "scayle-checkout",
    kind: "api-call",
    domains: ["orders", "payments"],
    label: "Place order",
    planned: true,
  },
  {
    id: "scayle-checkout-to-riskified",
    source: "scayle-checkout",
    target: "riskified",
    kind: "api-call",
    domains: ["orders", "payments"],
    label: "Fraud screen",
    description:
      "No pre-built SCAYLE connector. Review is asynchronous, so the order has to be held pending a decision. The record disagrees on whether RGG stays post-order or moves to pre-auth.",
    planned: true,
  },
  {
    id: "scayle-checkout-to-avalara",
    source: "scayle-checkout",
    target: "avalara",
    kind: "api-call",
    domains: ["orders", "payments"],
    label: "Calculate tax",
    description:
      "Requires smart SKU tax mapping — RGG's tax classification is tied to its SKU numbering hierarchy.",
    planned: true,
  },
  {
    id: "scayle-checkout-to-esw",
    source: "scayle-checkout",
    target: "esw",
    kind: "api-call",
    domains: ["orders", "payments"],
    label: "International MoR",
    description:
      "Duty, tax, and merchant of record for international orders via SCAYLE's pre-built connector. ESW built a custom promo-engine workaround for duty-free promotions that has to be preserved.",
    planned: true,
  },
  {
    id: "scayle-checkout-to-scayle-oms",
    source: "scayle-checkout",
    target: "scayle-oms",
    kind: "api-call",
    domains: ["orders"],
    label: "Create order",
    planned: true,
  },
  {
    id: "scayle-oms-to-scayle-order-store",
    source: "scayle-oms",
    target: "scayle-order-store",
    kind: "read-write",
    domains: ["orders"],
    label: "Order records",
    planned: true,
  },
  {
    id: "scayle-oms-to-order-integration",
    source: "scayle-oms",
    target: "order-integration",
    kind: "webhook",
    domains: ["orders", "fulfillment"],
    label: "Order released",
    description:
      "SCAYLE emits a webhook carrying an order id; the consumer pulls the full order. Channels are Rue, Gilt, Marketplace, and International.",
    planned: true,
  },
  {
    id: "order-integration-to-kafka",
    source: "order-integration",
    target: "kafka",
    kind: "event",
    domains: ["orders", "reporting"],
    label: "Order events",
    planned: true,
  },
  {
    id: "order-integration-to-peoplesoft-erp",
    source: "order-integration",
    target: "peoplesoft-erp",
    kind: "batch",
    domains: ["orders", "payments", "reporting"],
    label: "Financial posting",
    description:
      "The major integration anchor: order, refund, credit, settlement, and tax posting all terminate in finance.",
    planned: true,
  },
  {
    id: "csr-console-to-scayle-admin-api",
    source: "csr-console",
    target: "scayle-admin-api",
    kind: "api-call",
    domains: ["orders", "customers"],
    label: "Order servicing",
    description:
      "Order-on-behalf-of, session hijacking, post-purchase address change with differing US/EU tax treatment, and credit/debit adjustment.",
    planned: true,
  },
  {
    id: "storefront-monolith-to-legacy-oms",
    source: "storefront-monolith",
    target: "legacy-oms",
    kind: "write",
    domains: ["orders"],
    label: "Submit order",
  },
  {
    id: "legacy-oms-to-monolith-db",
    source: "legacy-oms",
    target: "monolith-db",
    kind: "read-write",
    domains: ["orders", "fulfillment"],
    label: "Stored procedures",
    description:
      "The OMS has no application layer — its business logic lives in stored procedures and adapter layers inside the database.",
  },
  {
    id: "csr-tool-to-legacy-oms",
    source: "csr-tool",
    target: "legacy-oms",
    kind: "read-write",
    domains: ["orders", "customers"],
    label: "Agent servicing",
  },

  // ════════════════════════════════════════════════════════════════
  // Payments
  // ════════════════════════════════════════════════════════════════
  {
    id: "scayle-checkout-to-braintree",
    source: "scayle-checkout",
    target: "braintree",
    kind: "api-call",
    domains: ["payments"],
    label: "Authorize & capture",
    description:
      "RGG's existing Braintree vault is reused, so stored payment methods carry over without re-entry. Capture is immediate today, with settlement 30 minutes after placement; pre-orders that ship weeks out need delayed capture and reauthorization, which is unvalidated.",
    planned: true,
  },
  {
    id: "scayle-checkout-to-wallets-bnpl",
    source: "scayle-checkout",
    target: "wallets-bnpl",
    kind: "api-call",
    domains: ["payments"],
    label: "Wallets & BNPL",
    description:
      "Apple Pay, Google Pay, and PayPal BNPL. Afterpay runs through Block/Adyen rather than Braintree and is the heaviest integration of the group.",
    planned: true,
  },
  {
    id: "scayle-checkout-to-gift-cards",
    source: "scayle-checkout",
    target: "gift-cards",
    kind: "api-call",
    domains: ["payments", "loyalty"],
    label: "Redeem gift card",
    description:
      "Gift cards must convert to store credit before checkout, because SCAYLE has no credit tender.",
    planned: true,
  },
  {
    id: "scayle-checkout-to-seel",
    source: "scayle-checkout",
    target: "seel",
    kind: "api-call",
    domains: ["payments", "fulfillment"],
    label: "Delivery protection",
    description:
      "Opt-in fee priced as a percentage of order value, requiring a custom checkout slot. Whether the fee is order-level, taxable, and refundable is still open.",
    planned: true,
  },
  {
    id: "scayle-promotions-to-scayle-checkout",
    source: "scayle-promotions",
    target: "scayle-checkout",
    kind: "read",
    domains: ["payments", "merchandising"],
    label: "Price & promotions",
    planned: true,
  },
  {
    id: "braintree-to-order-integration",
    source: "braintree",
    target: "order-integration",
    kind: "webhook",
    domains: ["payments"],
    label: "Settlement",
    planned: true,
  },
  {
    id: "order-integration-to-braintree",
    source: "order-integration",
    target: "braintree",
    kind: "api-call",
    domains: ["payments"],
    label: "Refund (gap)",
    description:
      "GAP: SCAYLE's documented refund process is manual, with no native connectivity back to Braintree. The integration layer has to drive refunds, which makes this a custom build rather than a connector.",
    planned: true,
  },
  {
    id: "storefront-monolith-to-braintree",
    source: "storefront-monolith",
    target: "braintree",
    kind: "api-call",
    domains: ["payments"],
    label: "Capture (30-min remorse)",
    description:
      "Today: immediate capture with a 30-minute remorse period during which the customer can cancel. Not native to SCAYLE, and it races SCAYLE's decrement-on-order inventory model.",
  },

  // ════════════════════════════════════════════════════════════════
  // Fulfillment
  // ════════════════════════════════════════════════════════════════
  {
    id: "order-integration-to-manhattan-wms",
    source: "order-integration",
    target: "manhattan-wms",
    kind: "api-call",
    domains: ["fulfillment"],
    label: "DC fulfillment",
    planned: true,
  },
  {
    id: "order-integration-to-dropship-platform",
    source: "order-integration",
    target: "dropship-platform",
    kind: "api-call",
    domains: ["fulfillment"],
    label: "Vendor release (24h hold)",
    description:
      "Dropship orders are held roughly 24 hours for consolidation before release to vendors. A long-standing business rule that cannot be dropped lightly.",
    planned: true,
  },
  {
    id: "manhattan-wms-to-order-integration",
    source: "manhattan-wms",
    target: "order-integration",
    kind: "webhook",
    domains: ["fulfillment"],
    label: "Shipment confirmed",
    planned: true,
  },
  {
    id: "dropship-platform-to-order-integration",
    source: "dropship-platform",
    target: "order-integration",
    kind: "webhook",
    domains: ["fulfillment"],
    label: "Vendor shipment",
    planned: true,
  },
  {
    id: "order-integration-to-scayle-oms",
    source: "order-integration",
    target: "scayle-oms",
    kind: "api-call",
    domains: ["fulfillment", "orders"],
    label: "Fulfillment status",
    planned: true,
  },
  {
    id: "order-integration-to-narvar",
    source: "order-integration",
    target: "narvar",
    kind: "api-call",
    domains: ["fulfillment"],
    label: "Tracking handoff",
    planned: true,
  },
  {
    id: "narvar-to-order-integration",
    source: "narvar",
    target: "order-integration",
    kind: "webhook",
    domains: ["fulfillment", "payments"],
    label: "RMA created",
    description:
      "A new, heavily customised Narvar implementation launched during the evaluation, so replatforming will require rework. Flagged as complex.",
    planned: true,
  },
  {
    id: "seel-to-narvar",
    source: "seel",
    target: "narvar",
    kind: "api-call",
    domains: ["fulfillment"],
    label: "Claim blocking",
    description:
      "Seel claim status suppresses returns already covered by delivery protection — the most customised part of the Narvar integration.",
  },

  // ════════════════════════════════════════════════════════════════
  // Customers
  // ════════════════════════════════════════════════════════════════
  {
    id: "client-mediation-to-scayle-promotions",
    source: "client-mediation",
    target: "scayle-promotions",
    kind: "read",
    domains: ["customers", "merchandising"],
    label: "Resolve segments",
    description:
      "Segment-gated boutique visibility resolves from the authenticated customer's groups. The mediation layer maps Eppo's name-based audience references onto SCAYLE segments.",
    planned: true,
  },
  {
    id: "okta-to-scayle-panel",
    source: "okta",
    target: "scayle-panel",
    kind: "api-call",
    domains: ["customers"],
    label: "Employee SSO / SCIM",
    description:
      "Role-based access for employees plus private API connectivity is the stated gate before any other execution work begins.",
    planned: true,
  },
  {
    id: "okta-to-boutique-studio",
    source: "okta",
    target: "boutique-studio",
    kind: "api-call",
    domains: ["customers", "merchandising"],
    label: "Add-on permissions",
    description:
      "The add-on inherits the panel session and permission model rather than maintaining its own.",
    planned: true,
  },
  {
    id: "tealium-to-scayle-admin-api",
    source: "tealium",
    target: "scayle-admin-api",
    kind: "api-call",
    domains: ["customers", "marketing"],
    label: "Real-time segments",
    description:
      "The longer-term segmentation path: Tealium feeds the SCAYLE segmentation API directly, eliminating the local-database dependency. No pre-built connector exists.",
    planned: true,
  },
  {
    id: "stream-processing-to-scayle-admin-api",
    source: "stream-processing",
    target: "scayle-admin-api",
    kind: "api-call",
    domains: ["customers", "marketing"],
    label: "Segment upserts",
    description:
      "The near-term path: segments computed in the warehouse flow through Kafka into SCAYLE, replacing today's manual uploads into the transactional database.",
    planned: true,
  },
  {
    id: "zendesk-to-csr-console",
    source: "zendesk",
    target: "csr-console",
    kind: "handoff",
    domains: ["customers"],
    label: "Ticket context",
    description:
      "Zendesk keeps ticketing, IVR, and chatbot. RGG wants an authenticated chatbot experience, which does not exist today.",
    planned: true,
  },
  {
    id: "storefront-monolith-to-redis-sessions",
    source: "storefront-monolith",
    target: "redis-sessions",
    kind: "read-write",
    domains: ["customers"],
    label: "Server-side sessions",
    description:
      "Sessions are per-device with no cross-device persistence. A 30-day remember-me cookie grants partial authentication for browsing; account pages and checkout force a full re-login.",
  },
  {
    id: "storefront-monolith-to-monolith-db-segments",
    source: "storefront-monolith",
    target: "monolith-db",
    kind: "read",
    domains: ["customers", "marketing"],
    label: "Read segments",
    description:
      "Segments live in the main relational database today, populated by manual uploads from the data warehouse. Eliminating this dependency is an explicit goal.",
  },
  {
    id: "data-platform-to-monolith-db",
    source: "data-platform",
    target: "monolith-db",
    kind: "batch",
    domains: ["customers", "marketing"],
    label: "Manual segment upload",
  },

  // ════════════════════════════════════════════════════════════════
  // Loyalty & Credit
  // ════════════════════════════════════════════════════════════════
  {
    id: "loyalty-engine-to-monolith-db",
    source: "loyalty-engine",
    target: "monolith-db",
    kind: "read-write",
    domains: ["loyalty"],
    label: "Tiers & membership",
    description:
      "Three hardcoded spend-based tiers behind the Rue365 and Gilt Unlimited paid memberships, plus the Rue30 shipping program.",
  },
  {
    id: "store-credit-ledger-to-monolith-db",
    source: "store-credit-ledger",
    target: "monolith-db",
    kind: "read-write",
    domains: ["loyalty", "payments"],
    label: "Credit ledger",
    description:
      "Debit/credit ledger in dollars, not points. Merchandise credit never expires and is a balance-sheet liability; promotional credit expires in 7–45 days and behaves like a coupon.",
  },
  {
    id: "store-credit-ledger-to-peoplesoft-erp",
    source: "store-credit-ledger",
    target: "peoplesoft-erp",
    kind: "batch",
    domains: ["loyalty", "reporting"],
    label: "Liability posting",
  },
  {
    id: "membership-service-to-scayle-checkout",
    source: "membership-service",
    target: "scayle-checkout",
    kind: "api-call",
    domains: ["loyalty", "payments"],
    label: "Credit as tender (gap)",
    description:
      "GAP: store credit does not exist in SCAYLE. SCAYLE has committed to building it and RGG owes the PRD. Both instruments must survive — non-expiring merchandise credit and expiring promotional credit.",
    planned: true,
  },
  {
    id: "membership-service-to-scayle-promotions",
    source: "membership-service",
    target: "scayle-promotions",
    kind: "api-call",
    domains: ["loyalty", "merchandising"],
    label: "Tier benefits & early access",
    description:
      "Free shipping, early access, and anniversary credits express as customer groups and segment-gated boutiques rather than the email-and-gate workaround used today.",
    planned: true,
  },
  {
    id: "membership-service-to-braintree",
    source: "membership-service",
    target: "braintree",
    kind: "api-call",
    domains: ["loyalty", "payments"],
    label: "Membership billing",
    description: "$55/yr paid membership renewal for Rue365 and Gilt Unlimited.",
    planned: true,
  },
  {
    id: "membership-service-to-kafka",
    source: "membership-service",
    target: "kafka",
    kind: "event",
    domains: ["loyalty", "reporting"],
    label: "Credit & tier events",
    planned: true,
  },

  // ════════════════════════════════════════════════════════════════
  // Marketing
  // ════════════════════════════════════════════════════════════════
  {
    id: "order-integration-to-iterable",
    source: "order-integration",
    target: "iterable",
    kind: "api-call",
    domains: ["marketing", "orders"],
    label: "Transactional email",
    description:
      "Iterable carries all marketing and transactional messaging and is mandated to stay. Returns messaging moves to Narvar.",
    planned: true,
  },
  {
    id: "data-platform-to-hightouch",
    source: "data-platform",
    target: "hightouch",
    kind: "export",
    domains: ["marketing"],
    label: "Audience sync",
  },
  {
    id: "hightouch-to-iterable",
    source: "hightouch",
    target: "iterable",
    kind: "sync",
    domains: ["marketing"],
    label: "Catalog & lists",
    description:
      "Hightouch brokers catalog sync, behavioural events, and list management into Iterable. Arguably redundant once Kafka and Flink are established.",
  },
  {
    id: "client-mediation-to-eppo",
    source: "client-mediation",
    target: "eppo",
    kind: "api-call",
    domains: ["marketing", "customers"],
    label: "Experiment assignment",
    description:
      "Eppo holds segment definitions only, with no persistence layer, and references audiences by segment NAME — so name resolution onto SCAYLE segments has to happen here.",
    planned: true,
  },
  {
    id: "rue-web-to-tealium",
    source: "rue-web",
    target: "tealium",
    kind: "api-call",
    domains: ["marketing"],
    label: "Tag & event capture",
    description:
      "Component-level tracking for product view, category browse, add-to-cart, remove-from-cart, and search. RGG owns the tagging plan.",
    planned: true,
  },
  {
    id: "gilt-web-to-tealium",
    source: "gilt-web",
    target: "tealium",
    kind: "api-call",
    domains: ["marketing"],
    label: "Tag & event capture",
    planned: true,
  },
  {
    id: "scayle-promotions-to-iterable",
    source: "scayle-promotions",
    target: "iterable",
    kind: "api-call",
    domains: ["marketing", "loyalty"],
    label: "Voucher codes",
    description:
      "The Experiences tooling in Merch App attaches codes to styles and boutiques; the marketing system that emails them stays in place and receives codes from the promotion engine.",
    planned: true,
  },
  {
    id: "affiliate-engine-to-storefront-monolith",
    source: "affiliate-engine",
    target: "storefront-monolith",
    kind: "read-write",
    domains: ["marketing"],
    label: "Code-based tracking",
    description:
      "Custom in-house attribution with no SCAYLE equivalent — and never scoped or priced by any systems integrator.",
  },
  {
    id: "affiliate-engine-to-peoplesoft-erp",
    source: "affiliate-engine",
    target: "peoplesoft-erp",
    kind: "batch",
    domains: ["marketing", "reporting"],
    label: "Manual reconciliation",
  },
  {
    id: "store-manager-to-affiliate-engine",
    source: "store-manager",
    target: "affiliate-engine",
    kind: "write",
    domains: ["marketing", "merchandising"],
    label: "Create affiliate codes",
  },

  // ════════════════════════════════════════════════════════════════
  // Search
  // ════════════════════════════════════════════════════════════════
  {
    id: "client-mediation-to-scayle-search",
    source: "client-mediation",
    target: "scayle-search",
    kind: "api-call",
    domains: ["search"],
    label: "Suggestions & PLP",
    description:
      "Search V2 suggestions are category-first — product suggestions require an exact match, so the mediation layer merges a parallel product text search behind one client call.",
    planned: true,
  },
  {
    id: "client-mediation-to-algolia",
    source: "client-mediation",
    target: "algolia",
    kind: "api-call",
    domains: ["search"],
    label: "Search (A/B arm)",
    description:
      "Kept at launch so SCAYLE Search can be measured against it. Algolia's six-figure licence is the commercial argument for retiring it afterwards.",
    planned: true,
  },
  {
    id: "storefront-monolith-to-algolia",
    source: "storefront-monolith",
    target: "algolia",
    kind: "api-call",
    domains: ["search"],
    label: "Algorithmic PLP sort",
  },

  // ════════════════════════════════════════════════════════════════
  // Data & Reporting
  // ════════════════════════════════════════════════════════════════
  {
    id: "legacy-db-replication-to-monolith-db",
    source: "legacy-db-replication",
    target: "monolith-db",
    kind: "read",
    domains: ["reporting"],
    label: "Direct replication",
    description:
      "How downstream systems get data today. Confirmed NOT viable post-migration — severing it is a gating dependency for cutover, not a parallel workstream.",
  },
  {
    id: "legacy-db-replication-to-data-platform",
    source: "legacy-db-replication",
    target: "data-platform",
    kind: "export",
    domains: ["reporting"],
    label: "Replicate to warehouse",
  },
  {
    id: "stream-processing-to-kafka",
    source: "stream-processing",
    target: "kafka",
    kind: "event",
    domains: ["reporting"],
    label: "Transformed topics",
    planned: true,
  },
  {
    id: "kafka-to-data-platform",
    source: "kafka",
    target: "data-platform",
    kind: "event",
    domains: ["reporting"],
    label: "Central data entry point",
    description:
      "The target replacement for direct DB replication: one event/webhook-based entry point every downstream team consumes. Cost analysis including Confluent has not been completed.",
    planned: true,
  },
  {
    id: "data-platform-to-tableau",
    source: "data-platform",
    target: "tableau",
    kind: "read",
    domains: ["reporting"],
    label: "Reporting & dashboards",
    description:
      "Also today's workaround for cross-boutique product visibility — merchandisers reconcile a Tableau extract against spreadsheets before flash events.",
  },
  {
    id: "peoplesoft-erp-to-data-platform",
    source: "peoplesoft-erp",
    target: "data-platform",
    kind: "batch",
    domains: ["reporting"],
    label: "Financial actuals",
  },
  {
    id: "scayle-oms-to-kafka",
    source: "scayle-oms",
    target: "kafka",
    kind: "event",
    domains: ["reporting", "orders"],
    label: "Order & inventory events",
    planned: true,
  },
];
