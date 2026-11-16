# Developer Guide

## Commands (from `package.json`)

```bash
npm install
npm run dev          # Vite dev server
npm run test:core    # node --test on tests/*.test.mjs: 108 pass on this snapshot
npm run typecheck    # tsc --noEmit
npm run build        # typecheck + vite build (ran OK on this snapshot)
npm test             # node tests + vitest (CI also runs Playwright)
```

CI: `.github/workflows/ci.yml`; Pages deploy: `.github/workflows/deploy-pages.yml`.

## Dependency note

`package.json` lists most dependencies as `"latest"` (react, vite, typescript, vitest, eslint and others).
That makes builds non-reproducible. `package-lock.json` is committed and pins them for now. Consider exact
versions before relying on a fresh install.

## Where to start

`src/experiments/` (runtime and catalogue), `src/audio/` (audio engine and scheduler), `src/components/` (UI and per-experiment panels),
`src/infinite-motion/`. Read the matching spec in `docs/specs/experiments/` before changing an experiment.
