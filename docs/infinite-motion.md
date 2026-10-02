# Infinite Motion

Infinite Motion is the musical/experimental half of the project. It reuses the Laboratory's circular-pitch and Risset-rhythm math, but its contradiction settings are sound-design tools, not canonical psychoacoustic demonstrations. Full audit and specification: `docs/specs/infinite-motion-spec.md`.

- **Lanes are speeds.** Each slider runs from −1 to +1: the sign sets direction, the size sets speed, and 0 holds the lane still. Pitch and tempo are truly circular (endless glide, endless acceleration); pan orbits the head using both level and time-of-arrival cues; distance and spectrum cycle.
- **Linked vs unlinked.** Linked moves all five lanes together. Unlink to make the cues contradict each other, for example pitch rising while brightness falls.
- **Keys.** A W S E D F T G Y H U J K play C to C. Z and X shift the octave, which moves the sound's register and brightness. Keys are ignored while you type in a field.
- **MIDI.** Web MIDI is optional. Notes play voices; MIDI Learn maps a CC to any lane. Mappings and the user scene are stored only in this browser.
- **Stopping.** Stop All, Drone Hold release, PANIC STOP, switching to the Laboratory and unplugging a MIDI device all release every voice, every time.
