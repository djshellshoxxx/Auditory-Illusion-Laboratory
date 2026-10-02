# Phantom Words — Experiment Specification

Status: to spec (fixed in commit 036906d; re-audited 2026-10-02)
Reference: Deutsch phantom words https://deutsch.ucsd.edu/psychology/pages.php?i=211

## Classic stimulus
- Two real recorded speech tokens ("no", "way"; bundled 8 kHz WAV) repeated as a two-token sequence on both channels, the right channel offset by exactly one token period (0.4 s), 24 cycles.
- Loudspeakers preferred; headphones explicitly less effective.
- Lab: upload or record either token, token period, offset, repeat count, channel swap.
- Response: free text for left, right and centre/other.

## Re-audit (2026-10-02)
- Pass. Migrated the token recorder and report fields into the panel registry; recording-state button now re-renders correctly.

## Verification
`tests/phantom-words.test.mjs`.
