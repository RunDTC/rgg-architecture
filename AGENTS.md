<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Architecture Explorer (template)

Interactive map of a client's systems, data flows, data stores, and legacy-to-modern migrations. Next.js (App Router) + TypeScript + Tailwind 4 + React Flow (`@xyflow/react`) + dagre. The architecture knowledge is **hand-curated TypeScript data** under `src/data/`, and each client's vocabulary + branding live in `src/config/` — there is no database, no API, no scanning. Everything is bundled at build time.

This repository is the **Rue Gilt Group** instance of a reusable template (the engine under `src/graph/`, `src/components/`, and `src/lib/` is still generic — `docs/new-client.md` describes cloning it for another client).

The model covers **both** RGG's current state and the SCAYLE target state:

- **SCAYLE** is the PIM, the ecommerce platform, and the OMS.
- **Merch App** is retained as the **PLM** — vendor offer sheets, product and PO skeletons, PO states.
- **Store Manager** is **retired into SCAYLE**: boutiques become shop categories with product attribution and custom data objects, plus a Vue 3 panel micro-frontend ("Boutique Studio") for approval workflow, merchandising sort, and preview.
- **No third-party CMS** — boutique content lives in SCAYLE custom data objects.
- **No iPaaS** — data movement runs on the existing Confluent/Kafka backbone with Flink.

`tier` means *architectural role*; `status` carries the cutover timeline. `status: "at-risk"` and `MigrationStatus: "unresolved"` mark capabilities with no agreed target owner — today the loyalty engine, store credit ledger, affiliate engine, and personalization.

## Commands

```bash
npm run dev          # dev server at http://localhost:3000
npm run build        # production build (also the best full type-check)
npm run lint         # eslint
npx tsc --noEmit     # type-check only
```

## Layout

| Path | Purpose |
| --- | --- |
| `src/config/` | **Per-client config** — `taxonomy.ts` (tiers/statuses/flow-kinds/domains + colors, from which the union types derive), `site.ts` (branding + defaults), `landscape.ts` (swimlanes) |
| `src/data/` | The curated model: `systems.ts`, `datastores.ts`, `externals.ts`, `flows.ts`, `migrations.ts`, shared `types.ts`, and `model.ts` (lookups/selectors) |
| `src/views/` | One client component per tab: Landscape, Data Flows, Sequence Diagrams, Data Stores, Migration Map |
| `src/graph/` | Shared React Flow engine: `FlowGraph.tsx` (nodes/edges/hover/trace), `ArchNode.tsx`, `layout.ts` (dagre) |
| `src/components/` | `Explorer.tsx` (view shell), `DetailPanel`, `SearchBar`, `Legend` |
| `src/lib/theme.ts` | Colors + labels for tiers/statuses/domains/flow kinds — **all derived from `src/config/taxonomy.ts`** |
| `docs/` | `data-model.md` (editing the model), `app-architecture.md` (how the app is built), `new-client.md` (cloning for a new client) |

## Editing the architecture model — most common task

Follow `docs/data-model.md` (or the `update-architecture-model` skill). The short version:

1. Node `id`s are referenced by `flows.ts` and `migrations.ts`. **Keep ids stable**; there is no runtime validation that a flow's `source`/`target` exists — a typo silently drops the edge from views.
2. **Adding a system/datastore/external** is usually just the data file: swimlanes derive membership from a system's `tier` (or node kind), so a new system in an existing tier appears automatically. Only custom `{ ids }` lanes in `src/config/landscape.ts` need manual updates.
3. **Adding a `Domain`, `Tier`, `FlowKind`, or status** is a one-line edit in `src/config/taxonomy.ts` — add an entry (with a color) to the relevant array. The union type, theme colors/labels, legend, and chip order all derive from it. No `theme.ts` edit needed.
4. `flows.ts`: `step` numbers the animated boutique-lifecycle trace (Data Flows → Merchandising), with `stepDomain` pinning a multi-domain stepped flow to one trace; `planned: true` renders the edge dashed and is set on every target-state edge.
5. Branding (titles, header, default view/domain) lives in `src/config/site.ts`.
6. Verify with `npx tsc --noEmit`, then eyeball the affected view in the dev server.

## Conventions

- Path alias `@/*` → `src/*`.
- Graph views are `"use client"`; keep the data model + config importable on both server and client (plain data + pure functions, no side effects).
- Dark-theme only; colors are hex values in `src/config/taxonomy.ts` (plus a few structural ones inline in the engine), not Tailwind classes, because React Flow node/edge styles are inline.
- `src/data/*` holds **real RGG facts** sourced from meeting notes, the RunDTC/SCAYLE approach docs, the POC scope, and requirements transcripts — not a sample. Don't invent architecture facts; where the record conflicts or is silent, say so in a `description`/`note` rather than picking a side (see the inventory-API and Manhattan notes for the pattern).

## Deployment

Vercel, protected by Vercel Authentication (Standard Protection) at the project level — no app code involved. Details in `README.md`.
