# Missing Fundamental — Experiment Specification

Status: to spec (fixed in commit bcdf0a7; re-audited 2026-10-02)
References: Oxenham 2023 https://pmc.ncbi.nlm.nih.gov/articles/PMC9868815/; Cedolin & Delgutte 2010.

## Classic stimulus
- f0 = 110 Hz reference, never synthesized. Harmonics 2–8 (220–880 Hz) as individual sine oscillators, 6 dB/octave rolloff, aligned phase, 20 ms fade-in.
- Lab: f0, first/last harmonic (Nyquist-guarded), rolloff, phase mode (aligned / alternating / seeded random).
- Response: perceived pitch in Hz; the f0 is shown as a reference, not a scored answer.

## Re-audit (2026-10-02)
- Pass on every spec item. Migrated to the panel registry without behaviour change.

## Verification
`tests/missingFundamental.test.mjs`: harmonic set omits f0, finite gains in all phase modes, Nyquist-safe normalisation, catalog text.
