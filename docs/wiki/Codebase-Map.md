# Codebase Map: where to find what

| I want to... | Look in |
|---|---|
| App shell | `src/App.tsx` |
| Experiment catalogue and runtimes | `src/experiments/` (`catalog.js`, `*Runtime.ts`) |
| Audio engine, scheduler, noise, render | `src/audio/` (`AudioEngine.ts`, `scheduler.ts`, `core.js`, `noise.js`, `render.js`) |
| Lab page and signal display | `src/components/LabPage.tsx`, `SignalCanvas.tsx`, `EventLanes.tsx` |
| Per-experiment control panels | `src/components/panels/` |
| Infinite Motion | `src/infinite-motion/` |
| Perception reports | `src/perception/` |
| Phantom-word assets | `src/assets/phantomWords.js` |
| Tests | `tests/*.test.mjs` (node), `src/core.vitest.test.ts` (vitest), Playwright in CI |
| Specs | `docs/specs/`, `docs/specs/experiments/` |
| CI and Pages | `.github/workflows/` |
