# Octave Illusion — Experiment Specification

Status: implemented to spec (2026-10-02)
Primary reference: Deutsch, D. (1974). An auditory illusion. *Nature* 251, 307–309. https://www.nature.com/articles/251307a0

## Audit of the v1 implementation

| Finding | Severity |
|---|---|
| Each state was a 180 ms tone burst fired from a 250 ms `setInterval`, leaving ~70 ms silent gaps between states. Deutsch's stimulus has no amplitude drop between states. | Classic timing wrong |
| Browser-timer scheduling jittered the L/R swap by several ms; the dichotic pair must be sample-stable. | Classic invariant |
| Bursts faded to ~0 before every transition, so both ears were never continuously stimulated. | Classic invariant |
| No physical L/R lane visual; responses were the generic Rising/Falling buttons. | UI incomplete |

## Classic stimulus

- Two sine tones: 400 Hz and 800 Hz.
- Both ears always receive exactly one tone.
- State A: left 400 Hz, right 800 Hz. State B: left 800 Hz, right 400 Hz.
- States alternate every 250 ms (4 states per second) with no inter-state silence.
- Equal level in both channels; master level conservative.
- Headphones strongly recommended (the effect depends on dichotic presentation).

## Implementation

- `src/experiments/octave.js` builds the state list and renders one phase-continuous loop with `renderCrossfadedDichotic`: each distinct frequency is one continuous oscillator for the whole loop, and each ear crossfades between the 400 Hz and 800 Hz oscillators over 3 ms at each state boundary, so neither ear is ever silent.
- The loop length is the shortest multiple of the two-state cycle (≤ 16 s) at which both frequencies complete whole cycles, so looping is click-free. At 400/800 Hz and 250 ms this is exactly 0.5 s.
- `src/experiments/octaveRuntime.ts` copies the render into an `AudioBuffer` and loops it through the engine bus. Timing is therefore sample-accurate and independent of browser timers.
- Lab controls: low tone, high tone, state duration, interaural level difference, channel swap.
- Response UI: perceived high-tone side, perceived low-tone side, optional description. No answer is scored.
- Visualization: physical left/right event lanes with a cycling playhead, plus the measured output spectrum.

## Verification (tests/octave.test.mjs)

- Classic fixture is exactly 400/800 Hz, 250 ms per state, complementary ears.
- Rendered loop: every 10 ms window of each channel has non-trivial RMS (no silent gaps).
- First 250 ms: left contains 400 Hz and not 800 Hz; right the reverse. Second 250 ms swaps.
- Loop is 0.5 s and sample-continuous at the wrap point.
