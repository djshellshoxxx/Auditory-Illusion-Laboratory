# Scale Illusion — Experiment Specification

Status: implemented to spec (2026-10-02)
Primary reference: Deutsch, D. (1975). Two-channel listening to musical scales. *JASA* 57, 1156–1160. https://deutsch.ucsd.edu/psychology/pages.php?i=203

## Audit of the v1 implementation

| Finding | Severity |
|---|---|
| Classic rate was 6 positions/s (167 ms); the published stimulus runs 4 positions/s (250 ms). | Classic timing wrong |
| 140 ms bursts inside 167 ms slots left gaps; browser `setInterval` jittered the dichotic pairs. | Classic invariant |
| Equal-tempered MIDI pitches only; the historical frequency set was not offered or documented. | Documentation |
| Generic Rising/Falling responses; no higher/lower-stream side report, no L/R lane visual. | UI incomplete |

## Classic stimulus

- C-major scale over one octave, ascending and descending presented simultaneously.
- Historical frequencies (Deutsch 1975): 259, 290, 326, 345, 388, 435, 488, 517 Hz. Equal-tempered C4–C5 is a documented Lab alternative.
- Eight positions, 250 ms each (4 per second), repeated without pause (2 s loop).
- At each position one ear gets the ascending-scale tone and the other ear the descending-scale tone; the ear assignment alternates every position. Classic starts with the ascending tone in the right ear.
- Equal-amplitude sine tones with 5 ms onset/offset ramps.
- Headphones preferred.

Resulting physical sequences (Classic):
- Right ear: 259 488 326 388 388 326 488 259 (leaping)
- Left ear: 517 290 435 345 345 435 290 517 (leaping)

Commonly reported percept: a smooth higher line (517 488 435 388 | 388 435 488 517) on one side and a smooth lower line (259 290 326 345 | 345 326 290 259) on the other, with right-handers usually hearing the higher line on the right.

## Implementation

- `src/experiments/scale.js`: fixtures, `scaleDichoticEvents()` and `renderScaleLoop()` (uses `renderStereoEvents`).
- `src/experiments/scaleRuntime.ts`: loops the rendered buffer via the engine bus; reports lane events and a 2 s loop to the UI.
- Lab controls: tuning (historical/equal), transposition in semitones (equal-tempered only), position duration, channel swap.
- Response UI: higher-stream side, lower-stream side, number of streams, description.

## Verification (tests/scale.test.mjs)

- Fixture equals the historical set; ascending and descending are exact reverses.
- Every position has exactly one event per ear and ear assignment alternates.
- Each isolated ear leaps (largest interval ≥ 5 semitones) while the combined higher/lower sets are smooth.
- Render: every 250 ms slot has energy in both channels; the right channel at position 0 contains 259 Hz and not 517 Hz.
