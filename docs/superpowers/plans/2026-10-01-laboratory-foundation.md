# Auditory Illusion Laboratory Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy the research-grounded Auditory Illusion Laboratory with shared DSP infrastructure, local perception recording, tested classic experiments, lab controls, visualizations, and GitHub Pages CI.

**Architecture:** React/Vite hosts experiment modules behind a common controller contract. UI-independent DSP primitives feed a single guarded Web Audio master chain, while OfflineAudioContext/pure numerical tests verify signal construction. Perception data remains local and every visualization distinguishes measured signal, predicted products, and listener reports.

**Tech Stack:** Vite, TypeScript strict mode, React, Web Audio API, AudioWorklet where justified, Canvas 2D, Vitest, Playwright, ESLint, GitHub Actions, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-10-01-auditory-illusion-laboratory-design.md`

## Global Constraints

- One shared `AudioEngine`; experiments never connect directly to `AudioDestinationNode`.
- CLASSIC mode preserves research-grounded stimulus structure; LAB mode may expose additional controls.
- Parameter smoothing and click-free start/stop ramps are mandatory.
- Generated/measured signal, predicted auditory products, and listener-reported percepts must be visually and semantically distinct.
- Perception reports and preferences are local-only in v1.
- Microphone recordings are not persisted unless explicitly exported.
- Web MIDI is progressive enhancement and must not block app startup.
- TypeScript strict mode, lint, unit tests, browser tests, production build, and GitHub Pages base-path behavior are release gates.

## Review Focus

- Invalid or extreme frequency/tempo parameters are clamped before reaching oscillators/schedulers and never create NaN/Infinity audio values.
- Rapid experiment switching leaves no orphaned oscillators, timers, worklets or audible graphs.
- Browser autoplay/suspended AudioContext state produces a recoverable UI state instead of a silent broken experiment.
- LocalStorage/IndexedDB unavailable or full does not prevent audio experiments from working.
- Reduced-motion and keyboard-only operation preserve all controls and experiment functionality.

---

### Task 1: Project shell, CI and shared types

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `index.html`
- Create: `src/main.tsx`, `src/App.tsx`, `src/styles.css`
- Create: `src/types/experiments.ts`
- Create: `.github/workflows/ci.yml`, `.github/workflows/deploy-pages.yml`
- Test: `src/App.test.tsx`

**Interfaces:**
- Produces `PlaybackMode`, `ExperimentDescriptor`, `ExperimentController` and stable application shell used by later tasks.

- [ ] Write a failing render test asserting the product switch, audio status and empty experiment catalog shell render accessibly.
- [ ] Run the focused Vitest test and verify it fails because the shell does not exist.
- [ ] Add minimal Vite/React/TypeScript setup and shared experiment types from the spec.
- [ ] Run focused test, typecheck, lint and build; all pass.
- [ ] Add CI workflows for install, lint, typecheck, test and build plus Pages deployment from `dist`.
- [ ] Commit `chore: scaffold laboratory app and CI`.

### Task 2: AudioEngine master chain and lifecycle

**Files:**
- Create: `src/audio/AudioEngine.ts`
- Create: `src/audio/envelopes.ts`
- Test: `src/audio/AudioEngine.test.ts`

**Interfaces:**
- Produces `AudioEngine.ensureRunning()`, `createInputBus()`, `stopActiveGraph()`, `panic()`, `getAnalyser()`, `setMasterLevel()`.

- [ ] Write failing tests for conservative default master level, parameter clamping, cleanup registration, and panic clearing active resources.
- [ ] Run focused tests and verify expected failures.
- [ ] Implement AudioEngine with safety gain, compressor/limiter stage, analyser, master output and cleanup registry.
- [ ] Add click-free gain ramp helper and test finite/clamped automation values.
- [ ] Run complete unit suite and build.
- [ ] Commit `feat: add guarded Web Audio engine`.

### Task 3: DSP primitive library

**Files:**
- Create: `src/audio/dsp/pitch.ts`
- Create: `src/audio/dsp/shepard.ts`
- Create: `src/audio/dsp/cycle.ts`
- Create: `src/audio/dsp/harmonics.ts`
- Create: `src/audio/dsp/noise.ts`
- Create: `src/audio/dsp/products.ts`
- Test: corresponding `*.test.ts` files

**Interfaces:**
- Produces pure functions for note/frequency conversion, octave partial lists, log-Gaussian weights, cyclic phase, harmonic complexes, notch filter specifications and predicted auditory products.

- [ ] Write failing numerical tests: exact octave ratios, Shepard weights finite/normalized, missing f0 omitted, product formulas exact, invalid inputs clamped/rejected.
- [ ] Verify RED.
- [ ] Implement pure DSP helpers without Web Audio dependencies.
- [ ] Verify focused tests and full suite GREEN.
- [ ] Commit `feat: add tested psychoacoustic DSP primitives`.

### Task 4: Perception recorder and local persistence

**Files:**
- Create: `src/perception/PerceptionStore.ts`
- Create: `src/perception/export.ts`
- Create: `src/components/PerceptionPanel.tsx`
- Test: `src/perception/PerceptionStore.test.ts`, `src/components/PerceptionPanel.test.tsx`

**Interfaces:**
- Produces `record()`, `list()`, `clear()`, `exportJson()` with graceful in-memory fallback when storage fails.

- [ ] Write failing tests for record/list/clear/export plus storage failure fallback.
- [ ] Verify RED.
- [ ] Implement store and UI controls.
- [ ] Verify tests and accessibility labels.
- [ ] Commit `feat: add local perception recorder`.

### Task 5: Experiment registry and common experiment UI

**Files:**
- Create: `src/experiments/registry.ts`
- Create: `src/components/ExperimentBrowser.tsx`
- Create: `src/components/ExperimentWorkspace.tsx`
- Create: `src/components/ParameterPanel.tsx`
- Test: component/registry tests

**Interfaces:**
- Consumes `ExperimentDescriptor` / `ExperimentController`.
- Produces route-free experiment selection, Classic/Lab switch, reset and transport controls.

- [ ] Write failing tests for category grouping, experiment selection, Classic/Lab defaults and reset.
- [ ] Verify RED.
- [ ] Implement registry-driven UI with no experiment-specific branching in the shell.
- [ ] Verify suite and keyboard navigation.
- [ ] Commit `feat: add experiment registry and workspace`.

### Task 6: Shepard circular pitch and Shepard–Risset glide

**Files:**
- Create: `src/experiments/shepard/*`
- Create: `src/experiments/risset-glide/*`
- Create visualizations under each module
- Test: numerical/offline-render tests and UI tests

**Interfaces:**
- Uses `AudioEngine` and Shepard primitives.
- Registers two experiment controllers.

- [ ] Write failing tests asserting octave spacing, cyclic envelope continuity, valid wrap behavior and classic defaults.
- [ ] Verify RED.
- [ ] Implement Shepard bank and continuous Risset glide with smoothed parameter updates.
- [ ] Add pitch-helix/log-frequency visualizations driven from the same state.
- [ ] Verify offline output and full suite.
- [ ] Commit `feat: add circular pitch experiments`.

### Task 7: Risset rhythm and auditory stream segregation

**Files:**
- Create: `src/experiments/risset-rhythm/*`
- Create: `src/experiments/streaming/*`
- Tests under each module

**Interfaces:**
- Produces cyclic pulse-layer scheduler and ABA_ streaming controller.

- [ ] Write failing timing tests for fixed rate ratios, cyclic layer weighting and exact ABA_ event order.
- [ ] Verify RED.
- [ ] Implement both controllers plus tempo-ring and stream-lane visualizations.
- [ ] Add ONE/TWO/SWITCHING response capture.
- [ ] Verify full suite.
- [ ] Commit `feat: add rhythmic and streaming illusions`.

### Task 8: Deutsch stereo illusion family

**Files:**
- Create modules for `octave`, `scale`, `chromatic`, `cambiata`, `glissando`, `tritone`
- Create shared `src/audio/dsp/stereoSequence.ts`
- Tests for exact event/channel schedules and octave-ambiguous tone construction

**Interfaces:**
- Produces sample-stable stereo event scheduler and six experiment controllers.

- [ ] Write failing schedule tests proving expected left/right event sequences, trial ordering and tritone six-semitone separation.
- [ ] Verify RED.
- [ ] Implement the shared stereo scheduler and classic presets.
- [ ] Implement Tritone Mapper response aggregation with no correctness score.
- [ ] Add physical-channel lane visualizations and listener response overlays.
- [ ] Verify unit/browser tests.
- [ ] Commit `feat: add Deutsch stereo and pitch paradox experiments`.

### Task 9: Continuity and Zwicker experiments

**Files:**
- Create: `src/experiments/continuity/*`
- Create: `src/experiments/zwicker/*`
- Test: offline signal tests

**Interfaces:**
- Uses noise/filter helpers and report store.

- [ ] Write failing offline tests proving target samples are zero during continuity masked gaps and proving post-inducer Zwicker report interval is digitally silent.
- [ ] Verify RED.
- [ ] Implement comparison modes and notched-noise inducer.
- [ ] Add explicit physical-waveform views and heard/not-heard reporting.
- [ ] Verify complete suite.
- [ ] Commit `feat: add continuity and Zwicker afterimage experiments`.

### Task 10: Missing fundamental and combination-tone explorer

**Files:**
- Create: `src/experiments/missing-fundamental/*`
- Create: `src/experiments/combination-tones/*`
- Create: `src/visualization/SpectrumCanvas.tsx`
- Tests for oscillator lists / FFT output / predicted products

**Interfaces:**
- Produces physical-spectrum and predicted-product layers with explicit labels.

- [ ] Write failing tests proving no oscillator exists at f0, harmonic frequencies equal N*f0, and classic combination-tone graph contains only f1/f2 sources.
- [ ] Verify RED.
- [ ] Implement both experiments and layered spectrum visualization.
- [ ] Add numerical/FFT tolerance test ensuring predicted products are not intentionally synthesized in classic mode.
- [ ] Verify suite.
- [ ] Commit `feat: add phantom pitch and combination tone labs`.

### Task 11: Precedence / Haas experiment

**Files:**
- Create: `src/experiments/precedence/*`
- Tests for delay clamping, source duplication and cleanup

**Interfaces:**
- Produces precedence experiment with left/right order and delay controls.

- [ ] Write failing tests for delay range and duplicate-source graph specification.
- [ ] Verify RED.
- [ ] Implement experiment and ONE/WIDE/TWO response UI.
- [ ] Verify suite.
- [ ] Commit `feat: add precedence localization lab`.

### Task 12: Speech experiments

**Files:**
- Create: `src/audio/recording/MicrophoneRecorder.ts`
- Create: `src/experiments/speech-to-song/*`
- Create: `src/experiments/phantom-words/*`
- Tests for buffer identity, permission errors and cleanup

**Interfaces:**
- Produces explicit-action microphone recording and unchanged-buffer repetition in classic speech-to-song mode.

- [ ] Write failing tests that classic repetition reuses identical sample data and that denied microphone permission leaves app usable.
- [ ] Verify RED.
- [ ] Implement recorder and speech-to-song.
- [ ] Implement phantom-words generated/user syllable loops and local free-text reports.
- [ ] Verify suite.
- [ ] Commit `feat: add speech perception experiments`.

### Task 13: Mysterious melody

**Files:**
- Create: `src/experiments/mysterious-melody/*`
- Tests for pitch-class preservation during octave scrambling

**Interfaces:**
- Produces deterministic seeded octave-scramble transform and reveal control.

- [ ] Write failing test proving MIDI note modulo 12 remains unchanged after scrambling.
- [ ] Verify RED.
- [ ] Implement transform, playback and reveal visualization.
- [ ] Verify suite.
- [ ] Commit `feat: add mysterious melody experiment`.

### Task 14: Responsive/accessibility polish and browser behavior

**Files:**
- Modify app shell/components/styles
- Create Playwright tests under `tests/e2e/`

**Interfaces:**
- No new product API; verifies shell across viewport/input modes.

- [ ] Write failing Playwright tests for startup, experiment switch, keyboard operation, panic stop, storage failure simulation and reduced-motion preference.
- [ ] Verify expected failures.
- [ ] Implement responsive drawer/bottom sheet/focus states and AudioContext recovery UI.
- [ ] Run Chromium and available Firefox/WebKit smoke tests.
- [ ] Commit `test: harden browser and accessibility behavior`.

### Task 15: Documentation, references and Pages release gate

**Files:**
- Create: `README.md`
- Create/update experiment reference metadata
- Modify workflows/config as required

**Interfaces:**
- Produces public project documentation and deployable Pages output.

- [ ] Add automated registry test asserting every experiment has summary, output guidance and at least one reference.
- [ ] Verify RED if metadata is incomplete.
- [ ] Complete docs/reference metadata and README usage/build/deploy instructions.
- [ ] Run `npm run lint`, `npm run typecheck`, `npm test`, Playwright smoke tests and `npm run build`.
- [ ] Verify Vite base path works for `/Auditory-Illusion-Laboratory/`.
- [ ] Commit `docs: finalize laboratory release documentation`.
