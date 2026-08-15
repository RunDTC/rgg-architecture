import type { SystemDef } from "./types";

// ──────────────────────────────────────────────────────────────────────────────
// Rue Gilt Group — first-party systems, current state and SCAYLE target state.
//
// Target framing: SCAYLE is the PIM, the ecommerce platform, and the OMS. Merch App is
// RETAINED as the PLM (vendor offer sheets → product + PO skeletons). Store Manager is
// RETIRED into SCAYLE — boutiques become shop categories with product attribution and
// custom data objects, with a panel micro-frontend ("Boutique Studio") supplying the
// workflow, sort, and preview that SCAYLE lacks natively. No third-party CMS.
//
// `tier` = architectural role; `status` = position on the cutover timeline. A node's
// id is the glue referenced by flows.ts, migrations.ts, and sequences.ts — keep ids
// stable. Facts come from meeting notes, the RunDTC/SCAYLE approach docs, the POC scope,
// and the requirements transcripts; where the record conflicts, the note says so.
// ──────────────────────────────────────────────────────────────────────────────

export const systems: SystemDef[] = [
  // ── Legacy Platform — retiring at cutover ──────────────────────
  {
    kind: "system",
    id: "storefront-monolith",
    name: "Storefront Monolith",
    tier: "legacy",
    status: "migrating-out",
    description:
      "The fully custom platform behind ruelala.com and gilt.com, built in-house 15–20 years ago. What RGG calls storefront 'services' are folders inside one monolith, including the `preview` service merchandisers use to see a boutique before it goes live.",
    stack: ["Custom application", "Redis sessions", "Relational database"],
    runtime: "AWS (self-managed)",
    notes: [
      "Serves both brands; >50% of GMV comes from the iOS app, 35% mobile web, 10% desktop",
      "Login wall is a soft JS overlay, not a server-side gate; 30-day remember-me cookie grants partial auth",
      "Both brands cut over big-bang — the shared inventory pool rules out gradual traffic splitting",
    ],
  },
  {
    kind: "system",
    id: "store-manager",
    name: "Store Manager",
    tier: "legacy",
    status: "migrating-out",
    description:
      "A separate application (own front end, back end, and database) bundling four jobs: product enrichment and hierarchy, boutique merchandising and day-part organization, drag-and-drop PLP sort with pinning, and site content. Also where affiliate codes are created.",
    stack: ["Custom application", "Relational database"],
    runtime: "AWS (self-managed)",
    notes: [
      "RGG's framing: 'Merch App is buying merchandise, Store Manager is how you put it on the shelves'",
      "~200 boutiques live at once, roughly half rotating daily; five day-parts per brand, offset an hour between Rue and Gilt",
      "Its retirement is the largest scope item in the migration — see the Boutique Studio node and the mig-store-manager entry",
    ],
  },
  {
    kind: "system",
    id: "legacy-oms",
    name: "Homegrown OMS",
    tier: "legacy",
    status: "migrating-out",
    description:
      "Proprietary order management with no application and no UI — entirely database driven, with business logic nested deep in stored procedures and adapter layers.",
    stack: ["Stored procedures", "Relational database"],
    runtime: "AWS (self-managed)",
    notes: [
      "Channels: Rue, Gilt, Marketplace, and International via ESW",
      "Settlement recently shifted to 30 minutes after order placement rather than at ship",
      "No UI means there is no as-built documentation — behaviour has to be recovered from the database",
    ],
  },
  {
    kind: "system",
    id: "loyalty-engine",
    name: "Loyalty & Membership Engine",
    tier: "legacy",
    status: "at-risk",
    description:
      "100% custom, spend-based loyalty behind the Rue365 and Gilt Unlimited paid memberships ($55/yr), plus the Rue30 shipping program. Three tiers, hardcoded.",
    stack: ["Custom application", "Relational database"],
    runtime: "AWS (self-managed)",
    notes: [
      "Tiers are hardcoded — 'even adding another tier is a large effort'",
      "Early-access benefits are hacked today: members are emailed and products placed in a segment-gated boutique",
      "No SCAYLE equivalent. Target owner undecided: custom service, SCAYLE promotions/customer groups, or a third-party loyalty platform",
    ],
  },
  {
    kind: "system",
    id: "store-credit-ledger",
    name: "Store Credit Ledger",
    tier: "legacy",
    status: "at-risk",
    description:
      "Debit/credit ledger rebuilt in 2025. Credits are dollars, not points, and carry two distinct accounting treatments that must both survive the migration.",
    stack: ["Custom application", "Relational database"],
    runtime: "AWS (self-managed)",
    notes: [
      "Merchandise credit never expires and is carried as a liability on the books",
      "Promotional credit expires (7–45 days) and is treated like a coupon — no value until used",
      "Returns are steered toward credit with incentives such as free return shipping",
      "SCAYLE has no store-credit feature. SCAYLE committed to building it; RGG owes the PRD",
    ],
  },
  {
    kind: "system",
    id: "csr-tool",
    name: "CSR Tool",
    tier: "legacy",
    status: "migrating-out",
    description:
      "In-house agent console for order servicing — payments, credits and debits, order-on-behalf-of, session hijacking, and post-purchase address changes with differing US/EU tax treatment.",
    stack: ["Custom application"],
    runtime: "AWS (self-managed)",
    notes: [
      "Flagged independently by both RGG and RunDTC as a recurring replatform failure mode — solved too late",
      "SCAYLE has back-office capability but not a full agent console; described as 'something, but not robust'",
      "Zendesk handles ticketing/IVR/chatbot separately and stays",
    ],
  },
  {
    kind: "system",
    id: "affiliate-engine",
    name: "Affiliate Engine",
    tier: "legacy",
    status: "at-risk",
    description:
      "Custom in-house affiliate tracking built into Store Manager and the storefront: code-based attribution with manual invoice reconciliation.",
    stack: ["Custom application"],
    runtime: "AWS (self-managed)",
    notes: [
      "No SCAYLE equivalent, and never scoped or priced by any systems integrator",
      "Three open options: retain and re-point at the mediation layer, rebuild, or move to a third-party affiliate network",
    ],
  },
  {
    kind: "system",
    id: "image-pipeline",
    name: "Image Variant Pipeline & URL Resolver",
    tier: "legacy",
    status: "migrating-out",
    description:
      "Pre-generates a fixed set of image variants (door, banner, billboard, header, lookbook, section-gutter) and resolves templated URLs across sharded CDN hosts, because the current site has no dynamic image sizing.",
    stack: ["Custom application", "S3", "CDN sharding"],
    runtime: "AWS (self-managed)",
    notes: [
      "RGG's stated preference is to store original images only and drop pre-generated variants",
      "SCAYLE supports a single image-giving level (colorway) — multi-level imagery needs separate products",
    ],
  },
  {
    kind: "system",
    id: "legacy-db-replication",
    name: "Monolith DB Replication",
    tier: "legacy",
    status: "migrating-out",
    description:
      "How downstream systems get data today: direct replication off the monolith's transactional database into the warehouse and consuming systems.",
    stack: ["Database replication"],
    runtime: "AWS (self-managed)",
    notes: [
      "Confirmed NOT viable post-migration — the target is a central event/webhook entry point on Kafka",
      "Must be severed before cutover, which makes the event backbone a gating dependency rather than a parallel workstream",
    ],
  },

  // ── Experience Layer ───────────────────────────────────────────
  {
    kind: "system",
    id: "rue-web",
    name: "Rue La La Storefront",
    tier: "experience",
    status: "planned",
    description:
      "The ruelala.com web front end on SCAYLE. Modelled separately from Gilt because the two brands run distinct day-part schedules, separate member pools, and their own header/footer and design systems.",
    stack: ["React or Nuxt/Vue (unresolved)", "SCAYLE Storefront API"],
    runtime: "AWS",
    notes: [
      "Framework unresolved: RGG prefers React, SCAYLE's accelerator is Nuxt/Vue and a React boilerplate has no committed date",
      "AWS is non-negotiable as the hosting target",
      "Members-only gate is 'backend native, frontend custom' — the soft-block behaviour has to be rebuilt here",
    ],
  },
  {
    kind: "system",
    id: "gilt-web",
    name: "Gilt Storefront",
    tier: "experience",
    status: "planned",
    description:
      "The gilt.com web front end on SCAYLE. Shares every system below the storefront with Rue La La, including the inventory pool.",
    stack: ["React or Nuxt/Vue (unresolved)", "SCAYLE Storefront API"],
    runtime: "AWS",
    notes: [
      "Day-parts are offset roughly an hour from Rue La La's",
      "Members belong to Rue or Gilt, never both, with distinct customer ids on a single SCAYLE tenant",
    ],
  },
  {
    kind: "system",
    id: "ios-app",
    name: "iOS App",
    tier: "experience",
    status: "migrating-in",
    description:
      "RGG's native iOS app, built and owned by an in-house team. Re-pointed at SCAYLE rather than rebuilt.",
    stack: ["Swift", "SCAYLE Storefront API"],
    runtime: "iOS",
    notes: [
      "Carries over 50% of GMV — the highest-risk client in the migration",
      "App Store policy requires unauthenticated browsing, so iOS cannot hard-gate the way web does",
      "A SCAYLE Swift SDK has been requested but is not a confirmed capability; the SDK ships web-only today",
      "Preference is to consume the Storefront API directly rather than wrap a web view",
    ],
  },
  {
    kind: "system",
    id: "android-app",
    name: "Android App",
    tier: "experience",
    status: "migrating-in",
    description:
      "RGG's native Android app, re-pointed at SCAYLE through the same mediation layer as iOS.",
    stack: ["Kotlin", "SCAYLE Storefront API"],
    runtime: "Android",
  },
  {
    kind: "system",
    id: "client-mediation",
    name: "Client Mediation Layer (BFF / ACL)",
    tier: "experience",
    status: "planned",
    description:
      "One shared backend-for-frontend and anti-corruption layer between every client — Rue web, Gilt web, iOS, Android — and the SCAYLE Storefront API. Owns client-specific shaping, experiment assignment, segment resolution, and the members-only gate.",
    stack: ["Node/TypeScript", "SCAYLE Storefront API"],
    runtime: "AWS",
    notes: [
      "RunDTC explicitly recommends one shared layer over per-client logic distributed across four clients",
      "SCAYLE requires a BFF for business logic regardless — this shifts hosting, security, and maintenance to RGG",
      "Resolves Eppo's name-based segment references onto SCAYLE customer segments",
      "Distinct from the integration/ETL concern: this mediates reads for clients, Kafka moves data between systems",
    ],
  },

  // ── SCAYLE Commerce Core ───────────────────────────────────────
  {
    kind: "system",
    id: "scayle-pim",
    name: "SCAYLE PIM",
    tier: "commerce",
    status: "planned",
    description:
      "System of record for product content in the target state. Models Master (style) → Product (colorway) → Variant (buyable SKU), with attribute groups, attribute mapping, and master categories.",
    stack: ["SCAYLE PIM", "Admin API"],
    runtime: "SCAYLE (SaaS on AWS)",
    notes: [
      "Scale: ~250,000 active SKUs with ~1.1M rotated annually; under 20% is evergreen",
      "Sits between a traditional PIM (Akeneo, inRiver) and a basic product primitive — no native workflow, readiness rules, or syndication channels",
      "RGG's productinfo_* workflow dates (sample received, photo, imaging, feature, check-off, AI enrichment) must survive as queryable attributes — SCAYLE is now the PIM and merchandisers filter worklists on them",
      "Data blockers: the source has no master/style key linking colorways, and color drives the SKU where SCAYLE needs it promoted to product level",
    ],
  },
  {
    kind: "system",
    id: "scayle-panel",
    name: "SCAYLE Panel",
    tier: "commerce",
    status: "planned",
    description:
      "The SCAYLE back-office UI where merchandisers work: product enrichment, bulk update, CSV import/export, category management, and price campaigns. Host for the Boutique Studio micro-frontend.",
    stack: ["SCAYLE Panel", "Vue 3"],
    runtime: "SCAYLE (SaaS on AWS)",
    notes: [
      "Roughly 200 merchandisers move here from Store Manager — the change-management surface of the whole programme",
      "Role-based permissions are solid out of the box; audit trail exists but retention caps at 14 days on products, 90 on add-ons, 365 on customers",
      "Navigation trees are panel-only — there is no Admin API endpoint for them",
    ],
  },
  {
    kind: "system",
    id: "scayle-admin-api",
    name: "SCAYLE Admin API",
    tier: "commerce",
    status: "planned",
    description:
      "The machine write path into SCAYLE. Every integration service and the Boutique Studio add-on writes here; merchandisers write through the panel instead.",
    stack: ["REST", "OAuth client credentials"],
    runtime: "SCAYLE (SaaS on AWS)",
    notes: [
      "Rate limits observed at ~1,000 reads and 300 writes per minute on products and shop categories",
      "The storefront product index rebuilds roughly hourly — Admin API writes are invisible to shoppers until then, with no way to trigger a rebuild on demand",
      "Attribute values are shared globally across attribute groups, and attribute groups cannot be renamed once attributes are assigned",
    ],
  },
  {
    kind: "system",
    id: "scayle-storefront-api",
    name: "SCAYLE Storefront API",
    tier: "commerce",
    status: "planned",
    description:
      "The read API every client consumes through the mediation layer: catalog, boutiques (shop categories), prices, promotions, and custom data objects.",
    stack: ["REST", "GraphQL"],
    runtime: "SCAYLE (SaaS on AWS)",
    notes: [
      "No parameter exists to request a future date's catalog, boutique, pricing, and campaign state — which collides with RGG's need to preview each day-part before it launches",
      "Serves the boutique custom-data contract that the storefront reads instead of binding to a specific SCAYLE entity",
    ],
  },
  {
    kind: "system",
    id: "scayle-checkout",
    name: "SCAYLE Checkout",
    tier: "commerce",
    status: "planned",
    description:
      "Native SCAYLE checkout: cart, tax, payment, fraud injection, and the members-only gate enforced server-side at the point of transaction.",
    stack: ["SCAYLE Checkout"],
    runtime: "SCAYLE (SaaS on AWS)",
    notes: [
      "Fraud can be injected into the checkout flow — the capability that ruled Shopify out",
      "RGG's 30-minute remorse period with immediate settlement has no native equivalent and races SCAYLE's decrement-on-order inventory model",
      "Store credit as tender does not exist yet; gift cards must convert to credit pre-checkout",
      "Sellable-window rules are enforced here, not only in the UI — out-of-window products cannot transact",
    ],
  },
  {
    kind: "system",
    id: "scayle-promotions",
    name: "SCAYLE Promotions & Campaigns",
    tier: "commerce",
    status: "planned",
    description:
      "Price campaigns, promotions, customer segments, and product sets. Carries boutique day-part scheduling and the segment-gated assortment behaviour.",
    stack: ["SCAYLE Promotions", "Customer segments"],
    runtime: "SCAYLE (SaaS on AWS)",
    notes: [
      "Sellable timeframes schedule per shop and country, so Rue US and Gilt US can run different windows on the same product",
      "Target home for the Experiences voucher-code tooling that lives in Merch App today",
      "No price books — prices are set at product level, an operational change from RGG's current model",
    ],
  },
  {
    kind: "system",
    id: "scayle-oms",
    name: "SCAYLE OMS",
    tier: "commerce",
    status: "planned",
    description:
      "Order management for all four channels — Rue, Gilt, Marketplace, and International via ESW — replacing the homegrown OMS.",
    stack: ["SCAYLE OMS"],
    runtime: "SCAYLE (SaaS on AWS)",
    notes: [
      "SCAYLE confirmed it can ingest and manage offline orders (dropship and marketplace)",
      "Keeps a local inventory view and decrements on order placement to prevent oversell; it is not the inventory system of record",
      "Order notification is a webhook carrying an order id — consumers pull the full order",
      "Refunds appear to be manual with no native connectivity back to Braintree; the integration layer has to drive them",
    ],
  },
  {
    kind: "system",
    id: "scayle-search",
    name: "SCAYLE Search",
    tier: "commerce",
    status: "planned",
    description:
      "Native search and category navigation, positioned to launch alongside Algolia so the two can be A/B tested against each other.",
    stack: ["SCAYLE Search V2"],
    runtime: "SCAYLE (SaaS on AWS)",
    notes: [
      "Search V2 suggestions cannot return product entities on partial or fuzzy matches — product suggestions need an exact match on id, reference key, EAN, or an exact-search attribute",
      "Practical design is category-first suggestions merged with a parallel product text search behind one client call",
      "Launch bias is SCAYLE Search; Algolia's six-figure licence is the commercial argument against keeping it",
    ],
  },
  {
    kind: "system",
    id: "scayle-seller-center",
    name: "SCAYLE Seller Center",
    tier: "commerce",
    status: "planned",
    description:
      "SCAYLE's vendor onboarding and marketplace listing capability — inbound vendor self-service, the opposite direction from a PO system.",
    stack: ["SCAYLE Seller Center"],
    runtime: "SCAYLE (SaaS on AWS)",
    notes: [
      "Scope unresolved: RGG is drawn to it for vendor onboarding across ~7,500 vendors, but all 375 active dropshippers stay on VendorNet/Radial",
      "Explicitly not recommended as a PO upload path — 'harder to customize, not built for that purpose'",
      "Broader Seller Center / marketplace transformation sits in Phase 2",
    ],
  },

  // ── Integration & Events ───────────────────────────────────────
  {
    kind: "system",
    id: "stream-processing",
    name: "Stream Processing (Flink)",
    tier: "integration",
    status: "planned",
    description:
      "Stream transforms over the Confluent event backbone: inventory netting, segment computation, and the fan-out that replaces direct database replication.",
    stack: ["Apache Flink", "Confluent Cloud"],
    runtime: "AWS",
    notes: [
      "Kafka + Flink is the preferred data-movement approach; an iPaaS was explicitly not recommended given the existing Confluent investment",
      "Cost analysis including Confluent has not been completed for this approach",
    ],
  },
  {
    kind: "system",
    id: "product-sync",
    name: "Product & Taxonomy Sync",
    tier: "integration",
    status: "planned",
    description:
      "Moves product and PO skeletons, master hierarchies, brand data, and size masters from Merch App into SCAYLE PIM, and relays SCAYLE product webhooks back to the PLM and downstream systems.",
    stack: ["Node/TypeScript", "SCAYLE Admin API"],
    runtime: "AWS",
    notes: [
      "Owns the two hard transforms: deriving a master/style key the source does not have, and promoting color from a variant axis to product level",
      "Also the seam where Lily AI enrichment and the productinfo_* workflow dates land",
    ],
  },
  {
    kind: "system",
    id: "inventory-sync",
    name: "Inventory Sync Service",
    tier: "integration",
    status: "planned",
    description:
      "Nets warehouse and dropship stock against in-flight orders and pushes availability into SCAYLE. The single highest oversell-risk component in the target architecture.",
    stack: ["Node/TypeScript", "Confluent Cloud", "SCAYLE Admin API"],
    runtime: "AWS",
    notes: [
      "CONFLICTING RECORD: SCAYLE's Nov-2025 technical deep-dive describes the inventory API as delta-based ('to set 10, send +10'); the storefront documentation reviewed in July describes it as set-only. Must be resolved in discovery — the difference is an oversell risk",
      "RGG pushes replacement values rather than deltas, adjusted for in-flight orders",
      "Drop ship is the highest oversell exposure across 375 active vendors",
      "Inventory is shared across Rue and Gilt, which is why cutover has to be big-bang",
    ],
  },
  {
    kind: "system",
    id: "order-integration",
    name: "Order & Fulfillment Integration",
    tier: "integration",
    status: "planned",
    description:
      "Routes released orders to the DC, dropship vendors, and international, and returns fulfillment, tracking, refund, and financial-posting events. Owns the dropship consolidation hold.",
    stack: ["Node/TypeScript", "Confluent Cloud"],
    runtime: "AWS",
    notes: [
      "Holds dropship orders ~24 hours for vendor consolidation — a business rule that cannot be dropped lightly",
      "Drives Braintree refunds, because SCAYLE's refund path appears to be manual",
      "PeopleSoft/Oracle is the major financial integration anchor: order, refund, credit, settlement, and tax posting",
    ],
  },

  // ── RGG Custom — retained or purpose-built ─────────────────────
  {
    kind: "system",
    id: "merch-app",
    name: "Merch App (PLM)",
    tier: "custom",
    status: "migrating-in",
    description:
      "RGG's purchasing and product-lifecycle application, RETAINED. A vendor offer-to-buy sheet upload generates product skeletons and the PO skeleton together, and it holds master hierarchies, brand data, size masters, and the Experiences voucher tooling.",
    stack: ["Custom application", "Relational database"],
    runtime: "AWS (self-managed)",
    notes: [
      "Products and POs are tightly coupled — you cannot create a product without a PO, or a PO without its products",
      "SCAYLE is not a PO system and has no concept of PO states (placed, approved, released) or import validation",
      "Both SCAYLE and RunDTC recommended buying a purpose-built third-party PO product instead of retaining this; RGG's direction is to retain it as the PLM",
      "Master hierarchies, brand data, and size attributes migrate INTO SCAYLE PIM; PO placement stays here",
      "Experiences voucher codes are a candidate to move to the SCAYLE promotion engine",
    ],
  },
  {
    kind: "system",
    id: "boutique-studio",
    name: "Boutique Studio (SCAYLE panel add-on)",
    tier: "custom",
    status: "planned",
    description:
      "A Vue 3 micro-frontend registered inside the SCAYLE panel, supplying the boutique capabilities SCAYLE lacks: approval workflow, drag-and-drop merchandising sort and pinning, a boutique overview and search, and live preview. It stores nothing of its own — it writes directly to the Admin API and custom data objects.",
    stack: ["Vue 3", "SCAYLE custom add-on", "SCAYLE Admin API"],
    runtime: "SCAYLE panel (micro-frontend)",
    notes: [
      "Shares the panel's session and permissions and reuses SCAYLE's component library, so SCAYLE stays the single source of truth",
      "The principal custom component of the Store Manager replacement — boutique-level workflow is not native",
      "Draft/review/approved/live states exist on Products and Prices but NOT on shop categories; this add-on has to hold them in custom data",
      "Preview is the hardest requirement: no Storefront API parameter returns a future date's catalog, boutique, pricing, and campaign state",
    ],
  },
  {
    kind: "system",
    id: "csr-console",
    name: "CSR Console",
    tier: "custom",
    status: "planned",
    description:
      "Agent tooling rebuilt against the SCAYLE Admin API: order servicing, order-on-behalf-of, session hijacking, and credit/debit adjustment.",
    stack: ["SCAYLE custom add-on or standalone app", "SCAYLE Admin API"],
    runtime: "AWS / SCAYLE panel",
    notes: [
      "SCAYLE's CSR portal covers viewing customers, placing orders on behalf, and taking payment — but not RGG's full servicing surface",
      "Requires a dedicated deep dive; flagged by both sides as the capability most often left too late in a replatform",
    ],
  },
  {
    kind: "system",
    id: "membership-service",
    name: "Membership & Loyalty Service",
    tier: "custom",
    status: "planned",
    description:
      "Target home for paid membership (Rue365, Gilt Unlimited), the Rue30 shipping program, spend-based tiers, and the two store-credit instruments — pending the build/buy decision.",
    stack: ["Node/TypeScript", "SCAYLE Admin API"],
    runtime: "AWS",
    notes: [
      "Build/buy unresolved: custom service, SCAYLE promotions and customer groups, or a third-party loyalty platform",
      "Store credit must be applied as tender inside SCAYLE checkout, which does not support it yet",
      "Merchandise credit is a balance-sheet liability and must reconcile to PeopleSoft",
    ],
  },
  {
    kind: "system",
    id: "personalization",
    name: "Personalization & Boutique Sort",
    tier: "custom",
    status: "at-risk",
    description:
      "RGG's in-house model ranking Boutique Main per member, blended with the first two to four doors pinned manually by merchandisers.",
    stack: ["In-house models", "Snowflake / Databricks"],
    runtime: "AWS",
    notes: [
      "A default sort always exists as a fallback if the model or API is unavailable",
      "Ownership unresolved across four candidates: SCAYLE Smart Sorting, custom sort keys pushed to SCAYLE, storefront-side logic, or RGG's own models",
      "Custom sort keys handle segment-level sorting more readily than true 1:1 personalization, which is what the current model does",
    ],
  },
  {
    kind: "system",
    id: "zzz-phase2-test-delete-me",
    name: "ZZZ Phase 2 Test (delete me)",
    tier: "custom",
    status: "planned",
    description: "Temporary entry created to verify the chat-to-GitHub save pipeline. Safe to delete.",
    stack: [
      "n/a",
    ],
    runtime: "n/a",
  }
];
