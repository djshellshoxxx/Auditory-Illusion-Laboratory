# Chromatic Illusion — Experiment Specification

Status: implemented to spec (2026-10-02)
Primary reference: Deutsch, D. Chromatic illusion. https://deutsch.ucsd.edu/psychology/pages.php?i=204 (variant of the Scale Illusion, Deutsch 1975)

## Audit of the v1 implementation

| Finding | Severity |
|---|---|
| Only a one-octave (12-tone) chromatic set; the published Classic version spans two octaves. | Fail Classic |
| Rate was 6 positions/s with 140 ms bursts (gaps), scheduled by browser timer. | Classic timing wrong |
| No one-octave vs two-octave choice, no per-ear analysis, generic responses. | UI incomplete |

## Classic stimulus

- Chromatic scale spanning two octaves, C4 to C6 (25 equal-tempered tones), ascending and descending simultaneously.
- 250 ms per position, no gaps, repeated continuously. Because 25 is odd, the renderer builds two consecutive cycles (50 positions, 12.5 s) so ear alternation stays strictly continuous across the loop point.
- Ear assignment alternates every position; Classic starts with the ascending tone in the right ear.
- Equal-amplitude sine tones, 5 ms ramps. Headphones preferred.

Expected percept: a smooth higher line that descends from C6 to the middle and returns, and a smooth lower line that ascends from C4 to the middle and returns, usually lateralized to opposite sides, even though each ear physically leaps on every tone.

## Implementation

- `src/experiments/chromatic.js`: pitch set, `chromaticDichoticEvents()` (two cycles), `renderChromaticLoop()`.
- `src/experiments/chromaticRuntime.ts`: loops the rendered buffer through the engine bus; lane events and loop length reported to the UI.
- Lab controls: span (1 or 2 octaves), transposition, position duration, channel swap.
- Response UI: higher-line side, lower-line side, stream count, description.

## Verification (tests/chromatic.test.mjs)

- Classic pitch set is exactly MIDI 60–84 (25 tones); descending is the exact reverse.
- Each position has one tone per ear; ears alternate across the full two-cycle render including the cycle boundary.
- Isolated ears leap (≥ 10 semitones somewhere) while the regrouped lines move by one semitone.
- Render has energy in both ears at every position and the correct tone in the right ear at position 0.
