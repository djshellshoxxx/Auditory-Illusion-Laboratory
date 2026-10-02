# Combination-Tone Explorer — Experiment Specification

Status: to spec (fixed in commit f154763; re-audited 2026-10-02)
References: Ruggero et al. 1991; Formby & Sachs 1980.

## Classic stimulus
- Exactly two sine primaries, f1 = 700 Hz and f2 = 900 Hz, equal level.
- Predicted products f2−f1 = 200 Hz, 2f1−f2 = 500 Hz, 2f2−f1 = 1100 Hz are calculated and labelled as predictions; they are never synthesized.
- Lab: f1, f2, level, balance, waveform (non-sine flagged as exploratory).

## Re-audit (2026-10-02)
- Pass. An offline render test confirms energy at the primaries and none at the predicted products. Migrated to the panel registry without behaviour change.

## Verification
`tests/combinationTones.test.mjs`.
