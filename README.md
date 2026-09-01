# Fretwise

A guitar practice tool built with React, TypeScript, and Vite.

## Features

### Random Notes
Generate a random set of notes, locate them on the fretboard, and use the metronome to time yourself. Great for building fretboard familiarity.

### Fingering Practice
Eight interactive fretboard exercises from a beginner exercise sheet:
- Spider (chromatic 1-2-3-4 across all strings)
- G Minor Pentatonic Scale
- C Major Scale (Open Position)
- G Major Scale (Open Position)
- G Major Scale (3 Notes Per String)
- 4 Note Ascending Pattern
- A Minor Scale
- A Minor Scale V2

### Octave Shapes
Visualize all four guitar octave shapes. Pick any root note from the dropdown and see every valid root + octave position highlighted across the full fretboard (frets 0–12).

### Metronome
Fixed bottom-right corner. BPM slider, ±1 nudge buttons, and time signature selector (2/4/6 beats per measure).

### Recorder
Fixed bottom-left corner. Records from your microphone and stores takes locally in the browser's IndexedDB — no data leaves your device. Recordings persist across page reloads. Supports in-app playback and saving files to disk via browser download.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui (base-ui)

## Dev

```bash
npm install
npm run dev
```
