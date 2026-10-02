# Infinite Motion — Audit and Specification

Status: rebuilt to spec (2026-10-02)
Governing design: `docs/superpowers/specs/2026-10-01-auditory-illusion-laboratory-design.md` §7; plan `docs/superpowers/plans/2026-10-01-infinite-motion.md`.

Infinite Motion is the experimental instrument. It is not a canonical demonstration, but its own design makes testable promises: circular pitch and tempo that never arrive, independently routable spatial / distance / spectral cues, keyboard and MIDI play, and a Panic that always works.

## Audit of the v1 implementation

| # | Finding | Severity |
|---|---|---|
| 1 | **Pitch was not infinite.** Each lane drove `sin(phase)`, so pitch swung up and back down within one octave, like slow vibrato. The Shepard frame's shared phase would also have jumped the whole bank at a wrap. The instrument's core promise did not hold. | Fail core |
| 2 | **Tempo was not infinite.** One pulse train whose rate swung sinusoidally between 45 and 180 BPM. There were no Risset layers, so nothing ever "kept accelerating". | Fail core |
| 3 | **Lane value meant two things.** Magnitude set both speed and depth, so small values were barely audible and sign only mirrored a sine. The design defines the lane as velocity: −1 descending, 0 static, +1 ascending. | Fail design |
| 4 | **Spatial cues incomplete.** Pan was a sine sweep of a level panner only. There was no interaural time difference (ITD), so the design's "ITD moves left while level moves right" contradiction was impossible. Distance had no reverb send, though the design lists level, high-frequency damping and reverb. | Incomplete |
| 5 | **Panic stopped working after first use.** `AudioEngine.panic()` clears every registered cleanup and then restores the input gain after 80 ms. Infinite Motion registered its cleanup only once, on page mount. After the first Panic, a second Panic briefly muted the voices and then let them sound again. | Bug, safety |
| 6 | **Stuck-note race.** `noteOn` checked for an existing voice before an `await`, so a quick double key press or MIDI retrigger created two voices for one note. Note-off released only one, leaving the other stuck. | Bug |
| 7 | **Stale link state for MIDI CC.** The MIDI handler captured `linked` from an old render, so CC moves ignored the current Unlink setting. | Bug |
| 8 | **"Coherent" was not coherent.** The Coherent Rise preset and Restore Coherent used five different lane values. | Bug |
| 9 | **Timing on requestAnimationFrame.** Modulation and rhythm pulses ran from rAF, which stops in background tabs and jitters with frame rate. | Timing |
| 10 | **No octave shift; decorative orb only.** The plan calls for octave controls and lane visualizations drawn from instrument state. | Incomplete |

## Specification

### Lanes
Every lane is a bipolar **velocity** v ∈ [−1, 1]: sign = direction, magnitude = speed, 0 = static (the lane holds its current position).

| Lane | Motion | Full-scale speed | Circular? |
|---|---|---|---|
| Pitch | Shepard–Risset layers glide | 0.5 octave/s | Yes, endless |
| Tempo | Risset rhythm layers accelerate/decelerate | 0.25 octave/s of tempo | Yes, endless |
| Pan orbit | Azimuth rotates around the head | 0.5 revolution/s | Yes |
| Distance | Approach/recede cycle | 0.25 cycle/s | Periodic |
| Spectrum | Envelope centre sweeps ±1.2 octave | 0.25 cycle/s | Periodic |

### Pitch voice
- 8 sine layers per note, exact octaves, spanning an 8-octave band. Layer k position = (k + pitch-class offset + pitch motion) mod 8. Frequency = band-bottom C × 2^position, so the played key sets the pitch class.
- Gain = Gaussian on position (σ 1.3 octaves) centred at the band middle plus the spectrum shift plus a register shift of 0.6 octave per octave from C4 (clamped ±2), so the key's octave and Z/X octave shift are audible, times a raised-cosine taper to exactly 0 within 0.3 octave of each band edge. Every layer wraps on its own, at zero gain.

### Tempo layer
- 5 click layers at exact 2:1 rates around 90 BPM, positions moving with the tempo lane, gains from the Risset rhythm envelope (reused from `src/experiments/rissetRhythm.js`). Each layer integrates its own beat phase; pulses are emitted at sub-millisecond resolution and started on the audio clock.

### Spatial chain (shared by voices and pulses)
- Azimuth a = sin(2π·orbit). Level cue: equal-power gains. Time cue: the far ear is delayed by up to 0.65 ms (|a|·0.65 ms).
- Distance d = (1 − cos 2π·phase)/2 ∈ [0, 1]: level 1/(1 + 3d), low-pass cutoff 16 kHz × 2^(−3d), reverb send 0.05 + 0.5d into a generated 2 s stereo impulse.

### Scheduling and lifecycle
- One pure, deterministic motion clock (`src/infinite-motion/engine.js`) advances all lanes. A 25 ms timer schedules audio-clock ramps 120 ms ahead in 20 ms chunks. When a layer wraps, its frequency is set, not ramped, while its gain is zero.
- `noteOn` reserves the note synchronously, so duplicates are impossible.
- The instrument registers its stop with the AudioEngine **every time it starts**, so every Panic stops it.
- Keyboard: A W S E D F T G Y H U J K play notes. Z and X shift the octave (range ±3). Keys are ignored while typing in inputs.
- Linked mode sets all five lanes to the same value. Coherent Rise and Restore Coherent are genuinely equal on all lanes.

## Verification
- `tests/infiniteMotion.test.mjs` (pure engine): velocity semantics and static hold; pitch layers are exact octaves and keep the key's pitch class; under variable and reversed speed every layer wraps at gain < 1e-3 and never all at once; tempo layers keep exact 2:1 ratios and emit pulses; ITD within 0.65 ms with the far ear delayed; equal-power level; distance mappings bounded and finite at extreme lane values.
- `tests/e2e/smoke.spec.ts`: playing a key starts a voice; Panic stops it; a second note and a second Panic also stop it; octave shift; the coherent preset is coherent.
