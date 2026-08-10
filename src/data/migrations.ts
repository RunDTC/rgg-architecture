import type { MigrationDef } from "./types";

// Legacy → target replacement pairs. `from`/`to` are node ids and may fan in or out.
//
// Four entries carry `status: "unresolved"` — capabilities with no agreed target owner.
// Those are the decisions that need making, not the work that needs scheduling, and the
// Migration Map surfaces them in red for exactly that reason.

export const migrations: MigrationDef[] = [
  {
    id: "mig-storefront",
    title: "Storefront: monolith → SCAYLE + custom front ends",
    from: ["storefront-monolith"],
    to: ["rue-web", "gilt-web", "ios-app", "client-mediation", "scayle-storefront-api"],
    status: "planned",
    summary:
      "Both brands replatform in a single big-bang cutover — the shared inventory pool rules out gradual traffic splitting, since neither site could be trusted to know what the other had already sold. A shared client mediation layer (BFF / anti-corruption layer) sits between every client and the SCAYLE Storefront API rather than distributing that logic across four clients. Two open items: React versus SCAYLE's default Nuxt/Vue, and whether a Swift SDK materialises for the app that carries over half of GMV.",
    deadline: "Summer 2027 (end of Q2)",
  },
  {
    id: "mig-store-manager",
    title: "Store Manager → SCAYLE + Boutique Studio",
    from: ["store-manager", "store-manager-db"],
    to: ["scayle-panel", "boutique-studio", "scayle-catalog-store", "scayle-promotions"],
    status: "planned",
    summary:
      "Boutiques become SCAYLE shop categories with product attribution and custom data objects; day-part scheduling becomes native sellable timeframes per shop and country. A Vue 3 panel micro-frontend supplies what SCAYLE lacks — approval workflow, merchandising sort and pinning, boutique list view, and preview — and stores nothing of its own. Known gaps: draft/review/approved/live states exist on Products and Prices but not on shop categories, audit retention caps at 14 days on products, and no Storefront API parameter previews a future date's state. PHASING IS NOT SETTLED: the priced estimate carries ~140h of Store Manager integration assuming continued use, and SCAYLE's Phase 1 briefing assumes boutique creation stays upstream until Phase 2.",
    deadline: "Summer 2027",
  },
  {
    id: "mig-pim",
    title: "PIM: Store Manager + Merch App → SCAYLE PIM",
    from: ["store-manager", "merch-app"],
    to: ["scayle-pim", "product-sync"],
    status: "planned",
    summary:
      "SCAYLE becomes the system of record for product content. Merch App is RETAINED in its PLM role — vendor offer sheets, product and PO skeletons, PO states — and syncs into SCAYLE; master hierarchies, brand data, and size masters move across. Two data blockers need RGG sign-off: the source has no master/style key linking colorways, and color drives the SKU where SCAYLE needs it promoted to product level. The productinfo_* workflow dates must survive as queryable attributes, because merchandisers filter worklists on them and SCAYLE is now the PIM.",
    deadline: "Q1 2027 (data model frozen)",
  },
  {
    id: "mig-oms",
    title: "Order management: homegrown OMS → SCAYLE OMS",
    from: ["legacy-oms"],
    to: ["scayle-oms", "order-integration"],
    status: "planned",
    summary:
      "Replaces an OMS with no application and no UI, whose business logic sits in stored procedures and adapter layers inside the database — which also means there is no as-built documentation to migrate from. All four channels move: Rue, Gilt, Marketplace, and International via ESW. Dropship consolidation holds orders roughly 24 hours before vendor release and cannot be dropped. Open: whether Manhattan plays any OMS role was asked in discovery and never answered.",
    deadline: "Summer 2027",
  },
  {
    id: "mig-data-backbone",
    title: "Direct DB replication → Confluent event backbone",
    from: ["legacy-db-replication", "monolith-db"],
    to: ["kafka", "stream-processing", "data-platform"],
    status: "in-progress",
    summary:
      "Downstream systems read the monolith database directly today, which is confirmed not viable once that database stops being the system of record. Kafka becomes the single central entry point with Flink for stream processing. No iPaaS: explicitly not recommended given the existing Confluent investment. This was flagged as the highest-priority risk in the whole programme — there is no agreed solution yet for getting data out of the monolith, transforming it, and managing the round trip with SCAYLE, and cost analysis including Confluent has not been done.",
    deadline: "Q4 2026 (must precede cutover)",
  },
  {
    id: "mig-checkout",
    title: "Checkout & payments → SCAYLE Checkout",
    from: ["storefront-monolith"],
    to: ["scayle-checkout", "scayle-promotions"],
    status: "planned",
    summary:
      "Native SCAYLE checkout with the existing Braintree vault reused, so stored payment methods carry over without customer re-entry. Two gaps drive the risk here: RGG's 30-minute remorse period with immediate capture has no native equivalent and races SCAYLE's decrement-on-order inventory model, and refunds are documented as manual with no native connectivity back to Braintree. Pre-orders shipping weeks out also need delayed capture and reauthorization, which is unvalidated.",
    deadline: "Summer 2027",
  },
  {
    id: "mig-store-credit",
    title: "Store credit ledger → SCAYLE (PRD owed)",
    from: ["store-credit-ledger"],
    to: ["scayle-checkout", "membership-service"],
    status: "unresolved",
    summary:
      "Store credit does not exist in SCAYLE. SCAYLE has committed to building it and RGG owes the PRD, so there is nothing to prove out in a POC yet. Two instruments must both survive: merchandise credit, which never expires and is carried as a liability on the books, and promotional credit, which expires in 7–45 days and behaves like a coupon with no value until used. Returns are actively steered toward credit with incentives, so this is a revenue mechanism, not just an accounting one.",
  },
  {
    id: "mig-loyalty",
    title: "Rue365 / Gilt Unlimited → membership service",
    from: ["loyalty-engine"],
    to: ["membership-service", "scayle-promotions"],
    status: "unresolved",
    summary:
      "A $55/yr paid membership with three hardcoded tiers, plus the Rue30 shipping program. Adding even a fourth tier is a large effort today, and early access is delivered by emailing members and placing products in a segment-gated boutique. Leadership has said it should not remain bespoke. Build/buy is undecided across three options: a custom service, SCAYLE promotions with customer groups, or a third-party loyalty platform.",
  },
  {
    id: "mig-affiliate",
    title: "Affiliate engine → no agreed target",
    from: ["affiliate-engine"],
    to: ["client-mediation"],
    status: "unresolved",
    summary:
      "Custom in-house code-based attribution with manual invoice reconciliation, built into Store Manager and the storefront. There is no SCAYLE equivalent, and it has never been scoped or priced by any systems integrator — which makes it the single least-understood item in the migration. Three options: retain and re-point at the mediation layer, rebuild, or move to a third-party affiliate network.",
  },
  {
    id: "mig-personalization",
    title: "Boutique sort & segmentation → unresolved ownership",
    from: ["storefront-monolith", "monolith-db"],
    to: ["personalization", "scayle-promotions", "scayle-admin-api"],
    status: "unresolved",
    summary:
      "Segments live in the main relational database today, populated by manual uploads from the warehouse; the target path is warehouse → Kafka → SCAYLE segments, with Tealium as the longer-term real-time source. Sort ownership is the harder question, undecided across four candidates: SCAYLE Smart Sorting, custom sort keys pushed into SCAYLE, storefront-side logic, or RGG's own models. Custom sort keys handle segment-level sorting readily but not the true 1:1 personalization the current model delivers.",
  },
  {
    id: "mig-csr",
    title: "CSR tool → CSR Console + SCAYLE Panel",
    from: ["csr-tool"],
    to: ["csr-console", "scayle-panel", "zendesk"],
    status: "planned",
    summary:
      "Order servicing, credits and debits, order-on-behalf-of, session hijacking, and post-purchase address changes with differing US and EU tax treatment all have to be reproduced against the SCAYLE Admin API. SCAYLE has back-office capability but not a full agent console. Both RGG and RunDTC independently flagged CSR tooling as the capability most often solved too late in a replatform.",
    deadline: "Summer 2027",
  },
  {
    id: "mig-images",
    title: "Image variant pipeline → originals on S3 + Akamai",
    from: ["image-pipeline"],
    to: ["s3-media", "edge-cdn", "scayle-pim"],
    status: "planned",
    summary:
      "Retires pre-generation of fixed variants — door, banner, billboard, header, lookbook, section-gutter — along with CDN host sharding, in favour of storing originals and sizing dynamically. Product images stay in S3 and are referenced by SCAYLE rather than uploaded; a Canto DAM transformation is explicitly out of Phase 1. Constraint: SCAYLE supports a single image-giving level, so multi-image variation needs separate products.",
    deadline: "Summer 2027",
  },
];
