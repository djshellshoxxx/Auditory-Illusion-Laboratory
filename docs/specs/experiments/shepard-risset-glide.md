# Shepard–Risset Continuous Glide — Experiment Specification

Status: implemented to spec (2026-10-02)
Primary reference: Risset, J.-C. (1969/1986) continuous circular pitch; Deutsch, pitch circularity overview https://deutsch.ucsd.edu/pdf/Enc_Perception_Vol1_2009_160-164.pdf

## Audit of the v1 implementation

| Finding | Severity |
|---|---|
| All layer frequencies derived from one shared phase `base·2^(k+phase)`; at phase wrap every layer jumped an octave at once. | High risk / Classic structure |
| Envelope edges were not forced to zero, so the simultaneous wrap could click. | Classic invariant |
| No stereo spread, no scrolling track view. | Incomplete |

## Classic stimulus

- N = 8 sine layers occupying an N-octave band centred on the envelope centre (Classic 900 Hz → 56 Hz … 14.4 kHz).
- Layer k has log-frequency position `x_k(t) = x_low + ((k + s·t·d) mod N)` octaves, with speed s = 0.12 octaves/s and direction d = ±1. All layers are therefore exact octaves apart at every instant, and each layer wraps on its own, 1/s seconds after the previous one; no instant resets the whole bank.
- Gain = fixed Gaussian envelope on log frequency (σ = 1.3 octaves) multiplied by a raised-cosine taper that reaches exactly zero within the outer 0.3 octave of the band, so every wrap happens at zero gain.
- Ascending and descending are exact counterparts (d = ±1).

## Implementation

- `src/experiments/rissetGlide.js`: `rissetGlideState(t, p)` is a pure function of time; the runtime and the track visualizer both read it.
- `src/experiments/rissetGlideRuntime.ts`: one oscillator + gain + panner per layer, driven by audio-clock `exponentialRampToValueAtTime` / `linearRampToValueAtTime` segments scheduled 25 ms at a time by the look-ahead scheduler. In a chunk where a layer wraps, its frequency is set (not ramped) at the chunk start while its gain is zero.
- Lab controls: layers, speed, direction, envelope centre/width, stereo spread, waveform.
- Analysis: scrolling log-frequency tracks computed from the same state function, labelled as generated layer trajectories.
- Response UI: Rising / Falling / Ambiguous.

## Verification (tests/rissetGlide.test.mjs)

- Layers are exact octaves apart at random instants.
- Over one full cycle of N/s seconds the eight wrap instants are all distinct and each wrapping layer has gain 0 on both sides.
- Non-wrapping layers change frequency by exactly 2^(s·dt) between samples (continuity).
- Total gain (sum) stays within ±5 % across the cycle (bounded level).
