# Cloning this template for a new client

This repo is a template. Each client gets its own copy (one repo per client) — the graph engine stays untouched; you edit config + data.

## 1. Copy the template

```bash
cp -R architecture-template <client>-architecture
cd <client>-architecture
rm -rf .git node_modules .next
git init
npm install
npm run dev   # confirm the sample renders at http://localhost:3000
```

Set `name` in `package.json` to the client's slug.

## 2. Branding — `src/config/site.ts`

Set `name`, `headerTitle`, `headerSubtitle`, `metaTitle`, `metaDescription`, and the `defaultView` / `defaultDomain`. Replace `src/app/favicon.ico` if you have a client icon.

## 3. Vocabulary — `src/config/taxonomy.ts`

Adjust the arrays to the client's world:

- `TIERS` — the architectural layers you'll group systems into (these are also the Landscape swimlanes). Give each an `accent`, `bg`, and `label`.
- `DOMAINS` — the business domains flows belong to (Data Flows chips). Array order = chip order.
- `SYSTEM_STATUSES`, `FLOW_KINDS`, `MIGRATION_STATUSES` — usually fine as-is; edit labels/colors if the client's language differs.

The union types, theme colors/labels, and legend all derive from these arrays automatically — no other file to touch.

## 4. Swimlanes — `src/config/landscape.ts`

The default lanes cover every tier plus data stores and externals. Reorder or retitle them, or use `{ ids: [...] }` for a custom grouping. Keep a lane for every tier and both node kinds so no node is left unplaced (unplaced nodes silently disappear from the Landscape view).

## 5. The model — `src/data/*`

Replace the sample content:

- `systems.ts`, `datastores.ts`, `externals.ts` — the nodes. Keep ids stable and kebab-case.
- `flows.ts` — the edges. Tag domains; use `step` for a sequenced trace and `planned: true` for future flows.
- `migrations.ts` — legacy → modern efforts.

Base facts on the client's real systems (repos, docs, interviews). See [data-model.md](data-model.md) for the full field reference and checklists.

## 6. Verify

```bash
npx tsc --noEmit
npm run build
npm run dev
```

Check all four views (Landscape lanes populate, Data Flows chips + Orders trace animate, Data Stores fact card, Migration Map statuses). Then deploy per the [README](../README.md) (Vercel behind Cloudflare Access).
