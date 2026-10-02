# Glissando Illusion — Experiment Specification

Status: to spec (fixed in commit a42d9ef; re-audited 2026-10-02)
Reference: Deutsch glissando illusion, ASA 2005 https://deutsch.ucsd.edu/asa/asa149th/deutsch.html; Deutsch et al. 2007 https://doi.org/10.1016/j.neuropsychologia.2007.07.012

## Classic stimulus
- Fixed oboe-like tone at 262 Hz (8-harmonic periodic wave) and a sine glissando 131 → 523 → 131 Hz, exponential, 2.5 s per up-and-down cycle.
- The two sounds always occupy opposite channels and exchange sides every 238 ms, scheduled on the audio clock.
- Stereo loudspeakers in a somewhat reverberant room preferred; headphones explicitly less effective.

## Re-audit (2026-10-02)
- Pass: frequencies, cycle, swap interval, simultaneous opposite assignment, oboe-like timbre, Lab controls, trajectory response.
- Added: physical L/R lane view (fixed tone vs glide per 238 ms slot) and dedicated Lab control panel with labelled fields.

## Verification
`tests/glissando.test.mjs`: fixture values, low-high-low cycle, 238 ms opposite-channel exchange, catalog guidance.
