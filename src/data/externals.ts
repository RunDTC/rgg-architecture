import type { ExternalDef } from "./types";

// Third-party services the business depends on. Sample data — replace per client.

export const externals: ExternalDef[] = [
  {
    kind: "external",
    id: "payment-gateway",
    name: "Payment Gateway",
    category: "Payments",
    description:
      "Card and wallet payment processing, invoked at checkout and settled against orders.",
  },
  {
    kind: "external",
    id: "tax-service",
    name: "Tax Service",
    category: "Tax",
    description:
      "Real-time sales-tax calculation at checkout and for post-purchase order adjustments.",
  },
  {
    kind: "external",
    id: "shipping-service",
    name: "Shipping Service",
    category: "Shipping",
    description:
      "Multi-carrier rate shopping, label generation, and tracking used by the OMS.",
  },
  {
    kind: "external",
    id: "erp",
    name: "ERP (Finance)",
    category: "ERP / Finance",
    description:
      "Financial system of record for accounting, purchasing, and inventory replenishment.",
  },
  {
    kind: "external",
    id: "threepl",
    name: "3PL / Fulfillment",
    category: "Logistics",
    description:
      "Third-party logistics provider that picks, packs, and ships orders and reports warehouse inventory.",
  },
  {
    kind: "external",
    id: "email-marketing",
    name: "Email & SMS Marketing",
    category: "Marketing",
    description:
      "Marketing platform receiving customer and order events to drive campaigns and automated flows.",
  },
  {
    kind: "external",
    id: "analytics-saas",
    name: "Web Analytics",
    category: "Analytics",
    description:
      "Web and product analytics collecting behavioral events from the storefront.",
  },
  {
    kind: "external",
    id: "cdn",
    name: "Image CDN",
    category: "CDN",
    description:
      "Content delivery network serving product media and static assets from object storage.",
  },
  {
    kind: "external",
    id: "monitoring",
    name: "Monitoring & Observability",
    category: "Observability",
    description: "Metrics, logs, and alerting across services and integrations.",
  },
  {
    kind: "external",
    id: "supplier-edi",
    name: "Supplier EDI Feed",
    category: "Supplier Feed",
    description:
      "Vendor catalog and inventory feeds delivered via EDI/SFTP and imported through the iPaaS.",
  },
];
