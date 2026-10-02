# Shepard Circular Pitch — Experiment Specification

Status: implemented to spec (2026-10-02)
Primary reference: Shepard, R. N. (1964). Circularity in judgments of relative pitch. *JASA* 36, 2346–2353. https://pubmed.ncbi.nlm.nih.gov/14299356/

## Audit of the v1 implementation

| Finding | Severity |
|---|---|
| Steps were produced by quantizing a global continuous phase inside a bank that shared one octave wrap, so at the B→C wrap the whole bank jumped physically; whether it was audible depended on envelope width. | Classic structure |
| Frequency changes were smoothed with `setTargetAtTime`, i.e. a short glide, not discrete Shepard tones with their own onsets. | Classic structure |
| No explicit pitch-class sequencer; step size, waveform and detune absent; generic responses. | Incomplete |

## Classic stimulus

- Twelve discrete Shepard tones per cycle, one per pitch class, 500 ms each (2 steps/s), 10 ms linear onset/offset ramps, repeated cyclically.
- Each tone is the sum of exactly octave-spaced sinusoids: component k has frequency `base · 2^k` where `base` is the pitch class placed in octave 1 (C1 = 32.70 Hz for C), for k = 0 … N−1 (Classic N = 10, so the bank spans 32.7 Hz to ≈ 16.7 kHz).
- Component amplitudes follow one fixed Gaussian envelope on a log-frequency axis: `w = exp(−½ (log2(f / center) / width)²)`, Classic center 1000 Hz, width 1.35 octaves (σ). The envelope never moves with pitch class.
- Ascending by default (direction +1); descending is the exact reverse order.
- Because the envelope is fixed and the bank spans the whole audible range, the wrap from B to C only re-enters one component at the bottom of the envelope where its weight is < 0.2 % of the peak; the tone-to-tone change at the wrap is the same size as every other semitone step.

## Implementation

- `src/experiments/shepard.js`: `shepardTone(pitchClass, p)` returns the component list; `shepardSequence(p)` the ordered steps; `renderShepardCycle()` renders one full 12-step cycle (6 s) which the runtime loops.
- `src/experiments/shepardRuntime.ts`: loops the rendered buffer; reports one lane event per component with gain for the visualizer.
- Lab controls: start pitch class, direction, step size (semitones), step duration, component count, envelope center and width, waveform (sine/triangle), detune (cents).
- Response UI: Rising / Falling / Ambiguous.

## Verification (tests/shepard.test.mjs)

- Adjacent components in a tone are exactly 2:1.
- Successive tones differ by the configured semitone ratio for the dominant component.
- Envelope centroid (gain-weighted mean of log2 f) is identical for every step within 0.01 octave.
- At the wrap, the maximum gain of any component that is not octave-continuous with the previous tone is < 0.01.
- Render: 12 steps of 500 ms, both channels identical, each step has energy.
