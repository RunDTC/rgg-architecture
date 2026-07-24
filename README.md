# Architecture Explorer (template)

A reusable, interactive map of a client's systems: what runs where, how data flows between systems, which stores each system touches, and how far along each legacy-to-modern migration is.

This repo is a **template**. It ships with a neutral sample dataset — "Acme Outfitters", a fictional mid-market retailer on Shopify with an iPaaS, OMS, and PIM — so it runs out of the box and doubles as a worked example. To build a real client's map, see [docs/new-client.md](docs/new-client.md).

## Running

```bash
npm install
npm run dev   # http://localhost:3000
```

## Views

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
| `src/data/systems.ts` | Each system: tier, status, stack, runtime, notes. |
| `src/data/datastores.ts` | Databases and storage with their notable contents. |
| `src/data/externals.ts` | Third-party services. |
| `src/data/flows.ts` | Edges: source → target with kind, domain tags, label. `step` numbers a flow in the order-lifecycle trace; `planned: true` renders it dashed. |
| `src/data/migrations.ts` | Legacy → modern replacement pairs with status and summary. |

Add or edit entries and the views update automatically. Node `id`s are referenced by flows and migrations, so keep them stable.

Full editing reference: [docs/data-model.md](docs/data-model.md). How the app is built: [docs/app-architecture.md](docs/app-architecture.md). New-client runbook: [docs/new-client.md](docs/new-client.md).

## Deployment (Vercel behind Cloudflare Access)

1. Deploy the project to Vercel.
2. Point a Cloudflare-proxied subdomain (e.g. `architecture.example.com`) at Vercel; use Full (strict) SSL.
3. In Cloudflare Zero Trust, create an Access application for that hostname with your allow policy (email OTP or SSO).
4. Set these environment variables on Vercel to activate origin protection:
   - `CF_ACCESS_TEAM_DOMAIN` — your team domain, e.g. `myteam.cloudflareaccess.com`
   - `CF_ACCESS_AUD` — the Access application's Audience (AUD) tag

[src/proxy.ts](src/proxy.ts) verifies the `Cf-Access-Jwt-Assertion` JWT against the team's public signing keys on every request, so hitting the raw `*.vercel.app` URL without going through Access returns 403. When the env vars are unset (local dev), the check is skipped.
