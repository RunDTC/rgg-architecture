import type { MigrationDef } from "./types";

// Legacy → modern replacement efforts. `from`/`to` are arrays of node ids (a migration
// can fan in or out). Sample data — replace per client.

export const migrations: MigrationDef[] = [
  {
    id: "mig-storefront",
    title: "Storefront replatform: Magento → Shopify",
    from: ["legacy-magento"],
    to: ["shopify-online-store", "shopify-checkout"],
    status: "in-progress",
    summary:
      "Replatforming the customer-facing storefront and checkout from self-hosted Magento to Shopify, shifting traffic in stages.",
    deadline: "Q4 2026",
  },
  {
    id: "mig-oms",
    title: "Order management: custom OMS → modern OMS",
    from: ["legacy-oms"],
    to: ["oms"],
    status: "near-complete",
    summary:
      "Cutting over order management from the home-grown legacy system to the modern OMS, dual-running to reconcile before decommission.",
    deadline: "Q3 2026",
  },
  {
    id: "mig-integrations",
    title: "Point-to-point integrations → iPaaS",
    from: ["legacy-magento", "legacy-oms"],
    to: ["ipaas"],
    status: "in-progress",
    summary:
      "Consolidating brittle point-to-point integrations onto the iPaaS as the single integration hub with retries and observability.",
    deadline: "Q1 2027",
  },
  {
    id: "mig-pim",
    title: "Catalog management: spreadsheets → PIM",
    from: ["legacy-magento"],
    to: ["pim"],
    status: "complete",
    summary:
      "Moved product content management out of Magento admin and shared spreadsheets into a dedicated PIM as the catalog source of truth.",
  },
  {
    id: "mig-cdp",
    title: "Unified customer data → CDP",
    from: ["shopify-online-store", "email-marketing"],
    to: ["cdp"],
    status: "planned",
    summary:
      "Consolidating fragmented customer data from the storefront and marketing tools into a Customer Data Platform for segmentation and personalization.",
    deadline: "2027",
  },
];
