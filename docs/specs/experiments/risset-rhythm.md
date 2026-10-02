# Risset Rhythm — Experiment Specification

Status: implemented to spec (2026-10-02)
References: Risset, J.-C. (1986) rhythmic paradoxes; Stowell, D. (2011) scheduling Risset rhythms; barber-pole tempo work https://doi.org/10.1080/17459737.2021.2001699

## Audit of the v1 implementation

| Finding | Severity |
|---|---|
| All layer rates derived from one shared phase, so every layer reset at the same instant. | High risk / Classic structure |
| `density` existed in Classic params but was never used; pulse timbre and stereo spread absent. | Incomplete |
| Pulses fired from a 20 ms `setInterval` accumulator, so pulse timing jittered with the browser timer. | Timing |

## Classic stimulus

- N = 5 pulse layers whose instantaneous rates are `root · 2^(position − (N−1)/2)` BPM with positions `(k + s·t·d) mod N`; neighbouring layers are therefore exactly 2:1 at every instant (root 90 BPM → 22.5, 45, 90, 180, 360 BPM at t = 0).
- Speed s = 0.1 octaves/s (tempo doubles every 10 s); direction +1 = accelerating, −1 = decelerating. Cycle = N/s = 50 s.
- Layer gain = fixed Gaussian on log-rate (σ = 1.15 octaves) with a raised-cosine taper to exactly zero over the outer 0.3 octave, so each layer wraps silently and independently, 1/s = 10 s after the previous one.
- Pulse: identical 8 ms Hann-windowed broadband click for every layer (Classic), centred; density 1 (every beat sounds).
- Pulse times are the instants where each layer's beat phase `φ_k(t) = ∫ r_k(τ)/60 dτ` crosses an integer, integrated deterministically at 0.25 ms resolution.

## Implementation

- `src/experiments/rissetRhythm.js`: `rissetRhythmState(t, p)`, `createRissetRhythmSequencer(p)` (stateful, deterministic, `pulsesUntil(t)`), pulse mask for density.
- `src/experiments/rissetRhythmRuntime.ts`: look-ahead scheduler pulls pulses from the sequencer and starts one `AudioBufferSourceNode` per pulse at its exact audio-clock time with the layer gain at that time.
- Lab controls: root BPM, layers, speed, direction, density, pulse timbre (click / tick / pitched), stereo spread.
- Analysis: pulse raster (last 8 s) drawn from the same sequencer.
- Response UI: Accelerating endlessly / Decelerating endlessly / Ambiguous.

## Verification (tests/rissetRhythm.test.mjs)

- Neighbouring rates exactly 2:1 at random instants; wrap instants distinct and at zero gain.
- Pulse intervals of a layer shrink monotonically (accelerating) between its wraps and match 60/rate within 1 %.
- Density 0.5 removes about half the pulses deterministically; density 1 keeps all.
