# AGENTS.md

## Build and Development Commands

- **Development**: `pnpm dev` or `npm run dev` - Starts Next.js dev server on port 3000
- **Build**: `pnpm run build` or `npm run build` - Builds for production
- **Production start**: `pnpm start` or `npm start` - Runs production server
- **Lint**: `pnpm run lint` or `npm run lint` - Runs Biome linter
- **Format**: `pnpm run format` or `npm run format` - Auto-formats code with Biome
- **Single test**: No test runner configured; use console.log() for debugging

## Architecture and Structure

- **Framework**: Next.js 16.1.1 with React 19.2.3
- **UI Library**: Material UI (MUI) v7
- **Styling**: Tailwind CSS v4 + Emotion + MUI
- **RSS Parsing**: rss-parser v3.13.0
- **App Structure**: 
  - `/src/app/` - App Router (pages, layouts, server actions)
  - `/src/app/components/` - React components
  - `/src/app/actions.js` - Server actions for RSS fetching
  - `/src/app/theme.js` - MUI theme configuration

## Code Style and Conventions

- **Language**: JavaScript (ES modules)
- **Formatter**: Biome 2.2.0 (2 spaces, organized imports)
- **Linting**: Biome with React and Next.js rules enabled
- **Path Aliases**: Use `@/*` to import from `/src/*`
- **Import Organization**: Biome auto-organizes imports
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Module System**: ESM only (`.mjs` configs, `import`/`export`)
- **Cache**: RSS feeds cached 5 minutes; use server actions for data fetching
