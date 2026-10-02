# Auditory Illusion Laboratory — Detailed Classic Reference Specifications

Date: 2026-10-02
Status: Audit reference specification
Scope: the 18 v1 laboratory experiments only. Infinite Motion remains governed by the separate product design.

This document supplements `docs/superpowers/specs/2026-10-01-auditory-illusion-laboratory-design.md`. The earlier design names the correct stimulus families, but several entries are not precise enough to verify a canonical implementation. These specifications define the Classic-mode reference stimulus, timing/channel invariants, minimum Lab controls, response UI, visualization requirements, and objective verification gates.

General Classic-mode rules

1. Classic mode must be a fixed, research-grounded reference preset. Lab mode may deviate, but deviations must be labeled as exploratory.
2. Stereo illusions that depend on dichotic assignment must use sample-stable simultaneous L/R events. Do not substitute sequential panning for simultaneous dichotic presentation.
3. Any named historical stimulus must preserve the defining timing, spectral construction, channel assignment and source type closely enough to reproduce the published phenomenon.
4. Each experiment needs an experiment-specific response UI. Generic response buttons shared across unrelated experiments are not sufficient.
5. Visualizations must distinguish generated/measured signal, predicted products, and listener reports.
6. Every Classic implementation needs at least one DSP/timing/channel test that asserts the defining invariant.

## 1. Shepard Circular Pitch

Purpose: reproduce Shepard's discrete circular-pitch sequence, not merely a continuously pitch-shifted chord.

Classic stimulus:
- Generate one Shepard tone per pitch class step.
- Each tone is a sum of exact octave-spaced sinusoidal components.
- Component amplitudes follow one fixed smooth bell/Gaussian-like spectral envelope on a log-frequency axis; the envelope itself does not move with pitch class.
- Reference sequence: 12 equal semitone steps per octave, one step at a time, repeated cyclically.
- Direction: ascending by default; descending is the exact reverse.
- Reference tone duration: 500 ms per step is acceptable for the Classic preset; onset/offset ramps must be short and click-free.
- The transition from B to C (or reverse) must not create an octave jump in the overall spectral centroid.

Classic preset target: 6–10 octave components spanning the audible region around an envelope center near 1 kHz, sine waveform, 1-semitone steps, ~2 steps/s.

Lab controls: base pitch class, direction, step size in semitones, step rate, component count, envelope center, envelope width, waveform, fine detune.

Response UI: Rising / Falling / Ambiguous.

Visualization: pitch-class helix plus physical partial spectrum.

Verification:
- Adjacent components within a tone are exactly 2:1 in frequency.
- Successive pitch classes differ by the configured semitone ratio.
- Spectral-envelope center remains fixed as pitch class changes.
- Wrap from final to first pitch class changes chroma without a simultaneous one-octave discontinuity of the complete bank.

References: Shepard (1964); modern Shepard-tone construction reviews.

## 2. Shepard–Risset Continuous Glide

Purpose: create a truly continuous barber-pole pitch glide.

Classic stimulus:
- Multiple octave-related sine layers glide continuously in the same direction.
- Each layer's gain is determined continuously by a fixed spectral envelope.
- Individual layers must wrap/re-enter at spectral boundaries independently and inaudibly; the entire oscillator bank must not jump one octave at a common phase reset.
- Ascending and descending versions must be exact directional counterparts.

Classic preset target: 6–10 layers, envelope center about 900–1000 Hz, moderate width (~1–1.5 octaves), slow glide of roughly one octave over several seconds.

Lab controls: glide speed, direction, component count, envelope center/width, stereo spread, waveform.

Visualization: scrolling log-frequency tracks with amplitude opacity.

Verification:
- No global frequency discontinuity occurs at cycle wrap.
- Every active layer is octave-related to the pitch-class family at any instant.
- RMS/spectral centroid remains bounded across multiple cycles.

## 3. Risset Rhythm

Purpose: rhythmic analogue of Shepard/Risset circularity.

Classic stimulus:
- Maintain multiple pulse trains whose instantaneous rates are related by powers of two.
- Salience/gain moves cyclically across layers while rate changes continuously, creating apparent endless acceleration or deceleration.
- Layers must wrap independently; no instant may reset all pulse rates together.
- Pulse events should be short, broadband or click-like enough that tempo is clear.

Classic preset target: root ~90 BPM, 4–6 layers, 2:1 layer-rate relationships, moderate pulse duration, mono/centered unless stereo spread is intentionally enabled.

Lab controls: root BPM, layer count, direction, cycle speed, pulse timbre, density, stereo spread.

Verification:
- Neighboring layer rates maintain exact 2:1 ratios in Classic mode.
- Gain weighting cycles smoothly.
- The output contains no simultaneous all-layer rate reset.

## 4. Octave Illusion

Purpose: reproduce Deutsch's dichotic octave illusion.

Canonical Classic stimulus:
- Pure sine tones at 400 Hz and 800 Hz.
- Both ears receive a tone simultaneously at all times.
- State A: left=400 Hz, right=800 Hz.
- State B: left=800 Hz, right=400 Hz.
- Alternate A/B four times per second: 250 ms per state.
- Original construction follows continuously without amplitude drops at transitions; if short technical ramps are needed to avoid browser artifacts they must not create audible silent gaps.
- Equal level in both channels.
- Headphones strongly recommended.

Response UI: perceived high side; perceived low side; optional free-text pattern description.

Visualization: exact physical L/R event lanes, not only an FFT.

Verification:
- L/R tones are simultaneous, complementary, and swap exactly every 250 ms.
- There is no inter-state silence in the Classic render.
- Frequency pair is exactly 400/800 Hz.

Primary references: Deutsch, Nature 1974; later replications describe the same dichotic pair structure.

## 5. Scale Illusion

Purpose: reproduce Deutsch's two-channel C-major scale illusion.

Canonical Classic stimulus:
- Equal-amplitude sine tones.
- C-major scale pitches: C D E F G A B C over one octave. A historically reported implementation used approximately 259, 290, 326, 345, 388, 435, 488, 517 Hz; equal-tempered equivalents are acceptable if clearly documented.
- Present an ascending scale and descending scale simultaneously.
- Successive tones alternate between ears.
- When an ascending-scale tone is in the right ear, the contemporaneous descending-scale tone is in the left ear, and vice versa.
- Four tone positions per second: 250 ms per synchronous dichotic pair.
- Repeat the eight-position pattern without pause.
- Headphones preferred.

Lab controls: scale root/transposition, tone duration/rate, register, scale set; channel swap may be offered.

Response UI: perceived higher-stream side, lower-stream side, number of streams, optional description.

Visualization: two physical ear lanes and optional perceived grouping overlay.

Verification:
- Both channels have one tone at every 250 ms position.
- Ascending and descending note sets are exact reverses.
- Ear assignment alternates every event.
- No gap is inserted between scale cycles.

Primary reference: Deutsch, JASA 1975, 57:1156–1160.

## 6. Chromatic Illusion

Purpose: reproduce the chromatic variant of the Scale Illusion.

Classic stimulus:
- A chromatic scale spanning two octaves in the primary Classic preset.
- Simultaneous ascending and descending chromatic lines.
- Ear assignment alternates in the same reciprocal manner as the Scale Illusion.
- Equal-amplitude tones; repeated continuously without pause.
- A one-octave variant belongs in Lab mode or as an alternate reference preset.
- Use the same 250 ms event-grid convention as the Scale Illusion unless a transcribed official reference fixture establishes a different published timing.

Expected percept: a higher smooth line moving down/up and lower smooth line moving up/down, despite each isolated physical channel leaping in pitch.

Response UI: perceived high-stream side, low-stream side, stream description.

Verification: exact two-octave chromatic pitch set, reciprocal ascending/descending lines, alternating ear assignment, repeat without pause.

## 7. Cambiata Illusion

Purpose: reproduce Deutsch's specific repeating stereo cambiata pattern rather than any arbitrary crossed melody.

Classic stimulus requirements:
- Use the exact repeating pitch/channel pattern shown in Deutsch's Cambiata Illusion Figure 1 / official reference audio.
- Each isolated physical channel must leap substantially in pitch.
- With both channels active, the combined pitch set must support two perceptual three-tone cambiata figures: one higher and one lower, each locally close in pitch.
- Equal channel level; strongest presentation is stereo headphones.
- The exact transcribed event fixture must be committed as data and covered by a test. Until that transcription is completed from the official figure/audio, an arbitrary four-pair pattern must not be labeled Classic Cambiata.

Lab controls after canonical fixture exists: transposition, tempo, channel swap, optional timbre.

Response UI: number of streams, higher-stream side, lower-stream side, free description.

Visualization: canonical physical event lanes versus common perceptual grouping.

Verification: snapshot test of the canonical note/channel event fixture; isolated-channel test demonstrates pitch leaps; combined note set contains two close three-note registers.

Primary references: Deutsch (2003) official Cambiata demonstration; Deutsch, Psychology of Music 3rd ed., grouping chapter.

## 8. Tritone Paradox Mapper

Purpose: measure listener-specific direction judgments for octave-ambiguous tone pairs separated by six semitones.

Classic stimulus:
- Each stimulus tone is an octave-complex/Shepard tone, not a single sine.
- Six octave-related sinusoidal components is a well documented reference construction.
- Fixed bell-shaped spectral envelope for both tones in a trial.
- Tone pair differs by exactly six semitones.
- Reference duration: about 500–800 ms per tone with ~50 ms onset/offset ramps; ~200 ms inter-tone gap is a defensible research reference.
- Trials must cover multiple starting pitch classes, not only one endlessly repeated C/F# pair.

Response UI: Up / Down / Ambiguous per trial; aggregate locally by starting pitch class. No correctness score.

Lab controls: spectral-envelope center/width, pitch-class subset, trial order, tone duration/ISI.

Verification: components octave-spaced; pair chroma separation exactly 6 semitones; mapper presents more than one starting pitch class; responses are stored keyed to pitch class.

## 9. Glissando Illusion

Purpose: reproduce Deutsch's spatial glissando illusion.

Canonical Classic stimulus:
- Stereo loudspeakers, preferably in a somewhat reverberant room. Headphones are explicitly less effective.
- Component A: synthesized oboe-like tone fixed at Middle C (~262 Hz).
- Component B: sine-wave glissando repeatedly sweeping up and down between ~131 Hz and ~523 Hz.
- One complete up/down glissando cycle: 2.5 s in the formal reference experiment.
- Oboe and current glissando segment play simultaneously from opposite loudspeakers.
- Swap which speaker carries oboe versus glissando every 238 ms.
- The glissando itself remains a continuous bidirectional trajectory across speaker swaps.
- Level should be conservative and channels balanced.

Lab controls: glide range, cycle duration, switching interval, fixed-tone pitch/timbre, channel swap.

Response UI: perceived glissando spatial trajectory plus optional description.

Verification:
- Fixed source is oboe-like rather than a plain triangle oscillator.
- Glide repeatedly goes both upward and downward.
- Reference range, 2.5 s cycle, and 238 ms source swap are represented in Classic mode.
- Opposite-channel assignment is simultaneous at all times.

Primary reference: Deutsch glissando demonstration/formal experiment.

## 10. Auditory Stream Segregation

Purpose: demonstrate perceptual fission of a repeating ABA_ sequence.

Classic stimulus:
- Repeating A-B-A-silence pattern.
- A and B are pure tones initially sharing timbre, level and spatial position.
- Choose a moderate reference rate and pitch separation that commonly yields bistability rather than making one-stream or two-stream perception inevitable.
- Maintain exact periodic timing; the underscore is a silent event equal to one event slot.

Lab controls: A frequency, B frequency or semitone separation, event rate, tone duration/duty cycle, timbre difference, stereo difference, level difference.

Response UI: One Stream / Two Streams / Switching.

Output: local boundary map versus separation/rate when enough reports exist.

Verification: sequence is exactly A-B-A-rest; rest slot is silent; event rate and Δf are independently controllable.

## 11. Auditory Continuity / Filling-in

Purpose: compare actual continuity, silent interruption, and masked physical deletion.

Classic mode must expose three selectable/reference conditions:
A. Uninterrupted target.
B. Target physically absent during a silent gap.
C. Target physically absent during the same gap while a masker occupies the gap.

Reference target may be a steady or amplitude-modulated tone. The masker must be capable of masking the target: broadband or appropriately band-limited noise at sufficient relative level.

Critical invariant: in conditions B/C, digital target amplitude during the gap is exactly zero, not merely -80 or -100 dB.

Lab controls: target frequency/source, gap duration, masker type, masker level, masker bandwidth/notch width, trial condition.

Response UI: Continuous / Interrupted / Uncertain, stored with condition and parameters.

Visualization: waveform/envelope explicitly shows zero target samples in the gap while masker is shown separately.

Verification: offline render asserts zero target contribution during the gap and nonzero masker only in condition C.

## 12. Zwicker Phantom Tone

Purpose: induce a short auditory afterimage after notched noise stops.

Classic stimulus:
- Broadband noise with a broad spectral notch, not merely a narrow single biquad notch.
- Reference notch center near 4 kHz.
- Reference notch width near one octave (~6 ERB) is strongly supported by recent review literature; ~0.77–1 octave around 3.7–4 kHz has been effective in several studies.
- Inducer duration: at least 3–6 s for a practical browser demonstration; longer durations can be offered in Lab mode.
- Notch depth should be high (ideally >30 dB across the intended spectral gap).
- Following inducer offset, the generated digital output must be silent throughout the listener report period.

Lab controls: notch center, width in octave/ERB or explicit lower/upper edges, notch depth, noise lower/upper cutoff, inducer duration, level.

Response UI: Tone Heard / Not Heard and optional estimated pitch.

Visualization: measured inducer spectrum with clearly broad notch, then a digital-silence indicator during report period.

Verification:
- FFT of inducer confirms notch depth/width.
- Offline post-inducer buffer is digital zero after fade completion.
- Classic notch cannot be implemented by a single narrow notch whose effective stop band is far smaller than the requested width.

## 13. Missing Fundamental

Purpose: evoke the pitch of absent f0 using harmonic periodicity.

Classic stimulus:
- Sum integer harmonics n*f0 while omitting the f0 component entirely.
- Reference: harmonics 2–8 or a wider consecutive set, sine components, coherent onset/offset.
- Equal-amplitude or gently rolled-off harmonic amplitudes are acceptable if documented; Classic must not insert f0.

Lab controls: f0, first present harmonic, last harmonic, harmonic amplitude law, component phase mode.

Response UI: perceived pitch estimate, optional heard/not-heard confidence.

Visualization: generated spectral lines and a distinct marker at the missing f0.

Verification: no oscillator/FFT line intentionally exists at f0; all generated frequencies are exact integer multiples.

## 14. Combination-Tone Explorer

Purpose: demonstrate auditory/cochlear distortion products while keeping the digital stimulus clean.

Classic stimulus:
- Exactly two sine-wave primaries, f1 and f2.
- No intentionally synthesized difference tone or cubic difference tone.
- Equal or explicitly controlled primary levels; conservative master output.

Analysis must separately calculate at minimum |f2-f1|, |2f1-f2| and |2f2-f1|. Predicted products must never be drawn as measured FFT bins.

Lab controls: f1, f2, primary level/balance; optional non-sine waveform only with an explicit warning that source harmonics contaminate a clean combination-tone demonstration.

Response UI: optional heard-product estimate/description.

Verification: offline digital FFT contains only intended primaries above tolerance in Classic mode.

## 15. Precedence / Haas Explorer

Purpose: demonstrate fusion/localization dominance as a function of lead-lag delay.

Classic stimulus:
- Use brief, broadband/localizable events such as clicks, filtered clicks, noise bursts, or short speech/transient samples.
- Present identical event from one side, followed by the opposite side after a short delay.
- Reference delay in the few-millisecond fusion range (about 1–5 ms for clicks); 8 ms may be useful for exploration but is not a universal classic fusion value.
- Repeat discrete trials/events with enough spacing that each onset can be judged.
- Continuous steady-state sine duplication is not an adequate Classic precedence demonstration because after onset it primarily creates interference/phase effects rather than repeated precedence judgments.

Lab controls: delay 0–40+ ms, lead side, source type, ILD, repetition interval.

Response UI: One / Wide / Two Events plus perceived location.

Verification: source waveform is transient/broadband in Classic mode; exact lead-lag delay test; channels are otherwise identical.

## 16. Speech-to-Song

Purpose: produce the illusion by exact repetition of unchanged recorded speech.

Classic workflow:
1. User records a spoken sentence or short phrase locally.
2. User selects/records a short phrase suitable for repetition. A documented reference phrase is “sometimes behave so strangely,” but user speech is acceptable.
3. Play the phrase identically about ten times. The same audio buffer is reused byte/sample-for-sample; no pitch correction, stretching, filtering, reordering or melodic processing.
4. Optionally replay the original full sentence afterward to demonstrate carryover.

Classic parameters: repetition count around 10, optional short inter-repeat interval. The declared repetition count and interval must actually govern playback.

Response UI: Speech / Song-like / Mixed, optional transition repetition number.

Privacy/audio architecture: recording stays local/memory-only. Playback should route through the shared AudioEngine/master/panic path, not an uncontrolled HTML media element that survives Panic.

Verification: repeated buffers are identical; panic stops repetition; declared repeat count is honored.

## 17. Phantom Words

Purpose: create Deutsch-style ambiguous speech from repeated, temporally offset stereo speech fragments.

Classic stimulus:
- Use actual intelligible recorded speech tokens: two monosyllabic words, or one two-syllable word split into two speech fragments.
- Present the same two-token repeating sequence from both stereo loudspeakers, offset in time so that when token A is on one side token B is on the other, and vice versa.
- Loudspeakers are preferred; headphones are explicitly less effective because acoustic mixing in the room contributes to the palette of ambiguous speech.
- Preserve speech formants, consonants, transitions and temporal envelopes. A few synthetic triangle oscillators chosen only from the vowel letter do not constitute a Phantom Words stimulus.

Lab controls: select/upload/record token A/B, offset, repetition rate, channel swap, optional voice set.

Response UI: free-text report, ideally separate left/right perceived words.

Verification: source assets are speech waveforms; two-channel offset relationship is exact; isolated channel playback remains recognizable as the physical token sequence.

## 18. Mysterious Melody

Purpose: hide a familiar melody by preserving pitch class while scrambling octave height.

Classic stimulus:
- Use a familiar/public-domain simple melody.
- Preserve note order, pitch class, rhythm and durations.
- Assign each note haphazardly among three octaves in the scrambled condition.
- Provide an unscrambled reveal/reference using the identical melody in a normal compact register.
- After reveal, allow replay of the exact same scrambled sequence; do not regenerate a different random octave assignment.

Lab controls: melody source, scramble octave span/depth, fixed random seed, reveal amount, tempo, user-entered notes.

Response UI: Recognized / Not Recognized and optional guessed identity.

Verification: every scrambled note has the same pitch class as its source note; only octave number changes; the same seed yields the same sequence; reveal=100% reconstructs the source register.

## Cross-experiment acceptance tests

A release claiming all Classic experiments work must include:
- Offline or pure-DSP tests for Shepard/Risset wrap continuity.
- Exact event/channel snapshots for Octave, Scale, Chromatic and Cambiata.
- A repeated bidirectional 131–523 Hz glissando plus 238 ms opposite-channel swap test.
- Exact-zero target gap test for Continuity.
- Frequency-domain notch-width/depth test plus post-inducer digital-silence test for Zwicker.
- Missing-f0 and clean two-primary FFT tests.
- Lead/lag transient timing test for Precedence.
- Buffer identity/repeat-count/panic test for Speech-to-Song.
- Speech-waveform and stereo-offset test for Phantom Words.
- Pitch-class preservation/seed repeatability test for Mysterious Melody.

Research sources used for this supplement include the project's existing references plus: Deutsch's official Octave, Scale, Chromatic, Cambiata, Glissando, Phantom Words, Mysterious Melody and Speech-to-Song pages; Deutsch (1974, Nature); Deutsch (1975, JASA); Deutsch et al. (2011, JASA speech-to-song); reviews of the precedence effect and auditory continuity illusion; and Barker et al. (2025) review of Zwicker-tone induction parameters.