# User Guide

## Run locally

```bash
npm install
npm run dev        # Vite dev server
```

Deployment is to GitHub Pages under `/Auditory-Illusion-Laboratory/` (Vite base path).

## Experiments

Classic and Lab-mode experiments include Shepard circular pitch, Shepard–Risset glide, Risset rhythm,
octave, scale, chromatic and cambiata illusions, the tritone paradox mapper, glissando, auditory stream
segregation, continuity, Zwicker tone, missing fundamental, combination tones, precedence (Haas),
speech-to-song, phantom words and mysterious melody.

## Reading the output

The UI separates three things: generated or measured digital signal, predicted auditory products, and
your perception. Predicted cochlear products are not synthesised in the classic combination-tone demo.
The Zwicker report period is meant to contain no deliberately generated phantom tone.

## Listening

Some stereo illusions work best on headphones. Precedence and phantom-word effects can be clearer on stereo
loudspeakers. Glissando effects depend strongly on the room and loudspeakers.

## Privacy

Perception reports and presets are stored in the browser only. There is no account or telemetry. Speech-to-Song
microphone recordings stay in browser memory or object URLs unless you export them.
