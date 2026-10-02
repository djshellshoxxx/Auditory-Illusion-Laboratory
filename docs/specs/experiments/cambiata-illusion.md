# Cambiata Illusion — Experiment Specification

Status: implemented as a labelled structural reconstruction (2026-10-02). The exact note transcription of the official 2003 recording still needs to be confirmed by ear against https://deutsch.ucsd.edu/psychology/pages.php?i=208 and entered into the Lab figure fields / `CAMBIATA_CLASSIC`.
Primary reference: Deutsch, D. (2003). *Phantom Words and Other Curiosities* (CD), "Cambiata Illusion"; Deutsch, *Psychology of Music* 3rd ed., grouping chapter.

## Audit of the v1 implementation

| Finding | Severity |
|---|---|
| Runtime used an invented four-pair sequence around A4 with ±5/±7 semitone offsets; it was not a cambiata pattern and did not regroup into two three-tone figures. | Fail Classic |
| 140 ms bursts in 200 ms timer slots; no sample-stable dichotic timing. | Classic invariant |
| No fixture, no test, generic responses. | Missing |

## Published description (what any faithful version must satisfy)

- Two repeating patterns of tones, one to each ear. The tones in each ear's pattern vary markedly in pitch (they leap).
- Many listeners instead hear two melodies formed by tones close in pitch: a higher repeating "cambiata figure" and a lower repeating cambiata figure, each of three tones, usually on opposite sides. Right-handers mostly hear the higher figure on the right.
- Some listeners hear the higher tones in one ear, higher tones separated by pauses in the other, plus a lower melody.
- Reversing the earphones usually does not move the perceived higher melody.

## Reconstructed Classic stimulus

- Higher cambiata figure: G5 E5 F5 (784, 659, 698 Hz). Lower cambiata figure: D4 B3 C4 (294, 247, 262 Hz). Each is a nota-cambiata shape: a leap of a third followed by a step back.
- At each 250 ms position one tone of the higher figure and the simultaneous tone of the lower figure sound in opposite ears, and the ear assignment alternates every position (exactly the Scale Illusion principle). Because a figure has three tones, the cycle is six positions (1.5 s) so alternation stays continuous.
- Resulting physical sequences: right ear G5 B3 F5 D4 E5 C4; left ear D4 E5 C4 G5 B3 F5 (each leaps by 17–22 semitones on every tone).
- Equal-amplitude sine tones, 5 ms ramps, headphones.

This reproduces every structural property in the published description. It is **not** an audio-verified transcription of the recording, and the UI says so. Lab mode lets the two figures be typed as note names (e.g. `G5 E5 F5`) so the official pattern can be entered once confirmed.

## Implementation

- `src/experiments/cambiata.js`: note-name parser, `CAMBIATA_CLASSIC`, `cambiataDichoticEvents()`, `renderCambiataLoop()`.
- `src/experiments/cambiataRuntime.ts`: loops the rendered buffer via the engine.
- Lab controls: higher figure, lower figure (note names), transpose, position duration, channel swap.
- Response UI: stream count, higher-figure side, lower-figure side, description.

## Verification (tests/cambiata.test.mjs)

- Snapshot of the committed fixture (figures and per-ear sequences).
- Each isolated ear leaps ≥ 12 semitones somewhere in its sequence.
- The combined tone set at every position contains one tone from each figure; each figure moves by ≤ 4 semitones.
- Render has both ears active at every position; the note parser rejects malformed input.
