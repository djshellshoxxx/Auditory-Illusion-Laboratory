# Architecture and Design Rationale

Sources: README ("Signal semantics", "Privacy"), `docs/specs/`, `docs/research/`. *(inferred)* marks conclusions from the layout.

- **Research-grounded stimuli, separated from expanded modes.** Classic stimuli follow reference specs. Lab mode expands parameters. The README says the two are kept apart.
- **Three-way signal semantics.** The UI distinguishes generated/measured digital signal, predicted auditory products, and perception. This keeps predicted effects from being presented as if they were in the audio.
- **Spec per experiment.** Each illusion has a spec with its audit, reference stimulus, implementation notes and tests (`docs/specs/experiments/`).
- **Experiment logic separated from the audio runtime.** `src/experiments/` holds catalogue and runtime modules, `src/audio/` holds the engine and scheduler. *(inferred from the layout.)*
- **Local-only data.** No accounts or telemetry; reports and presets stay in the browser (README).
- **Infinite Motion is a separate instrument.** It deliberately contradicts cues for musical use, so it lives in `src/infinite-motion/` and `docs/infinite-motion.md`.
