<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

## Commands

| Command | What it does |
|---------|-------------|
| `npm dev` | Dev server on port 3000 |
| `npm build` | Production build |
| `npm start` | Production start |
| `npm lint` | Biome check --fix |
| `npm format` | Biome format --write |

## Key facts

- **Stack**: Next.js 16.2.4, React 19.2.5, MUI v9, Tailwind CSS v4, Biome 2.4.12
- **Language**: JavaScript (ESM, no TypeScript)
- **Imports**: `@/*` → `src/*`
- **Format**: tab indentation, double quotes, Biome auto-organizes imports
- **Auth**: passphrase-based via `src/lib/simple-auth.js`; uses Neon (Postgres) — `DATABASE_URL` env var required
- **Data**: RSS via `rss-parser`, server actions in `src/app/actions.js`, feeds cached 5 min via `unstable_cache`
- **Client state**: `localStorage` via `usehooks-ts` + SWR; server sync via `syncFeeds` action
- **Modes**: "classic" (default) and "gmail" — toggle via FAB
- **PWA**: listens for `beforeinstallprompt`
