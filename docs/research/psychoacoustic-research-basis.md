# Auditory Illusion Laboratory — Psychoacoustic Research Basis

Date: 2026-10-01

This document records the research basis for the first implementation of Auditory Illusion Laboratory and Infinite Motion. It is intentionally conservative: classic modes should reproduce well-described stimuli; experimental modes may extend those mechanisms, but the UI must distinguish established stimulus construction from novel transformations.

## 1. Pitch circularity and Shepard tones

Roger Shepard's circular-pitch construction uses octave-spaced components shaped by a fixed spectral envelope. The perceived pitch class can move while absolute pitch height remains ambiguous, enabling cyclic sequences that seem to ascend or descend indefinitely.

Implementation implications:
- A Shepard tone is a bank of octave-related partials, not one oscillator with pitch wraparound.
- Partial amplitudes must be determined by a smooth spectral envelope so components can enter and leave perceptually unobtrusively.
- Classic mode should keep octave spacing exact and maintain a stable spectral envelope.
- Lab mode may vary envelope width, center, partial count, waveform, tuning, direction, and motion rate.

References:
- Shepard, R. N. (1964), circularity in judgments of relative pitch.
- Diana Deutsch overview of pitch circularity and related illusions: https://deutsch.ucsd.edu/psychology/pages.php?i=201

## 2. Shepard–Risset continuous glissando

Risset extended circular pitch into continuous motion. Octave-related layers glide together while their gains crossfade through the spectral envelope. Layers disappearing at one spectral edge are replaced at the other, creating a continuous barber-pole pitch effect.

Implementation implications:
- Frequency trajectories and gain envelopes must be continuous.
- Wrap events must be click-free and perceptually hidden.
- The implementation should support both ascending and descending motion and expose glide rate separately from spectral-envelope position.

## 3. Risset / barber-pole rhythm

The rhythmic analogue uses multiple synchronized streams at related playback rates or pulse densities, with gain weighting that shifts emphasis among them. Correct implementations create apparent continuous acceleration or deceleration without simply increasing one metronome forever.

Implementation implications:
- Maintain multiple tempo layers with fixed rate ratios.
- Crossfade layer salience cyclically.
- Avoid discontinuities at wrap boundaries.
- Infinite Motion should be able to run pitch circularity and tempo circularity independently.

## 4. Tritone paradox

Deutsch's tritone paradox uses octave-ambiguous tones separated by six semitones. Different listeners can hear the same pair as ascending or descending. The tones are sets of octave-related components under a bell-shaped spectral envelope, providing clear pitch class but ambiguous height.

Implementation implications:
- Classic mode must synthesize octave-ambiguous complexes, not ordinary single-frequency tones.
- The experiment should collect ascending/descending judgments by pitch class.
- No response should be labeled correct or incorrect.

Primary reference:
- Deutsch, D. (1991), The Tritone Paradox: An Influence of Language on Music Perception, Music Perception 8(4):335–347, DOI 10.2307/40285517.
- https://online.ucpress.edu/mp/article-abstract/8/4/335/62921/
- https://deutsch.ucsd.edu/psychology/pages.php?i=206

## 5. Octave, scale, chromatic, Cambiata and glissando illusions

Deutsch's stereo illusions demonstrate strong perceptual regrouping across ears. The auditory system can reorganize channel-assigned tones into perceptual streams that differ markedly from the physical left/right sequences.

Implementation implications:
- Channel assignment and timing must be sample-stable.
- Classic presets must preserve the published left/right alternation structure.
- Visualizations should separately show physical channel content and user-reported percept.
- Glissando and related localization illusions should disclose when loudspeakers / room acoustics are more appropriate than headphones.

Reference hub:
- https://deutsch.ucsd.edu/psychology/pages.php?i=201

## 6. Auditory streaming

Alternating tone sequences can be heard either as one integrated pattern or as multiple streams depending on pitch separation, rate, timbre and other factors. Perception can switch while the stimulus is unchanged.

Implementation implications:
- Provide controllable A/B frequency separation and event rate.
- Add optional timbre and stereo separation only in Lab mode.
- Record user judgments such as one stream / two streams with current parameter values.

## 7. Auditory continuity / filling-in

When a signal is interrupted by a sufficiently masking sound, listeners may perceive the target as continuing through the interruption even though it is physically absent. This occurs with tones and speech.

Implementation implications:
- The target waveform must truly be absent during the gap in the masking condition.
- Offer at least three comparisons: silent gap, masking noise gap, uninterrupted reference.
- Signal visualization must make the physical deletion explicit.

Reference:
- King, A. J. (2007), Auditory Neuroscience: Filling in the Gaps, Current Biology 17(18):R799–R801. https://pmc.ncbi.nlm.nih.gov/articles/PMC7116515/

## 8. Zwicker tone

A notched-noise inducer can produce a short-lived auditory afterimage or phantom tone after the noise stops. Recent review literature emphasizes variability across listeners and stimulus-dependent effects.

Implementation implications:
- User controls: notch center, notch width, noise duration, bandwidth and level.
- The app must not claim every listener will hear the tone.
- After the inducer ends, generated output should be silent except for UI-independent system noise; the visualizer should make that explicit.
- User can record heard / not heard and perceived pitch.

Reference:
- Barker, J. L. R. et al. (2025), The Zwicker tone as a model to investigate auditory processing and tinnitus: a scoping review, Frontiers in Neuroscience 19:1656934. https://www.frontiersin.org/journals/neuroscience/articles/10.3389/fnins.2025.1656934/full

## 9. Missing fundamental

A harmonic complex can evoke a pitch corresponding to a fundamental that is not physically present in the spectrum.

Implementation implications:
- The generator must construct harmonics from N*f0 while omitting f0.
- The physical-spectrum panel must verify no f0 oscillator exists.
- Lab mode should allow changing which low harmonics are removed and the number of upper harmonics.

## 10. Combination tones and distortion products

Nonlinearities in the auditory system can produce percepts associated with frequencies not physically present in the presented signal, including products such as 2f1-f2.

Implementation implications:
- Generate only the requested primaries in classic exploration mode.
- Compute predicted products separately in analysis/UI code.
- Never draw predicted products as if they were measured output components.
- Optional browser FFT should verify the digital signal does not itself contain unintended products above tolerance.

## 11. Precedence / Haas localization

Closely spaced copies from different directions may fuse perceptually, with location dominated by the earlier-arriving sound. At larger delays, separate events or echoes emerge.

Implementation implications:
- Adjustable inter-channel delay in milliseconds.
- Use short click-free sources or filtered transients.
- Provide one-source / widened / two-source user response controls.

## 12. Speech-to-song and phantom words

Repeated speech can become song-like without changing the source waveform. Repeated / offset speech fragments can also yield listener-specific phantom word percepts.

Implementation implications:
- Browser microphone capture must require explicit user action and remain local by default.
- Preserve the original recorded buffer in classic speech-to-song mode; repetition alone drives the demonstration.
- Phantom-words mode may use generated syllables or user recordings and should record user-entered percepts without claiming they are present in the stimulus.

Reference hub:
- https://deutsch.ucsd.edu/psychology/pages.php?i=201

## 13. Browser audio architecture

Web Audio API is appropriate for this project. AudioWorklet provides custom processing on the audio rendering thread and is broadly available in secure contexts. OfflineAudioContext is appropriate for deterministic test rendering and spectrum verification.

Implementation implications:
- Use Vite + TypeScript.
- Keep DSP primitives UI-independent.
- Use AudioWorklet only where sample-accurate processing or custom DSP materially benefits the implementation; ordinary Web Audio graph nodes remain acceptable where deterministic.
- Use OfflineAudioContext in browser tests for waveform/spectral assertions.

Reference:
- MDN AudioWorklet: https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet

## 14. Claims policy

The application is an audio/perception laboratory and experimental instrument. It must not make medical, cognitive-enhancement, sleep, treatment or therapeutic efficacy claims. Descriptions should explain what the stimulus physically contains, what percept is commonly reported, and where listener variability is expected.
