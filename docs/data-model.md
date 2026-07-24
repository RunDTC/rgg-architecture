# Editing the architecture model

Architecture content lives in typed TypeScript under `src/data/`; the categorical vocabulary (tiers, domains, …) and branding live in `src/config/`. The views render whatever these files contain — edit them, and every view updates. This doc covers the shape of the model, the cross-file references you must keep consistent, and a checklist for each kind of change.

## Files

| File | Exports | Holds |
| --- | --- | --- |
| `src/config/taxonomy.ts` | `TIERS`, `SYSTEM_STATUSES`, `FLOW_KINDS`, `DOMAINS`, `MIGRATION_STATUSES`, `NODE_KIND_VISUALS`, and the derived `Tier` / `SystemStatus` / `FlowKind` / `Domain` / `MigrationStatus` types | The categorical vocabulary + colors — single source of truth |
| `src/config/site.ts` | `site`, `ViewId` | Branding and default view/domain |
| `src/config/landscape.ts` | `lanes`, `LaneSpec` | Landscape swimlane columns |
| `types.ts` | model interfaces | `SystemDef`, `DataStoreDef`, `ExternalDef`, `FlowDef`, `MigrationDef` (re-exports the union types from `taxonomy.ts`) |
| `systems.ts` | `systems: SystemDef[]` | Every first-party system |
| `datastores.ts` | `datastores: DataStoreDef[]` | Databases/storage with a `contents` list of what lives inside |
| `externals.ts` | `externals: ExternalDef[]` | Third-party services |
| `flows.ts` | `flows: FlowDef[]` | Directed edges between any two node ids |
| `migrations.ts` | `migrations: MigrationDef[]` | Legacy → modern replacement pairs with status |
| `model.ts` | `allNodes`, `nodeById`, `flowsForNode()`, `flowsForDomain()`, `nodeIdsForFlows()` + re-exports of the data arrays | Derived lookups — no data lives here |

## The id graph (what must stay consistent)

Node `id`s are the glue. They are referenced from:

- `flows.ts` — every `source` and `target`
- `migrations.ts` — every entry in `from` and `to`
- `src/config/landscape.ts` — only for lanes that use an explicit `{ ids: [...] }` list (tier/kind lanes derive membership automatically)

**There is no runtime validation.** `FlowGraph` silently skips edges whose endpoints aren't in the current view, and `model.ts` lookups just miss. A typo'd id doesn't crash — the edge or node quietly disappears. Double-check ids against the actual arrays when adding flows. If you rename an id, grep `src/data/` and `src/config/`.

## Checklists by change type

### Add a system

1. Append a `SystemDef` to `systems.ts`. Pick `tier` and `status` from the ids in `src/config/taxonomy.ts`.
2. Placement is usually automatic — the Landscape view derives each lane from a tier, so a system in an existing tier appears without further edits. (Only if you introduce a new tier, or use a custom `{ ids }` lane, do you touch `src/config/landscape.ts`.)
3. Add `FlowDef`s in `flows.ts` connecting it to what it talks to. A node with no flows only appears in the Landscape view.
4. If it participates in a migration, update `migrations.ts`.

### Add a data store or external service

Same as a system, but in `datastores.ts` / `externals.ts`. They land in the "Data Stores" / "External Services" lanes automatically. Data stores get a filter chip in the Data Stores view — fill `contents` with the notable collections/tables/files.

### Add a flow

1. Append a `FlowDef` to `flows.ts`. `id` convention: `"<source>-to-<target>"` or `"<source>-<topic>"`, kebab-case.
2. `kind` is one of the ids in `FLOW_KINDS` (`api-call`, `read`, `write`, `read-write`, `sync`, `webhook`, `cron`, `queue`, `handoff`, `export`).
3. Tag every `Domain` it belongs to — domain tags drive the Data Flows view filter.
4. Keep `label` short (it renders on the edge); use `description` for detail (shows in the DetailPanel).
5. Optional flags:
   - `step: n` — includes the edge in the animated, numbered trace shown when its domain is selected (the sample uses this for the Orders lifecycle). Steps that happen in parallel may share a number.
   - `planned: true` — renders dashed, for flows that don't exist yet.

### Add a tier, domain, status, or flow kind

Add one entry to the relevant array in `src/config/taxonomy.ts` (with a `color`; a tier also needs `accent` + `bg`). The union type, the theme label/color maps, the legend, and the Data Flows chip order all derive from that array — nothing else to touch. Run `npx tsc --noEmit` to confirm.

### Add or update a migration

Append/edit a `MigrationDef` in `migrations.ts`. `from`/`to` are arrays of node ids (a migration can fan in/out). `status` is an id from `MIGRATION_STATUSES`; `deadline` is a free-form string shown as a badge.

## Content guidelines

- The bundled data is an illustrative sample. For a real client, base facts on the client's real systems (repos, docs, interviews) or ask — don't invent stacks, endpoints, or flow directions.
- `description`: one or two sentences — what the system is and its role today.
- `notes`: the non-obvious operational facts (gotchas, cutover state, where docs/credentials live).
- `repoPath` (optional): local path to the system's source, if you keep the client's repos as siblings.

## Verifying a change

```bash
npx tsc --noEmit     # catches type errors and bad union ids
npm run dev          # then eyeball the affected view
```

Things to check visually: the node appears in its Landscape lane, its edges show in the relevant domain filters, hover-highlighting picks up the new connections, and the DetailPanel fact sheet reads correctly.
