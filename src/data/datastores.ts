import type { DataStoreDef } from "./types";

// Databases, buses, and object storage. `contents` drives the filter chips in the Data
// Stores view — list the notable collections, topics, or buckets, and use it to surface
// facts that belong on a fact sheet (e.g. that customer segments currently live in the
// monolith's transactional database).
//
// `phase` is only set on stores that exist on one side of the cutover. Omitted means
// "both", which covers Confluent, the data platform, S3, and the Merch App database —
// all retained. It can't be derived from flows: every flow modelled against Confluent is
// `planned`, but Confluent itself is already in production as RGG's Data Mesh.

export const datastores: DataStoreDef[] = [
  {
    kind: "datastore",
    id: "kafka",
    name: "Event Backbone",
    technology: "Confluent Cloud (Kafka)",
    description:
      "RGG's existing 'Data Mesh'. In the target state it becomes the central entry point for every downstream consumer, replacing direct replication off the monolith database.",
    contents: [
      "Stock movement topics (DC + dropship)",
      "Order and fulfillment events",
      "Product change events",
      "Segment membership updates",
      "Inventory reconciliation exceptions",
    ],
  },
  {
    kind: "datastore",
    id: "data-platform",
    name: "Data Platform",
    technology: "Snowflake + Databricks",
    description:
      "The analytics estate. Already well established — the BI team is the most mature data function at RGG and reports into the CTO organisation.",
    contents: [
      "Order and revenue marts",
      "Member and segment definitions",
      "Boutique performance",
      "Personalization model features and training data",
      "Financial postings from PeopleSoft",
    ],
  },
  {
    kind: "datastore",
    id: "redis-sessions",
    name: "Session Store",
    technology: "Redis",
    description:
      "Server-side sessions for the current storefront. Authentication is per-device with no cross-device persistence; a 30-day remember-me cookie grants partial authentication.",
    contents: ["Web sessions", "Remember-me tokens", "Partial-auth state"],
    phase: "current",
  },
  {
    kind: "datastore",
    id: "s3-media",
    name: "Product Image Store",
    technology: "Amazon S3",
    description:
      "Raw product imagery in a templated naming convention the storefront resolves. Retained through the migration — a DAM transformation is explicitly out of Phase 1.",
    contents: [
      "Original product images",
      "Pre-generated variants (door, banner, billboard, header, lookbook, section-gutter)",
      "Boutique assets synced from Canto",
    ],
  },
  {
    kind: "datastore",
    id: "monolith-db",
    name: "Monolith Database",
    technology: "Relational database",
    description:
      "The transactional heart of the current platform. Also where the homegrown OMS keeps its business logic, in stored procedures rather than application code.",
    contents: [
      "Orders and inventory",
      "Customer segments (manually uploaded from the data warehouse)",
      "Loyalty tiers and store credit ledger",
      "OMS stored procedures and adapter layers",
    ],
    phase: "current",
  },
  {
    kind: "datastore",
    id: "store-manager-db",
    name: "Store Manager Database",
    technology: "Relational database",
    description:
      "Store Manager's own database — separate application, separate schema. Retired with the application at cutover.",
    contents: [
      "Boutique definitions and day-part schedules",
      "Product-to-boutique assignments",
      "PLP sort order and pinning",
      "Site content and affiliate codes",
    ],
    phase: "current",
  },
  {
    kind: "datastore",
    id: "merch-app-db",
    name: "Merch App Database",
    technology: "Relational database",
    description:
      "Merch App's own database. Retained alongside the application in its PLM role.",
    contents: [
      "Purchase orders and PO states",
      "Vendor and brand records (~7,500 vendors)",
      "Master hierarchies and taxonomy",
      "Size masters and attribute bases",
      "Experiences voucher codes",
    ],
  },
  {
    kind: "datastore",
    id: "scayle-catalog-store",
    name: "SCAYLE Catalog Store",
    technology: "SCAYLE managed storage",
    description:
      "SCAYLE-managed persistence behind the PIM and shop categories, including the custom data objects that carry boutique content. Modelled separately from order storage so PIM and OMS writes land on different nodes.",
    contents: [
      "Masters, products, variants",
      "Attribute groups and attribute values",
      "Shop categories (boutiques) and hierarchy",
      "Custom data objects — boutique headline, assets, ranking boost, segmentation",
      "Price campaigns and product sets",
    ],
    phase: "target",
  },
  {
    kind: "datastore",
    id: "scayle-order-store",
    name: "SCAYLE Order Store",
    technology: "SCAYLE managed storage",
    description:
      "SCAYLE-managed persistence behind checkout and the OMS, including its local inventory view.",
    contents: [
      "Orders across Rue, Gilt, Marketplace, International",
      "Local inventory view (not the system of record)",
      "Customers and customer segments",
      "Payment and settlement references",
    ],
    phase: "target",
  },
];
