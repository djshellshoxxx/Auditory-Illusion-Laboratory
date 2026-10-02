# Tritone Paradox Mapper — Experiment Specification

Status: implemented to spec (2026-10-02)
Primary reference: Deutsch, D. (1991). The tritone paradox: an influence of language on music perception. *Music Perception* 8(4), 335–347. https://doi.org/10.2307/40285517; https://deutsch.ucsd.edu/psychology/pages.php?i=206

## Audit of the v1 implementation

| Finding | Severity |
|---|---|
| Only one pair (rootClass and rootClass+6) alternated endlessly; no trial sequence over pitch classes, so nothing could be mapped. | Fail purpose |
| Responses were the generic buttons and were not keyed to the trial's pitch class; no local map. | Fail purpose |
| 380 ms bursts with 620 ms period rather than 500 ms tones with no gap inside the pair. | Timing |

## Classic stimulus (Deutsch 1991 construction)

- Each tone is an octave complex of six sinusoids related by octaves, amplitudes set by one fixed bell-shaped (Gaussian, σ = 1 octave) spectral envelope on log frequency. Deutsch's published envelope peaks were C4 262 Hz, F#4 370 Hz, C5 523 Hz and F#5 740 Hz; Classic uses 370 Hz and Lab offers all four plus free values.
- Component placement: the lowest component is the member of the tone's pitch class closest to `center · 2^−2.5`, so the six components straddle the envelope peak symmetrically whatever the pitch class.
- Each tone lasts 500 ms with 50 ms raised-cosine ramps; the two tones of a pair follow with no gap.
- The second tone is exactly six semitones (a tritone) above/below the first in pitch class; height is ambiguous by construction.
- A run presents all twelve pitch-class pairs (C–F#, C#–G, … B–F) in a seeded shuffled order; the listener judges each pair Up / Down / Ambiguous. No judgment is scored.

## Implementation

- `src/experiments/tritone.js`: `tritoneTone()`, `tritoneTrialOrder(seed)`, `renderTritonePair()`, `aggregateTritoneResponses(records)`.
- `src/experiments/tritoneRuntime.ts`: renders one pair and plays it once through the engine; the session carries two phases for the visualizer.
- Lab controls: envelope centre, width, components, tone duration, ramp, inter-tone gap, seed/order.
- Response UI: trial counter, Play pair, Up / Down / Ambiguous (each stores `{firstPitchClass, secondPitchClass, judgment, envelopeCenterHz}` and advances, auto-playing the next pair), and a local 12-cell map built from stored reports.

## Verification (tests/tritone.test.mjs)

- Components exact octaves; envelope straddles the centre; pair chroma difference exactly 6.
- Trial order covers all 12 pitch classes exactly once and is seed-deterministic.
- Render: two 500 ms tones with no silent gap at the junction; the second tone's components are 2^(6/12) × the first's (or ÷, whichever lands closest to the envelope).
- Aggregation counts Up/Down/Ambiguous per first pitch class.
