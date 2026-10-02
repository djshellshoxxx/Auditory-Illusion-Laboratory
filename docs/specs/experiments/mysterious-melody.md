# Mysterious Melody — Experiment Specification

Status: implemented to spec (2026-10-02)
References: Deutsch, D. (1972). Octave generalization and tune recognition. *Perception & Psychophysics* 11, 411–412; https://deutsch.ucsd.edu/psychology/pages.php?i=207

## Audit of the v1 implementation

| Finding | Severity |
|---|---|
| Only one hard-coded note list without durations; rhythm was not modelled. | Incomplete |
| `reveal` reduced the random octave depth instead of presenting the melody in its original register, so "reveal" was a different, less scrambled random version rather than the reference tune. | Classic structure |
| No Recognized / Not recognized response; no user melody input; the scramble allowed consecutive notes in the same octave. | Incomplete |

## Classic stimulus (Deutsch 1972)

- Familiar public-domain melody: *Yankee Doodle* (Classic), with note order, pitch class, rhythm and durations preserved.
- Scrambled condition: each note is placed haphazardly in one of three octaves (the original octave, one above, one below) by a seeded generator, with the constraint from the 1972 study that no two successive notes fall in the same octave.
- Reveal condition: the identical melody in its normal compact register.
- Replaying the scrambled condition with the same seed reproduces exactly the same octave assignment, so listeners can re-hear the very same stimulus after the reveal.
- Tones: sine plus a quiet second harmonic, 10 ms ramps, 120 BPM; played once, not looped.

## Implementation

- `src/experiments/mysteriousMelody.js`: melody library (Yankee Doodle, Twinkle Twinkle, Ode to Joy, Happy Birthday-free alternative "Frère Jacques"), note-name/duration parser for user melodies, `mysteriousMelodyNotes()`, `renderMysteriousMelody()`.
- `src/experiments/mysteriousMelodyRuntime.ts`: plays the rendered buffer once; lane events show each note.
- Lab controls: melody, user melody text (`C4:1 D4:0.5 …`), seed, octave span, tempo, condition.
- Response UI: Play scrambled / Play original (reveal) / Replay the same scrambled; Recognized / Not recognized plus a guess field.

## Verification (tests/mysteriousMelody.test.mjs)

- Every scrambled note has the pitch class of its source note; only the octave changes, within ±1 octave.
- No two successive scrambled notes share an octave.
- Same seed → identical sequence; different seed → different.
- Reveal reproduces the source MIDI numbers exactly; durations are preserved in both conditions.
