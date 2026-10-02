# Auditory Stream Segregation (ABA_) — Experiment Specification

Status: implemented to spec (2026-10-02)
References: van Noorden (1975) temporal coherence boundary; Bregman (1990) *Auditory Scene Analysis*; streaming review https://www.frontiersin.org/journals/neuroscience/articles/10.3389/fnins.2014.00064/full

## Audit of the v1 implementation

| Finding | Severity |
|---|---|
| Events fired from `setInterval`; the silent slot was implemented as "skip this tick", so timing jittered and was never exactly periodic. | Timing |
| Only A/B frequency and rate; no timbre, stereo or level difference controls required for Lab. | Incomplete |
| Responses were generic; no Switching option and no boundary map. | Incomplete |

## Classic stimulus

- Repeating A B A _ pattern: four equal slots of 120 ms (8.33 events/s, 480 ms per cycle); the fourth slot is exactly silent.
- Each tone lasts 50 ms with 8 ms raised-cosine ramps, starting at its slot onset.
- A = 440 Hz, B = 6 semitones above (622.25 Hz); both sine, equal level, centred. This region (Δf ≈ 6 semitones at ~120 ms onset spacing) sits between van Noorden's fission and temporal-coherence boundaries, so perception is bistable.
- Rendered offline as one 480 ms cycle and looped sample-accurately.

## Implementation

- `src/experiments/streaming.js`: `streamingEvents()`, `renderStreamingCycle()`, `streamingBoundaryPoints(records)`.
- `src/experiments/streamingRuntime.ts`: loops the rendered buffer; lane events for the visualizer.
- Lab controls: A frequency, separation (semitones), slot duration, tone duration, B timbre (sine/triangle/square), stereo separation (A left / B right amount), level difference (dB).
- Response UI: One stream (galloping) / Two streams / Switching; a local boundary map plots stored reports on a separation × slot-duration plane.

## Verification (tests/streaming.test.mjs)

- Event list is exactly A B A rest with equal slot times; rest slot renders to exactly zero samples.
- Δf and slot duration are independently controllable.
- Render: tones occupy their slots, B frequency = A · 2^(6/12).
- Boundary-point mapping extracts (separation, slot, response) from records.
