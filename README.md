# Pitch Trainer — World-Class Ear Training

A single-page web app for practicing **note identification**, **interval recognition**, **chord identification**, and **chord progression recognition**. Built with vanilla JS and the Web Audio API. Installable as a PWA.

## Features

### Game Modes
- **Note ID** — Identify individual notes by ear
- **Interval ID** — Identify the interval between two notes
- **Chord ID** — Identify chord quality (with inversions in Medium/Hard)
- **Progression ID** — Identify Roman numeral chord progressions (I-IV-V-I, etc.)

### Difficulty & Challenge
- **Four difficulty levels**: Easy, Medium, Hard, Adaptive
  - Easy: natural notes, basic intervals, major/minor chords, common progressions
  - Medium: chromatic notes, all intervals, triads + inversions, diatonic progressions
  - Hard: fast tones, limited replays, 7th chords + all inversions, complex progressions
  - Adaptive: auto-adjusts based on rolling accuracy (promotes at 80%, demotes at 40%)
- **Timed Challenge**: 60-second speed rounds with per-mode best score tracking
- **Focused Practice**: Automatically targets your weakest areas using weighted random selection

### Audio Engine
- **Dual-oscillator** synthesis with chorus detuning and low-pass filtering
- **Piano (FM)** mode: additive synthesis with 6 harmonics for realistic timbre
- **Waveform options**: Triangle, Sine, Square, Sawtooth, Piano
- **Musical Key Context**: Optional I-IV-V-I cadence before each question, constraining notes to the selected key
- **Reference Tone**: Optional A4 reference before each question
- **Adjustable volume** control

### Visualization
- **Staff notation**: SVG-rendered treble clef with note heads, accidentals, and ledger lines
- **Piano keyboard**: On-screen keyboard highlights played notes on result screens
- Shows correct answer and your answer on both staff and piano

### Statistics & Progress
- **Stats dashboard** with 6 tabs: Overview, Notes, Intervals, Chords, History, Badges
- **Per-item accuracy** tracking with bar charts (notes, intervals, chords)
- **Weak area** detection and display
- **Session history**: Last 50 questions with replay capability
- **Score + streak tracking** per mode (saved to localStorage)
- **Export/Import** statistics as JSON
- **Share** timed challenge results via Web Share API

### Achievements
- **15 badges** tracking milestones: first answer, streaks, speed, accuracy mastery
- **Toast notifications** on unlock
- **Achievements gallery** in the stats screen

### Accessibility
- **ARIA live regions** for screen reader announcements
- **ARIA labels** on all interactive elements
- **Focus-visible** indicators on all buttons and controls
- **Touch device detection**: hides keyboard shortcut hints on mobile

### Mobile & PWA
- **Installable** as a Progressive Web App (Add to Home Screen)
- **Offline support** via service worker with cache-first strategy
- **Safe area** padding for notched phones
- **Haptic feedback** on answer (correct/incorrect patterns)
- **44px minimum** tap targets for all buttons
- **Responsive** layout optimized for 350px–620px screens

### Controls
- **Hint system**: Eliminate half the wrong answers (press H)
- **Replay** sound (limited in Hard mode)
- **Play scale** in Note mode (press S)
- **Keyboard shortcuts**: 1-9/0 answer, R replay, H hint, S scale, Space/Enter next

## Run

Open `index.html` in a modern browser — no build step required.

## Files

| File | Purpose |
|------|---------|
| `index.html` | UI layout and structure |
| `style.css` | Styling, animations, responsive layout |
| `app.js` | Game logic, audio engine, question generation, stats |
| `manifest.json` | PWA manifest for installability |
| `sw.js` | Service worker for offline caching |

## Technical Notes

- Requires a user gesture to start audio (browser policy)
- All progress saved to browser localStorage
- No external dependencies — pure HTML/CSS/JS
- ~900 lines of JS, ~350 lines of CSS
