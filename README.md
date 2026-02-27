# Pitch Trainer (Ear Training)

A single-page web app for practicing **note identification**, **interval recognition**, and **chord identification**. It plays tones in the browser using the Web Audio API and tracks your score, streaks, and detailed statistics.

## Features

- **Three modes**: Note ID, Interval ID, Chord ID
- **Four difficulty levels**: Easy, Medium, Hard, Adaptive
  - Easy: natural notes, basic intervals, major/minor chords
  - Medium: chromatic notes, all intervals, triads
  - Hard: fast tones, limited replays, all chords including 7ths
  - Adaptive: auto-adjusts based on your rolling accuracy
- **Timed Challenge**: 60-second speed rounds with best score tracking
- **Piano visualization**: On-screen keyboard highlights played notes on results
- **Enhanced audio engine**: Dual-oscillator synthesis with filtering for rich tone
- **Volume control**: Adjustable gain
- **Hint system**: Eliminate half the wrong answers (press H)
- **Statistics dashboard**: Per-note/interval/chord accuracy, weak areas, timed bests
- **Score + streak tracking** per mode (saved to localStorage)
- **Replay button** (limited in Hard mode)
- **Settings**: octave range, waveform, volume, optional reference tone
- **Keyboard shortcuts** for fast play

## Run

Just open `index.html` in a modern browser.

## How to Play

1. Choose a mode (Note ID, Interval ID, or Chord ID)
2. Pick a difficulty (or use Adaptive)
3. Optionally enable Timed Challenge for speed rounds
4. Listen to the tone(s) and tap the correct answer

### Controls

- **Answer**: click/tap a button (or keys 1-9, 0)
- **Replay**: `R`
- **Hint**: `H` (eliminates half of wrong answers)
- **Play scale (Note mode only)**: `S`
- **Next**: `Space` or `Enter`

## Files

- `index.html` -- UI layout
- `style.css` -- styling and responsive layout
- `app.js` -- game logic, audio engine, question generation, stats

## Notes

- Requires a user gesture to start audio (browser policy)
- Uses Web Audio Oscillator with dual-oscillator chorus and low-pass filtering
- All progress saved to browser localStorage
