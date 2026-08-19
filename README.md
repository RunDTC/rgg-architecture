# Architecture Explorer (template)

A reusable, interactive map of a client's systems: what runs where, how data flows between systems, which stores each system touches, and how far along each legacy-to-modern migration is.

This repo is a **template**. It ships with a neutral sample dataset — "Acme Outfitters", a fictional mid-market retailer on Shopify with an iPaaS, OMS, and PIM — so it runs out of the box and doubles as a worked example. To build a real client's map, see [docs/new-client.md](docs/new-client.md).

## Running

```bash
npm install
npm run dev   # http://localhost:3000
```

## Views

- **Integration Map** *(landing page)* — the hub-and-spoke system landscape: SCAYLE as the
  hub, the Confluent/Flink event mesh as a bus band beneath it, and the rest of the estate
  as clustered satellites. A higher-altitude view than the System Landscape — it collapses
  65 nodes into eleven boxes, with the cutover on the vertical axis (SCAYLE era above the
  bus, the monolith below). Hover a box to isolate its connections; click any member chip
  for that node's fact sheet. Edge thickness reflects how many underlying flows cross that
  boundary.
- **System Landscape** — every system, data store, and external service in swimlanes. Lanes derive from each system's tier (plus data stores and externals), configured in `src/config/landscape.ts`. Hover a node to isolate its connections; click for the full fact sheet.
- **Data Flows** — filter the graph by business domain (Orders, Payments, Catalog, Inventory, Fulfillment, Customers, Marketing, Search, Reporting). The Orders domain traces the order lifecycle with numbered, animated steps.
- **Data Stores** — pick a store and see every system that reads or writes it, plus what lives inside.
- **Migration Map** — each modernization effort, what it replaces, and its status.

## Configuring for a client

Two directories hold everything client-specific:

| Path | What it holds |
| --- | --- |
| `src/config/taxonomy.ts` | Tiers, system statuses, flow kinds, domains, migration statuses — each an array of `{ id, label, color }`. The TypeScript union types and all theme colors/labels derive from these arrays, so adding a domain (etc.) is a one-line edit. |
| `src/config/site.ts` | Branding: app name, titles, header text, default view and domain. |
| `src/config/landscape.ts` | Swimlane columns for the Landscape view (by tier, by kind, or an explicit id list). |
| `src/config/integration-map.ts` | Group membership + positions for the Integration Map. States *only* grouping and position — edges are derived from `flows.ts`, so adding a flow updates the map automatically. `EDGE_LABELS` overrides a derived label where aggregation gets noisy. Every node should sit in exactly one group; `IntegrationMapView` logs a dev-only warning naming anything ungrouped or double-counted. |
| `src/data/systems.ts` | Each system: tier, status, stack, runtime, notes. |
| `src/data/datastores.ts` | Databases and storage with their notable contents. |
| `src/data/externals.ts` | Third-party services. |
| `src/data/flows.ts` | Edges: source → target with kind, domain tags, label. `step` numbers a flow in the order-lifecycle trace; `planned: true` renders it dashed. |
| `src/data/migrations.ts` | Legacy → modern replacement pairs with status and summary. |

Add or edit entries and the views update automatically. Node `id`s are referenced by flows and migrations, so keep them stable.

Full editing reference: [docs/data-model.md](docs/data-model.md). How the app is built: [docs/app-architecture.md](docs/app-architecture.md). New-client runbook: [docs/new-client.md](docs/new-client.md).

## Deployment (Vercel Authentication)

1. Deploy the project to Vercel.
2. In the project's **Deployment Protection** settings, enable **Vercel Authentication** with "Standard Protection" (protects production and all preview deployments). This gates access to logged-in Vercel team/project members (or anyone explicitly granted access) — no custom domain or third-party proxy required.

No app code enforces this — it's a platform-level setting, the same pattern used by this workspace's `scayle-storefront` deployment.
