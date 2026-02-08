# Pitch Trainer (Note & Interval Ear Training)

A single‑page web app for practicing **note identification** and **interval recognition**. It plays tones in the browser using the Web Audio API and tracks your score/streak.

## Features
- **Two modes**: Note ID and Interval ID
- **Three difficulties**: Easy, Medium, Hard
  - Easy: natural notes + simple intervals
  - Medium: chromatic notes + all intervals
  - Hard: fast notes + limited replays + descending intervals
- **Score + streak tracking** (best streak saved to localStorage)
- **Replay button** (limits in Hard mode)
- **Settings**: octave range, waveform, optional reference tone
- **Keyboard shortcuts** for fast answering

## Run
Just open `index.html` in a modern browser.

## How to Play
1. Choose a mode (Note ID or Interval ID)
2. Pick a difficulty
3. Listen to the tone(s) and tap the correct answer

### Controls
- **Answer**: click/tap a button (or keys 1–9, 0)
- **Replay**: `R`
- **Play scale (Note mode only)**: `S`
- **Next**: `Space` or `Enter`

## Files
- `index.html` — UI layout
- `style.css` — styling and responsive layout
- `app.js` — game logic, audio engine, question generation

## Notes
- Requires a user gesture to start audio (browser policy)
- Uses Web Audio Oscillator with selectable waveforms

---
Built as a compact, touch‑friendly ear‑training game.
