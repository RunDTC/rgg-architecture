import type { DataStoreDef } from "./types";

// Databases and storage. `contents` lists the notable collections/tables/files inside —
// the Data Stores view displays them. Sample data — replace per client.

export const datastores: DataStoreDef[] = [
  {
    kind: "datastore",
    id: "oms-db",
    name: "Order Database",
    technology: "PostgreSQL",
    description:
      "Transactional store for orders, fulfillments, and aggregated inventory, owned by the OMS.",
    contents: [
      "Orders & line items",
      "Fulfillments & shipments",
      "Inventory positions",
      "Customer order history",
    ],
  },
  {
    kind: "datastore",
    id: "pim-db",
    name: "Product Database",
    technology: "MySQL",
    description: "Master product content managed by the PIM.",
    contents: [
      "Products & variants",
      "Attributes & categories",
      "Media references",
      "Sales-channel mappings",
    ],
  },
  {
    kind: "datastore",
    id: "warehouse",
    name: "Data Warehouse",
    technology: "Snowflake",
    description:
      "Analytical warehouse loaded by the ETL service for reporting and dashboards.",
    contents: [
      "Sales & order facts",
      "Catalog dimensions",
      "Finance & margin",
      "Marketing performance",
    ],
  },
  {
    kind: "datastore",
    id: "cache",
    name: "Cache",
    technology: "Redis",
    description:
      "Low-latency cache for storefront reads and sessions, fronted by the BFF.",
    contents: ["Product & collection cache", "Session data", "Rate-limit counters"],
  },
  {
    kind: "datastore",
    id: "object-storage",
    name: "Object Storage",
    technology: "Amazon S3",
    description: "Bucket store for product media, import/export files, and feeds.",
    contents: [
      "Product images & video",
      "Catalog import/export files",
      "Generated product feeds",
    ],
  },
  {
    kind: "datastore",
    id: "search-index",
    name: "Search Index",
    technology: "OpenSearch",
    description: "Inverted index powering product search and autocomplete.",
    contents: ["Product documents", "Synonyms & suggestions", "Facet/aggregation data"],
  },
  {
    kind: "datastore",
    id: "event-bus",
    name: "Event Bus",
    technology: "Apache Kafka",
    description:
      "Durable event stream published by the iPaaS and consumed by downstream services.",
    contents: ["Order events", "Inventory events", "Customer events"],
  },
];
