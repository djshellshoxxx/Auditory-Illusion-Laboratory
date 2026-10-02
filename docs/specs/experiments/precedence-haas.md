# Precedence / Haas Explorer — Experiment Specification

Status: to spec (author's branch fix/precedence-haas merged into this work; re-audited 2026-10-02)
Reference: precedence-effect review https://pmc.ncbi.nlm.nih.gov/articles/PMC4310855/

## Classic stimulus
- Identical 1 ms Hann-windowed seeded broadband noise bursts: lead on the left, lag on the right 3 ms later, equal level, repeated every 800 ms.
- Intra-pair delay is set on the audio clock; the 800 ms repetition uses a timer, which only affects the spacing between pairs, not the lead/lag relation.
- Lab: delay 0–40 ms, lead side, source type (noise burst / click / tone pip), burst length, repetition interval, lead-lag level difference.
- Response: one fused / two distinct / uncertain plus perceived location.

## Re-audit (2026-10-02)
- Pass. Added the physical lead/lag lane view.

## Verification
`tests/precedence.test.mjs`.
