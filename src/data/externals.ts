import type { ExternalDef } from "./types";

// Third-party services. Grouped in the Landscape by role via explicit lanes in
// src/config/landscape.ts — keep the ids there in sync when adding or removing here.
//
// AWS is deliberately absent: it's the substrate every first-party system runs on and
// belongs in `runtime` strings, not as a node.

export const externals: ExternalDef[] = [
  // ── Commerce Partners ──────────────────────────────────────────
  {
    kind: "external",
    id: "braintree",
    name: "Braintree",
    category: "Payments",
    description:
      "Payment gateway and card vault, retained. RGG already owns the vault, so stored payment methods carry over without customer re-entry — a connection proof rather than a data migration.",
  },
  {
    kind: "external",
    id: "wallets-bnpl",
    name: "Wallets & BNPL",
    category: "Payments",
    description:
      "Apple Pay, Google Pay, PayPal buy-now-pay-later, and Afterpay (via Block/Adyen rather than Braintree). Afterpay is the heaviest of these to integrate because it touches payment data directly.",
  },
  {
    kind: "external",
    id: "gift-cards",
    name: "Gift Cards",
    category: "Payments",
    description:
      "Externally hosted gift card platform on its own subdomain. Gift cards must convert to store credit before checkout, since SCAYLE has no credit tender.",
  },
  {
    kind: "external",
    id: "riskified",
    name: "Riskified",
    category: "Fraud",
    description:
      "Fraud screening, retained for Phase 1. No pre-built SCAYLE connector exists. Review is asynchronous, so orders must be held pending a decision — and the record disagrees on whether RGG stays post-order or moves to a pre-auth model.",
  },
  {
    kind: "external",
    id: "avalara",
    name: "Avalara",
    category: "Tax",
    description:
      "Tax calculation, with a pre-built SCAYLE integration. Requires smart SKU tax mapping — RGG's tax classification is tied to its SKU numbering hierarchy.",
  },
  {
    kind: "external",
    id: "esw",
    name: "ESW",
    category: "Cross-border",
    description:
      "Merchant of record, duty, and tax for international. Retained in Phase 1 via SCAYLE's pre-built connector; a Phase 2 replacement candidate. 180 markets, but ~90% of international revenue is Canada, UK, Mexico, and Australia, and the full catalog is not sold internationally.",
  },
  {
    kind: "external",
    id: "narvar",
    name: "Narvar",
    category: "Returns & tracking",
    description:
      "Returns and delivery tracking. A new, heavily customised Narvar implementation launched during the evaluation, so replatforming will require rework — including the Seel claim-blocking logic.",
  },
  {
    kind: "external",
    id: "seel",
    name: "Seel",
    category: "Delivery protection",
    description:
      "Opt-in worry-free delivery protection priced as a percentage of order value. Needs a custom checkout slot and a dynamic fee whose order-level, taxable, and refundable treatment is still open.",
  },

  // ── Supply & Finance ───────────────────────────────────────────
  {
    kind: "external",
    id: "vendor-feeds",
    name: "Vendor Offer Sheets",
    category: "Supplier input",
    description:
      "Offer-to-buy sheets from roughly 7,500 vendors, uploaded into Merch App to generate product and PO skeletons. The source of the 110-step manual process and most downstream data-quality problems.",
  },
  {
    kind: "external",
    id: "manhattan-wms",
    name: "Manhattan",
    category: "Warehouse management",
    description:
      "Warehouse management for RGG's single distribution centre. NOTE: whether Manhattan is the WMS or also plays an OMS role was asked in discovery and never answered — it bears directly on the SCAYLE-as-OMS target. SCAYLE has an existing Manhattan integration built for another client.",
  },
  {
    kind: "external",
    id: "dropship-platform",
    name: "VendorNet / Radial",
    category: "Dropship",
    description:
      "Dropship order routing across 375 active vendors, retained by formal decision — migrating the vendor base would be prohibitive, and VendorNet confirmed it can integrate with whatever platform RGG moves to.",
  },
  {
    kind: "external",
    id: "marketplace-feeds",
    name: "Rithum / ChannelAdvisor",
    category: "Marketplace",
    description:
      "Outbound marketplace and social-selling feeds. SCAYLE has no committed Rithum connector, so the integration is a custom build; Zalando's Trade Bite is a Phase 2 alternative.",
  },
  {
    kind: "external",
    id: "peoplesoft-erp",
    name: "PeopleSoft / Oracle",
    category: "ERP & finance",
    description:
      "Finance system of record and the major integration anchor: order, refund, credit, settlement, tax, and financial posting flows all terminate here.",
  },
  {
    kind: "external",
    id: "canto",
    name: "Canto",
    category: "DAM",
    description:
      "Digital asset management for boutique doors and marketing assets. Product images are NOT in the DAM — they sit in S3. A DAM transformation is explicitly out of Phase 1.",
  },

  // ── Data, Growth & Platform ────────────────────────────────────
  {
    kind: "external",
    id: "algolia",
    name: "Algolia",
    category: "Search",
    description:
      "Search and algorithmic PLP sort, under evaluation today. Launch bias is SCAYLE Search with Algolia kept for A/B comparison; its six-figure licence is the commercial argument for retiring it.",
  },
  {
    kind: "external",
    id: "eppo",
    name: "Eppo",
    category: "Experimentation",
    description:
      "Experimentation system of record. Holds segment definitions only, with no persistence layer, and ties A/B audience definitions to segment NAMES — so the mediation layer has to resolve those names onto SCAYLE segments.",
  },
  {
    kind: "external",
    id: "tealium",
    name: "Tealium",
    category: "CDP & tag management",
    description:
      "Tag management today, and the intended longer-term real-time source for customer segments feeding the SCAYLE segmentation API. No pre-built SCAYLE connector, though the integration is front-end and therefore lightweight.",
  },
  {
    kind: "external",
    id: "iterable",
    name: "Iterable",
    category: "Email & SMS",
    description:
      "All marketing and transactional messaging, adopted less than a year ago and mandated to stay. Also used to place some content on the site today — a habit the SCAYLE model has to absorb.",
  },
  {
    kind: "external",
    id: "hightouch",
    name: "Hightouch",
    category: "Reverse ETL",
    description:
      "Brokers warehouse data into Iterable: catalog sync, behavioural events, and list management. Arguably redundant once Kafka and Flink are in place — a candidate for later consolidation.",
  },
  {
    kind: "external",
    id: "lily-ai",
    name: "Lily AI",
    category: "Product enrichment",
    description:
      "AI product attribute enrichment, integrated via product webhooks and an enrichment review workflow. A Phase 1 keep-or-replace decision is outstanding against SCAYLE's own AI roadmap.",
  },
  {
    kind: "external",
    id: "zendesk",
    name: "Zendesk",
    category: "Customer service",
    description:
      "Ticketing, IVR, and chatbot. Retained, though the contract expires within one to two years. RGG wants an authenticated chatbot experience, which does not exist today.",
  },
  {
    kind: "external",
    id: "okta",
    name: "Okta",
    category: "Identity",
    description:
      "Employee identity and SCIM provisioning for the SCAYLE panel and custom add-ons. Establishing role-based access and private API connectivity is the stated gate before any other execution work.",
  },
  {
    kind: "external",
    id: "tableau",
    name: "Tableau",
    category: "BI",
    description:
      "Executive and merchandising reporting over the data platform — used all the way up to the company president, and today the workaround for cross-boutique product visibility.",
  },
  {
    kind: "external",
    id: "edge-cdn",
    name: "Akamai CDN & Cloudflare WAF",
    category: "Edge",
    description:
      "Content delivery and web application firewall, both included in the SCAYLE contract rather than procured separately. Serves boutique assets and product imagery.",
  },
];
