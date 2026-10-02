# Auditory Illusion Laboratory + Infinite Motion Design

Date: 2026-10-01
Status: Approved conversational design, formal written specification pending user review

## 1. Product goal

Build a browser-based psychoacoustic laboratory and experimental instrument that lets users hear established auditory illusions accurately, explore the parameter regions where those illusions appear or break down, and reuse the same DSP primitives in an Infinite Motion instrument built around cyclic pitch, cyclic rhythm, spatial motion and contradictory perceptual cues.

The application is educational, exploratory and musical. It must distinguish generated signal content from predicted or listener-reported percepts and must not make medical or therapeutic claims.

## 2. Product surfaces

The site has two top-level experiences.

### 2.1 Auditory Illusion Laboratory

A catalog of self-contained experiments. Every supported experiment exposes:
- a short explanation of the physical stimulus;
- a concise explanation of the commonly reported percept;
- a CLASSIC mode that uses a research-grounded reference stimulus;
- a LAB mode that exposes additional parameters;
- Start/Stop controls and click-free transitions;
- Reset to reference values;
- physical signal visualization;
- relevant user-perception response controls;
- citations / references;
- headphone, stereo-speaker or room-dependence guidance when materially relevant.

### 2.2 Infinite Motion

A playable sound-design surface that composes the same tested primitives into cyclic and contradictory auditory motion. It is not presented as a canonical experiment. Users can synchronize or oppose pitch, tempo, space, distance and spectrum trajectories.

## 3. Version 1 experiment catalog

### 3.1 Shepard circular pitch
Classic: octave-spaced tone bank under a smooth fixed spectral envelope with pitch-class stepping.
Lab parameters: base pitch class, direction, step size, rate, partial count, spectral-envelope center/width, waveform, detune.
Responses: rising / falling / ambiguous.
Visualization: pitch helix + active partial spectrum.

### 3.2 Shepard–Risset glide
Classic: continuous octave-spaced glides under cyclic spectral weighting.
Lab parameters: glide speed, direction, partial count, envelope center/width, stereo spread.
Visualization: scrolling log-frequency bands.

### 3.3 Risset rhythm
Classic: rate-related pulse layers with cyclic gain weighting to create continuous acceleration or deceleration.
Lab parameters: root BPM, layer count, direction, pulse timbre, density, stereo spread.
Visualization: concentric rotating tempo rings.

### 3.4 Octave illusion
Classic: high/low octave-related tones alternate between channels using the established stereo alternation structure.
Lab parameters: base frequency, octave ratio, alternation rate, level difference.
Responses: perceived high side, low side, pattern description.
Visualization: physical L/R event lane distinct from response overlay.

### 3.5 Scale illusion
Classic: ascending and descending scales presented with alternating interaural assignments.
Lab parameters: scale root, tempo, register, scale set.
Responses: perceived stream direction and side.

### 3.6 Chromatic illusion
Classic: chromatic patterns with crossed ear assignment producing perceptual regrouping.
Lab parameters: register, rate, start note.
Responses: perceived high/low stream side.

### 3.7 Cambiata illusion
Classic: crossed stereo tone pattern based on Deutsch's described stimulus family.
Lab parameters: pitch center, tempo, transposition, channel swap.
Responses: perceived number and location of streams.

### 3.8 Tritone paradox mapper
Classic: pairs of octave-ambiguous Shepard-class tones separated by six semitones.
Lab parameters: spectral-envelope center/width, trial sequence, pitch-class subset.
Responses: UP / DOWN / AMBIGUOUS.
Output: local pitch-class response map; no right/wrong scoring.

### 3.9 Glissando illusion
Classic: fixed-pitch timbral tone plus gliding tone with alternating channel presentation.
Lab parameters: glide range/rate, fixed tone pitch/timbre, stereo pattern.
Responses: perceived trajectory.
Guidance: identify room/loudspeaker dependence where applicable.

### 3.10 Auditory stream segregation
Classic: ABA_ pattern with controllable A/B separation and event rate.
Lab parameters: pitch separation, tempo, timbre difference, stereo difference, level difference.
Responses: ONE STREAM / TWO STREAMS / SWITCHING.
Output: user-specific boundary map.

### 3.11 Continuity / filling-in
Classic comparisons: uninterrupted target; silent-gap target; physically absent target masked by noise.
Lab parameters: target frequency or source, gap duration, masker type/level/bandwidth.
Responses: continuous / interrupted / uncertain.
Visualization: explicit waveform showing the target absent during the masked gap.

### 3.12 Zwicker phantom tone
Classic: notched broadband-noise inducer followed by silence.
Lab parameters: notch center, notch width, noise bandwidth, duration, level.
Responses: TONE HEARD / NOT HEARD plus optional estimated pitch.
Invariant: output is digitally silent after inducer stop except for deliberate UI-independent fades ending before the report period.

### 3.13 Missing fundamental
Classic: harmonic series omitting the selected fundamental.
Lab parameters: f0, first present harmonic, final harmonic, harmonic amplitudes, phase mode.
Visualization: generated spectrum must clearly mark missing f0.
Responses: perceived pitch estimate.

### 3.14 Combination-tone explorer
Classic: two pure primary tones only.
Lab parameters: f1, f2, level balance, waveform (sine default; non-sine modes labeled as unsuitable for clean product demonstration).
Analysis: predicted f2-f1, 2f1-f2, 2f2-f1 and selected higher-order products shown separately from measured FFT bins.
Invariant: the app must not synthesize predicted auditory products in classic mode.

### 3.15 Precedence / Haas explorer
Classic: one source duplicated to opposite stereo sides with sub-echo-range delay.
Lab parameters: delay, side order, source type, interaural level difference.
Responses: ONE / WIDE / TWO EVENTS and perceived location.

### 3.16 Speech-to-song
Classic: user records a short phrase; playback repeats the same unchanged buffer.
Lab parameters: repetition count, interval, optional loop segmentation only after classic demonstration.
Invariant: classic mode does not pitch-correct, time-stretch or melodically transform the recording.

### 3.17 Phantom words
Classic: repeated syllabic fragments distributed/offset across stereo channels.
Lab parameters: syllables, offsets, repetition rate, channel assignment.
Responses: free-text listener report stored locally.

### 3.18 Mysterious melody
Classic: melody pitch classes retained while octave placement is scrambled.
Lab parameters: scramble depth, reveal amount, tempo, melody source from bundled public-domain/simple patterns or user-entered note data.
Responses: recognized / not recognized.

## 4. Shared audio architecture

### 4.1 AudioEngine
A single AudioContext lifecycle manager owns the master chain and active experiment graph. Browser autoplay restrictions are handled by requiring explicit user activation.

Master path:
`experiment graph -> safety gain -> dynamics limiter/compressor -> analyser -> destination`

Requirements:
- no experiment connects directly to destination;
- start/stop gain ramps prevent clicks;
- global panic/stop immediately schedules a short ramp to silence and disconnect cleanup;
- one active experiment/instrument scene by default;
- master level starts conservatively;
- limiter settings are fixed and documented.

### 4.2 DSP primitives
UI-independent modules provide:
- equal-tempered frequency conversion;
- Shepard partial generation and Gaussian/log-frequency weighting;
- cyclic phase helpers;
- pulse/rhythm layer scheduling;
- stereo channel event scheduling;
- white / filtered / notched noise generation;
- harmonic-complex generation;
- short-window FFT/spectrum analysis helpers;
- click-free envelope helpers;
- delay and spatial utility functions.

Use native AudioNode graphs when sufficient. Use AudioWorklet for processing that benefits from sample-accurate custom generation or deterministic continuously cycling DSP.

### 4.3 Offline verification
OfflineAudioContext and/or pure numerical unit tests verify generated output. Tests must be able to assert frequency ratios, channel assignment, omission of fundamentals, digital silence intervals, and absence of deliberately unsynthesized combination products within practical FFT tolerance.

## 5. Experiment module interface

Each experiment implements a common descriptor and controller contract.

```ts
export type PlaybackMode = 'classic' | 'lab';

export interface ExperimentDescriptor {
  id: string;
  name: string;
  category: string;
  summary: string;
  outputGuidance: 'headphones' | 'stereo-speakers' | 'either' | 'room-dependent';
  references: { label: string; url: string }[];
}

export interface ExperimentController<P, R = unknown> {
  readonly descriptor: ExperimentDescriptor;
  defaultParams(mode: PlaybackMode): P;
  validateParams(params: P): P;
  start(engine: AudioEngine, params: P, mode: PlaybackMode): Promise<void>;
  stop(): Promise<void>;
  report?(response: R, params: P): void;
}
```

Parameter state lives in application state, not inside UI widgets. Experiments own only their current audio graph and experiment-specific state.

## 6. Perception recorder

All reports stay in local browser storage by default.

Record shape:
```ts
export interface PerceptionRecord {
  experimentId: string;
  timestamp: number;
  mode: PlaybackMode;
  params: Record<string, unknown>;
  response: unknown;
}
```

Requirements:
- clear-all-local-data control;
- export JSON control;
- no account, telemetry or server upload in v1;
- experiments may aggregate records into local visual maps.

## 7. Infinite Motion specification

### 7.1 Motion dimensions
The instrument exposes independent normalized motion lanes:
- Pitch circularity: -1 descending through 0 static to +1 ascending.
- Tempo circularity: same directional convention.
- Stereo orbit: angular velocity and orbit depth.
- Apparent distance: near/far macro translated into level, high-frequency damping and reverb-send changes.
- Spectral motion: envelope center/tilt rotation.
- Stream density: one coherent object through multiple separated layers.

### 7.2 Perceptual Contradiction Matrix
Users can unlink lanes so auditory cues disagree. Examples:
- pitch rises while spectral centroid falls;
- level increases while reverb send increases;
- interaural time cues move left while level cues move right;
- pitch acceleration and tempo deceleration run simultaneously.

The interface must label these as experimental cue conflicts rather than canonical psychoacoustic effects.

### 7.3 Playability
- Computer keyboard note triggering using a documented layout.
- Web MIDI input when permission/browser support exists.
- Pointer controls for XY macro surface.
- Presets stored locally.
- MIDI learn for exposed macro controls.
- Sustain/hold mode for drone use.

### 7.4 Musical safety
Parameter smoothing is mandatory for all continuously modulated gain, frequency, delay and filter controls. Scene changes crossfade rather than rebuilding audible graphs abruptly.

## 8. UI / visual design

Visual direction: Circuit Drift Labs technical-laboratory aesthetic, dark background with bright signal-derived accents. Avoid decorative animation unrelated to signal state.

Desktop layout:
- top bar: product switch, audio status, master level, panic stop;
- left rail: categorized experiment browser;
- center: main experiment/instrument visualization;
- right panel: Classic/Lab parameters and explanation;
- bottom panel: transport, perception-response controls and compact signal meters.

Mobile/tablet:
- experiment list becomes drawer;
- parameter panel becomes bottom sheet;
- controls remain touch sized;
- visualizations degrade gracefully without removing core experiment functionality.

Accessibility:
- every control keyboard reachable;
- visible focus styles;
- labels not encoded only by color;
- ARIA labels for icon controls;
- reduced-motion media query suppresses nonessential motion while preserving data visualizations.

## 9. Visualization rules

Never visually conflate:
1. generated / measured digital signal;
2. mathematically predicted auditory products;
3. listener-reported percept.

Use distinct labels and drawing styles. If a spectrum is derived from an AnalyserNode it is labeled MEASURED OUTPUT. If products are calculated from formulas they are labeled PREDICTED AUDITORY PRODUCTS. Listener reports are labeled YOUR PERCEPTION.

## 10. Persistence and privacy

Use localStorage/IndexedDB only for v1 preferences, presets and perception reports. Microphone recordings are memory-local by default and must not persist unless the user explicitly exports them. No analytics dependency is required.

## 11. Technical stack

- Vite
- TypeScript
- React for UI composition
- Web Audio API
- AudioWorklet where custom sample-accurate DSP is justified
- Canvas 2D for first-version visualizations; WebGL is optional only where profiling shows need
- Vitest for unit tests
- Playwright for browser integration tests
- ESLint + TypeScript strict mode
- GitHub Actions for build/test/lint
- GitHub Pages deployment

Avoid large DSP/UI frameworks unless a concrete requirement cannot reasonably be met with Web Audio and lightweight React code.

## 12. Quality gates

A feature is not complete merely because its controls render.

Required gates:
- typecheck passes;
- lint passes;
- unit tests pass;
- browser integration tests pass for supported CI browser;
- production build succeeds;
- representative offline-render DSP tests validate signal behavior;
- every catalog entry has explanation, guidance and references;
- master panic/stop silences every experiment;
- no console errors on normal navigation;
- GitHub Pages uses relative/base-safe asset paths.

## 13. Initial browser support

Primary: current desktop Chromium and Firefox. Safari/WebKit is supported where Web Audio behavior allows; automated WebKit smoke testing should catch gross compatibility failures. Web MIDI is progressive enhancement and must not block the application.

## 14. Out of scope for v1

- medical or therapeutic efficacy claims;
- cloud accounts or synced profiles;
- server-side audio processing;
- multiplayer/listening-room functionality;
- exact simulation of room-dependent Franssen illusion;
- individualized HRTF measurement;
- native mobile apps;
- DAW plugin builds.

## 15. Acceptance criteria

The release is acceptable when:
1. the site deploys to GitHub Pages and loads without path errors;
2. at least the complete catalog in section 3 is represented, with classic mode implemented for all entries and Lab controls for the defined adjustable experiments;
3. core experiments have DSP/channel/timing tests, not only UI tests;
4. user reports can be stored, viewed/exported and cleared locally;
5. Infinite Motion can combine circular pitch, circular rhythm, spatial and spectral motion, accept keyboard input, and use Web MIDI when available;
6. predicted/perceived components are never presented as measured signal content;
7. panic stop and parameter smoothing prevent stuck or abruptly discontinuous audio in normal use;
8. documentation names limitations and research references.
