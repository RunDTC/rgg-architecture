# App architecture

How the explorer itself is built. For editing the *content* (systems, flows, migrations), see [data-model.md](data-model.md). For cloning to a new client, see [new-client.md](new-client.md).

## Rendering model

Everything is a single page (`src/app/page.tsx` → `Explorer`). The curated model is plain TypeScript imported at build time — no fetching, no API routes, no state beyond which view/node is active. Graph components are `"use client"` because React Flow requires the DOM.

```
src/config/  (per-client: taxonomy, branding, swimlanes)
   │  derives union types, colors, legend, lane membership
   ▼
Explorer (view tabs + search + selection state)
├── LandscapeView ─┐
├── DataFlowView  ─┼─→ FlowGraph (shared React Flow wrapper)
├── DataStoreView ─┘      ├── ArchNode (card-style custom node)
├── MigrationView (no graph; card grid)
└── DetailPanel (slide-over fact sheet for the selected node)
```

## Config vs. engine — what makes this a template

- **`src/config/`** is per-client. `taxonomy.ts` defines the vocabulary (tiers, statuses, flow kinds, domains) as arrays of `{ id, label, color }`; the union types in `src/data/types.ts` and every map in `src/lib/theme.ts` are *derived* from it, so adding a domain (etc.) is a one-line edit. `site.ts` holds branding + defaults; `landscape.ts` holds swimlanes.
- **`src/graph/`, `src/components/`, `src/lib/theme.ts`** are the generic engine — they consume config + data and never hard-code a client's ids or vocabulary.

Onboarding a client is therefore: edit `src/config/*` + `src/data/*`, leave the engine alone.

## The shared graph engine (`src/graph/`)

`FlowGraph.tsx` is the one React Flow instance all graph views use. Views differ only in what they pass in:

- `positions: Map<id, Point>` — decides **which nodes render and where**. `FlowGraph` drops any flow whose endpoints aren't in the map, so views control membership purely through positions.
- `flows: FlowDef[]` — the edge subset to draw.
- `traceDomain` — colors edges by domain and animates/numbers edges that have a `step` (used by DataFlowView).
- `showLabels` — edge labels off for dense views (Landscape).
- `laneLabels` — static swimlane headers rendered as non-interactive nodes.

Hover/selection behavior lives entirely in `FlowGraph`: hovering (or selecting) a node dims everything outside its direct neighborhood; clicking the pane clears selection. Views pass a `key` prop when their subset changes (`key={domain}`, `key={storeId}`) to reset React Flow's internal state and refit the viewport.

Positioning strategies:

- **LandscapeView** computes fixed column/row positions from `src/config/landscape.ts`: each lane resolves to node ids by `tier`, by node `kind` (datastore/external), or an explicit id list. A new system in an existing tier appears automatically — no view edit needed.
- **DataFlowView / DataStoreView** derive the node subset from flows, then auto-layout with `dagreLayout()` (`layout.ts`, left-to-right).

## Selection and detail

`Explorer` owns `selectedId`. Every view, the search bar, and the DetailPanel's connection links all funnel through the same `onSelect(id)`. The DetailPanel resolves the id via `nodeById` and renders a kind-specific fact sheet plus incoming/outgoing flows from `flowsForNode()`.

## Theming

Dark-only. All graph colors originate in `src/config/taxonomy.ts` and are exposed through `src/lib/theme.ts` as inline hex, because React Flow node/edge styles are inline `style` objects, not classes. `nodeVisual()` maps a node to its accent/background: systems by `tier`, datastores and externals by `NODE_KIND_VISUALS`. UI chrome (headers, chips, panels) uses Tailwind slate/sky utilities directly; a few structural hex values remain inline in the engine and views.

## Access protection

Handled entirely by Vercel's platform-level **Deployment Protection** (Vercel Authentication, Standard Protection) — no app code involved. See the README's Deployment section.

## Dependencies worth knowing

| Package | Role |
| --- | --- |
| `@xyflow/react` v12 | Graph canvas (pan/zoom, custom nodes/edges) |
| `@dagrejs/dagre` | Auto-layout for flow-derived views |
| Tailwind 4 (via `@tailwindcss/postcss`) | Styling; no tailwind.config — theme tokens in `globals.css` |
