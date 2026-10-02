# Infinite Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Infinite Motion instrument on top of the verified Laboratory DSP/audio infrastructure, combining cyclic pitch, cyclic rhythm, spatial, distance and spectral motion with keyboard/MIDI playability and intentionally contradictory cue routing.

**Architecture:** Infinite Motion consumes the same AudioEngine and tested circular-pitch/rhythm primitives as the Laboratory. A small motion-lane model converts normalized phase/velocity into smoothed Web Audio parameters; a contradiction matrix lets normally coupled cues run independently. UI input is translated into instrument state and never manipulates raw AudioNodes directly.

**Tech Stack:** Existing Vite/React/TypeScript/Web Audio stack, Web MIDI progressive enhancement, Canvas 2D visualizations, Vitest and Playwright.

**Spec:** `docs/superpowers/specs/2026-10-01-auditory-illusion-laboratory-design.md`

## Global Constraints

- Reuse tested Laboratory DSP primitives; do not duplicate Shepard/Risset implementations.
- Every continuously changed frequency/gain/delay/filter parameter is smoothed.
- Contradictory cues are labeled experimental and are not presented as canonical research demonstrations.
- Keyboard input must work without MIDI hardware; Web MIDI remains optional.
- Presets and MIDI mappings are local-only.
- Panic stop must stop all voices, schedulers and held notes.

## Review Focus

- MIDI devices disconnecting while notes are held cannot leave stuck voices.
- Rapid preset changes crossfade/smooth rather than create clicks or runaway automation queues.
- Opposed cue values remain finite and clamped even at maximum lane speeds.
- Keyboard shortcuts do not fire while typing into text/number inputs.
- Browsers without Web MIDI still expose the complete keyboard/pointer instrument.

---

### Task 1: Infinite Motion state model and navigation

**Files:**
- Create: `src/infinite-motion/types.ts`
- Create: `src/infinite-motion/state.ts`
- Create: `src/infinite-motion/InfiniteMotionPage.tsx`
- Modify: `src/App.tsx`
- Test: state and navigation tests

**Interfaces:**
- Produces `MotionLane`, `MotionScene`, `InstrumentState`, normalized lane values and top-level product switch.

- [ ] Write failing tests for normalized/clamped lane values, default scene and Laboratory/Infinite Motion navigation.
- [ ] Verify RED.
- [ ] Implement model and page shell.
- [ ] Verify suite.
- [ ] Commit `feat: add Infinite Motion state and workspace`.

### Task 2: Cyclic motion engine

**Files:**
- Create: `src/infinite-motion/MotionClock.ts`
- Create: `src/infinite-motion/modulation.ts`
- Test: deterministic phase/velocity tests

**Interfaces:**
- Produces deterministic `advance(dt)` lane phases and mapping helpers for bipolar/unipolar modulation.

- [ ] Write failing tests for phase wrapping, negative direction, zero/static mode and extreme `dt` handling.
- [ ] Verify RED.
- [ ] Implement pure clock/modulation functions.
- [ ] Verify suite.
- [ ] Commit `feat: add deterministic cyclic motion engine`.

### Task 3: Infinite pitch voice

**Files:**
- Create: `src/infinite-motion/audio/InfinitePitchVoice.ts`
- Test: voice graph/offline-render tests

**Interfaces:**
- Consumes tested Shepard bank helpers and `AudioEngine` input bus.
- Produces note-aware circular pitch voice with direction/rate/depth controls.

- [ ] Write failing tests proving octave-spaced layers remain valid while note root changes and all automated values remain finite.
- [ ] Verify RED.
- [ ] Implement voice using shared Shepard primitives.
- [ ] Verify suite.
- [ ] Commit `feat: add playable circular pitch voice`.

### Task 4: Infinite tempo layer

**Files:**
- Create: `src/infinite-motion/audio/InfiniteRhythm.ts`
- Test: scheduler tests

**Interfaces:**
- Consumes shared Risset rhythm layer math; produces tempo-motion pulse bus synchronized to MotionClock.

- [ ] Write failing tests for layer ratios, forward/backward cycling and smooth wrap weights.
- [ ] Verify RED.
- [ ] Implement reusable rhythm bus.
- [ ] Verify suite.
- [ ] Commit `feat: add circular tempo layer`.

### Task 5: Spatial, distance and spectral cue engine

**Files:**
- Create: `src/infinite-motion/audio/CueEngine.ts`
- Test: mapping tests

**Interfaces:**
- Produces independently addressable ITD-like delay, level pan, distance gain/damping/reverb-send, spectral center/tilt parameters.

- [ ] Write failing tests for cue mapping ranges and opposed cue combinations.
- [ ] Verify RED.
- [ ] Implement cue engine with smoothed AudioParams and bounded delay/filter ranges.
- [ ] Verify suite.
- [ ] Commit `feat: add spatial distance and spectral cue engine`.

### Task 6: Perceptual Contradiction Matrix

**Files:**
- Create: `src/infinite-motion/ContradictionMatrix.tsx`
- Create: `src/infinite-motion/routing.ts`
- Test: routing/UI tests

**Interfaces:**
- Produces link/unlink routing between pitch, tempo, level, delay, filter and reverb motion lanes.

- [ ] Write failing tests for linked defaults, independent unlinked values and restore-to-coherent action.
- [ ] Verify RED.
- [ ] Implement matrix and route labels that clearly mark experimental cue conflicts.
- [ ] Verify suite.
- [ ] Commit `feat: add perceptual contradiction matrix`.

### Task 7: Computer keyboard instrument

**Files:**
- Create: `src/infinite-motion/input/KeyboardInput.ts`
- Create: `src/infinite-motion/components/KeyboardGuide.tsx`
- Test: key mapping/focus tests

**Interfaces:**
- Produces noteOn/noteOff events using documented QWERTY piano layout plus octave controls and hold mode.

- [ ] Write failing tests for mapping, repeat suppression, input-field exclusion and octave bounds.
- [ ] Verify RED.
- [ ] Implement keyboard input and guide.
- [ ] Verify suite.
- [ ] Commit `feat: add computer keyboard performance input`.

### Task 8: Web MIDI and MIDI learn

**Files:**
- Create: `src/infinite-motion/input/MidiManager.ts`
- Create: `src/infinite-motion/input/MidiLearn.ts`
- Create: `src/infinite-motion/components/MidiPanel.tsx`
- Test: parser/mapping tests with fake MIDI messages

**Interfaces:**
- Produces note/CC events, connection status and local CC-to-macro mappings.

- [ ] Write failing tests for note on/off, zero-velocity note-on, CC parsing, device disconnect cleanup and unavailable Web MIDI.
- [ ] Verify RED.
- [ ] Implement progressive-enhancement MIDI manager and learn mapping.
- [ ] Verify suite.
- [ ] Commit `feat: add Web MIDI and MIDI learn`.

### Task 9: XY macro and motion visualization

**Files:**
- Create: `src/infinite-motion/components/MotionField.tsx`
- Create: `src/infinite-motion/components/MotionLanes.tsx`
- Test: pointer/keyboard accessibility tests

**Interfaces:**
- Produces XY macro values and visual traces from instrument state only.

- [ ] Write failing tests for pointer clamping and keyboard-adjustable XY control.
- [ ] Verify RED.
- [ ] Implement Canvas motion field and lane strips with reduced-motion behavior.
- [ ] Verify suite.
- [ ] Commit `feat: add motion field performance UI`.

### Task 10: Presets, local persistence and scene crossfades

**Files:**
- Create: `src/infinite-motion/presets.ts`
- Create: `src/infinite-motion/PresetStore.ts`
- Test: serialization/migration/crossfade scheduling tests

**Interfaces:**
- Produces factory scenes, user scenes, versioned local serialization and `applyScene(scene)` smoothing/crossfade behavior.

- [ ] Write failing tests for round-trip serialization, corrupt-data fallback and bounded scene transition time.
- [ ] Verify RED.
- [ ] Implement presets/store and scene transitions.
- [ ] Verify suite.
- [ ] Commit `feat: add Infinite Motion presets and scene transitions`.

### Task 11: Integration and panic-stop hardening

**Files:**
- Modify Infinite Motion audio/page/input modules
- Add Playwright tests under `tests/e2e/infinite-motion.spec.ts`

**Interfaces:**
- Verifies full instrument lifecycle.

- [ ] Write failing browser tests for keyboard note, hold mode, product switch during playback, preset change and panic stop.
- [ ] Verify failures.
- [ ] Fix lifecycle ownership so navigation/panic disconnect all audio and input state.
- [ ] Run full unit/e2e/build gates.
- [ ] Commit `test: harden Infinite Motion lifecycle`.

### Task 12: Documentation and release integration

**Files:**
- Modify: `README.md`
- Create: `docs/infinite-motion.md`
- Modify reference/about UI

**Interfaces:**
- Produces user-facing explanation of canonical Laboratory vs experimental Infinite Motion behavior.

- [ ] Add documentation checks/manual release checklist for keyboard map, MIDI progressive enhancement, cue labels and limitations.
- [ ] Complete docs and screenshots only after behavior is verified.
- [ ] Run full lint/typecheck/unit/e2e/build suite and Pages base-path smoke test.
- [ ] Commit `docs: document Infinite Motion instrument`.
