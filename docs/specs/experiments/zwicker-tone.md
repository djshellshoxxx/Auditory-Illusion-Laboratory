# Zwicker Phantom Tone — Experiment Specification

Status: to spec (fixed in commit afb0c0f; re-audited 2026-10-02)
Reference: Barker et al. 2025 scoping review https://pmc.ncbi.nlm.nih.gov/articles/PMC12411427/; Noreña et al. 2000.

## Classic stimulus
- Broadband noise with a one-octave notch centred geometrically on 4 kHz (2828–5657 Hz), built as a cascaded 4-stage low-pass below the notch plus 4-stage high-pass above it, giving a broad deep stop band rather than a single narrow biquad notch.
- 5 s inducer with short fades ending before offset, then 4 s of digital silence for listening.
- Responses: heard / not heard plus optional pitch estimate.

## Re-audit (2026-10-02)
- Pass: broad notch construction, geometric centring, digital silence after offset, status messages, response UI.
- Added: phase lane view showing the inducer and the silent listening window with a playhead.
- Known limit: notch depth is not asserted by an FFT test of the Web Audio graph (Node tests cannot run BiquadFilterNode); it is covered by the edge-frequency test and documented here.

## Verification
`tests/zwicker.test.mjs`: Classic preset, geometric notch edges, noise→listen→done phases, catalog guidance.
