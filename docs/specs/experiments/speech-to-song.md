# Speech-to-Song — Experiment Specification

Status: implemented to spec (2026-10-02)
References: Deutsch, Henthorn & Lapidis (2011). Illusory transformation from speech to song. *JASA* 129, 2245–2252; https://deutsch.ucsd.edu/asa/asa156th/deutsch.html

## Audit of the v1 implementation

| Finding | Severity |
|---|---|
| `repetitions` and `interval` were declared but ignored; playback was an `HTMLAudioElement` loop killed by a 12 s timer. | Classic params not honoured |
| The media element bypassed the AudioEngine master / limiter / panic path, so Panic did not stop it. | Architecture violation |
| No Speech / Song-like / Mixed response; no sentence-then-phrase workflow. | Incomplete |

## Classic workflow

1. The listener records a short spoken phrase locally (microphone, explicit button). Optionally they also record the full sentence that contains it. Recordings stay in browser memory as object URLs.
2. Start decodes the phrase once into an `AudioBuffer` and schedules exactly `repetitions` (Classic 10) `AudioBufferSourceNode`s that all reference that same buffer object, each starting `duration + interval` (Classic 0.15 s) after the previous one, through the engine bus. No pitch correction, stretching, filtering or reordering.
3. Optional: play the full sentence once, before and after the repetitions, to hear the carry-over.
4. Response: Speech-like / Song-like / Mixed, with the repetition number at which it changed.

## Implementation

- `src/experiments/speechToSong.js`: `repetitionSchedule(duration, p)` and `scheduleRepetitions(ctx, bus, buffer, p, startAt)` (pure JS so a fake context can test it).
- `src/experiments/speechToSongRuntime.ts`: fetches/decodes the recording and calls the scheduler; cleanup stops every source, so Panic and Stop end the repetition.
- Recording controls live in the always-visible analysis panel so they work in Classic mode.
- Lab controls: repetitions, interval.

## Verification (tests/speechToSong.test.mjs)

- Schedule has exactly N entries spaced by duration + interval.
- With a fake context, every scheduled source uses the identical buffer object, start times match, and cleanup stops all sources.
- Catalog documents the unchanged-buffer invariant.
