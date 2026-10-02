# Auditory Continuity / Filling-in — Experiment Specification

Status: implemented to spec (2026-10-02)
References: Warren, Obusek & Ackroff (1972) auditory induction; King, A. J. (2007) Filling in the gaps, *Current Biology* 17 R799 https://pmc.ncbi.nlm.nih.gov/articles/PMC7116515/; https://pubmed.ncbi.nlm.nih.gov/18306956/

## Audit of the v1 implementation

| Finding | Severity |
|---|---|
| Only the masked condition existed; the uninterrupted and silent-gap comparisons required by the design were missing. | Fail spec |
| During the gap the target gain was set to 0.00001, not zero: the target was physically present at −100 dB, violating the explicit "physically absent" invariant. | Fail invariant |
| Masker was unseeded white noise with no bandwidth/type control; nothing verified the deletion. | Incomplete |

## Classic stimulus

- Cycle 1.2 s: target on 0–0.45 s, gap 0.45–0.70 s (250 ms), target on 0.70–1.2 s; looped.
- Target: 1000 Hz sine at a moderate level with 5 ms raised-cosine ramps at every edge.
- Three conditions selectable in Classic:
  - A `continuous`: target uninterrupted, no masker.
  - B `silent-gap`: target samples are exactly 0.0 throughout the gap; nothing else.
  - C `masked`: identical to B plus a broadband white-noise masker (seeded, deterministic) occupying exactly the gap, with 5 ms ramps, at a level that masks the target (Classic masker peak 0.45 vs target 0.09).
- The target and masker are rendered as separate arrays and summed only at the end, so the invariant can be asserted on the target array itself.

## Implementation

- `src/experiments/continuity.js`: `continuitySchedule()`, `renderContinuityCycle()` returning `{target, masker, left, right}`.
- `src/experiments/continuityRuntime.ts`: loops the rendered cycle; lane events show target segments and the masker separately.
- Lab controls: condition, target frequency, target level, gap duration, masker type (white / band-pass around the target / notched at the target, the last of which should weaken the illusion), masker level, masker bandwidth (octaves).
- Response UI: Continuous / Interrupted / Uncertain, stored with the condition.

## Verification (tests/continuity.test.mjs)

- Target array is exactly zero for every sample in the gap in conditions B and C, and non-zero in A.
- Masker is non-zero only inside the gap and only in condition C.
- Band-pass and notch maskers have more/less energy at the target frequency than white noise respectively.
