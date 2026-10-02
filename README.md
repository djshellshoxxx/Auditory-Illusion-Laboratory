# Auditory Illusion Laboratory

A browser-based psychoacoustic laboratory plus the **Infinite Motion** experimental instrument. The Laboratory separates research-grounded classic stimuli from parameter-expanded Lab mode. Infinite Motion deliberately combines or contradicts cyclic pitch, rhythm, spatial, distance and spectral cues for musical use.

## Included experiments

Shepard circular pitch, Shepard–Risset glide, Risset rhythm, octave illusion, scale illusion, chromatic illusion, cambiata illusion, tritone paradox mapper, glissando illusion, auditory stream segregation, continuity/filling-in, Zwicker phantom tone, missing fundamental, combination-tone explorer, precedence/Haas, speech-to-song, phantom words, and mysterious melody.

## Signal semantics

The UI explicitly distinguishes **generated/measured digital signal**, **predicted auditory products**, and **your perception**. Predicted cochlear products are not intentionally synthesized in the classic combination-tone demonstration. The Zwicker report period is intended to contain no deliberately generated phantom tone.

## Local development

```bash
npm install
npm run dev
npm run test:core
npm run typecheck
npm run build
```

Full CI additionally runs Vitest and Playwright. Vite is configured for `/Auditory-Illusion-Laboratory/` GitHub Pages hosting.

## Privacy

Perception reports and presets are stored locally in the browser. There is no account or telemetry service. Microphone recordings used by Speech-to-Song remain browser-memory/object-URL data unless the user explicitly exports them.

## Output guidance

Some stereo illusions are best on headphones. Precedence/phantom-word effects can be more informative on stereo loudspeakers, while the glissando family can depend strongly on room/loudspeaker conditions. Output guidance is shown per experiment.
