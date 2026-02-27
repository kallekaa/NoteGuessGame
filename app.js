/* ═══════════════════════════════════════════════
   Pitch Trainer — World-Class Ear Training
   ═══════════════════════════════════════════════ */

// ── 1. Constants ─────────────────────────────

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NATURAL_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_NOTE_INDICES = new Set([1, 3, 6, 8, 10]);
const MAJOR_SCALE_STEPS = [0, 2, 4, 5, 7, 9, 11, 12];

const INTERVALS = [
  { semitones: 0,  name: 'Unison' },
  { semitones: 1,  name: 'Minor 2nd' },
  { semitones: 2,  name: 'Major 2nd' },
  { semitones: 3,  name: 'Minor 3rd' },
  { semitones: 4,  name: 'Major 3rd' },
  { semitones: 5,  name: 'Perfect 4th' },
  { semitones: 6,  name: 'Tritone' },
  { semitones: 7,  name: 'Perfect 5th' },
  { semitones: 8,  name: 'Minor 6th' },
  { semitones: 9,  name: 'Major 6th' },
  { semitones: 10, name: 'Minor 7th' },
  { semitones: 11, name: 'Major 7th' },
  { semitones: 12, name: 'Octave' },
];

const EASY_INTERVALS = [0, 2, 4, 5, 7, 12];

const CHORDS = [
  { name: 'Major',   semitones: [0, 4, 7],     pool: 'basic' },
  { name: 'Minor',   semitones: [0, 3, 7],     pool: 'basic' },
  { name: 'Dim',     semitones: [0, 3, 6],     pool: 'triads' },
  { name: 'Aug',     semitones: [0, 4, 8],     pool: 'triads' },
  { name: 'Dom7',    semitones: [0, 4, 7, 10], pool: 'seventh' },
  { name: 'Maj7',    semitones: [0, 4, 7, 11], pool: 'seventh' },
  { name: 'Min7',    semitones: [0, 3, 7, 10], pool: 'seventh' },
  { name: 'Dim7',    semitones: [0, 3, 6, 9],  pool: 'extended' },
  { name: 'm7b5',    semitones: [0, 3, 6, 10], pool: 'extended' },
  { name: 'Sus2',    semitones: [0, 2, 7],     pool: 'extended' },
  { name: 'Sus4',    semitones: [0, 5, 7],     pool: 'extended' },
];

const DIFFICULTY = {
  easy:   { noteDuration: 1.5, replayLimit: Infinity, notePool: 'natural',   intervalPool: 'easy',            chordPool: 'basic' },
  medium: { noteDuration: 1.0, replayLimit: Infinity, notePool: 'chromatic', intervalPool: 'all',             chordPool: 'triads' },
  hard:   { noteDuration: 0.5, replayLimit: 2,        notePool: 'chromatic', intervalPool: 'all+descending',  chordPool: 'all' },
};

const ADAPTIVE_TIERS = {
  note: [
    { notePool: 'natural',   noteDuration: 1.5, replayLimit: Infinity, label: 'Natural Notes' },
    { notePool: 'chromatic', noteDuration: 1.2, replayLimit: Infinity, label: 'All Notes' },
    { notePool: 'chromatic', noteDuration: 0.7, replayLimit: 4,        label: 'Fast Chromatic' },
  ],
  interval: [
    { intervalPool: 'easy',            noteDuration: 1.5, replayLimit: Infinity, label: 'Basic Intervals' },
    { intervalPool: 'all',             noteDuration: 1.0, replayLimit: Infinity, label: 'All Intervals' },
    { intervalPool: 'all+descending',  noteDuration: 0.7, replayLimit: 3,        label: 'All + Descending' },
  ],
  chord: [
    { chordPool: 'basic',  noteDuration: 2.0, replayLimit: Infinity, label: 'Major & Minor' },
    { chordPool: 'triads', noteDuration: 1.5, replayLimit: Infinity, label: 'All Triads' },
    { chordPool: 'all',    noteDuration: 1.2, replayLimit: 3,        label: 'All Chords' },
  ],
};

const TIMED_DURATION = 60;

// ── 2. Audio Engine ──────────────────────────

let audioCtx = null;

function ensureAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function noteNameFromMidi(midi) {
  return NOTE_NAMES[midi % 12];
}

function playTone(freq, duration, delayStart, gainMultiplier) {
  delayStart = delayStart || 0;
  gainMultiplier = gainMultiplier || 1;

  const ctx = ensureAudioContext();
  const vol = state.settings.volume * gainMultiplier;

  // Main oscillator
  const osc1 = ctx.createOscillator();
  osc1.type = state.settings.waveform;
  osc1.frequency.value = freq;

  // Chorus oscillator (slightly detuned for richness)
  const osc2 = ctx.createOscillator();
  osc2.type = state.settings.waveform;
  osc2.frequency.value = freq * 1.003;

  // Low-pass filter for warmth
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = Math.min(freq * 4, 8000);
  filter.Q.value = 0.7;

  // Gain with ADSR envelope
  const gain = ctx.createGain();
  const start = ctx.currentTime + delayStart;
  const attack = Math.min(0.04, duration * 0.1);
  const decayEnd = start + attack + 0.1;
  const peakLevel = vol * 0.28;
  const sustainLevel = Math.max(vol * 0.2, 0.001);
  const release = Math.min(0.15, duration * 0.25);
  const releaseStart = start + duration - release;

  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(peakLevel, start + attack);
  gain.gain.exponentialRampToValueAtTime(sustainLevel, decayEnd);
  if (releaseStart > decayEnd) {
    gain.gain.setValueAtTime(sustainLevel, releaseStart);
  }
  gain.gain.linearRampToValueAtTime(0.0001, start + duration);

  // Connect graph
  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(start);
  osc1.stop(start + duration + 0.02);
  osc2.start(start);
  osc2.stop(start + duration + 0.02);
}

function playNote(midi, duration, delayStart, gainMult) {
  playTone(midiToFreq(midi), duration, delayStart, gainMult);
}

function playReferenceTone() {
  playTone(440, 0.8);
}

function playMajorScale() {
  const midi = state.currentQuestion.midi || state.currentQuestion.rootMidi;
  if (!midi) return;
  const octave = Math.floor(midi / 12) - 1;
  const rootMidi = (octave + 1) * 12;
  const dur = 0.35;
  const gap = 0.05;
  MAJOR_SCALE_STEPS.forEach(function (step, i) {
    playNote(rootMidi + step, dur, i * (dur + gap));
  });
}

function playCurrentQuestion() {
  var diff = getEffectiveDifficulty();
  var dur = diff.noteDuration;
  var offset = 0;

  if (state.settings.referenceTone) {
    playReferenceTone();
    offset = 1.0;
  }

  if (state.mode === 'note') {
    playNote(state.currentQuestion.midi, dur, offset);
  } else if (state.mode === 'interval') {
    playNote(state.currentQuestion.midi1, dur, offset);
    playNote(state.currentQuestion.midi2, dur, offset + dur + 0.15);
  } else if (state.mode === 'chord') {
    var midiNotes = state.currentQuestion.midiNotes;
    var perNoteGain = 1.0 / Math.sqrt(midiNotes.length);
    midiNotes.forEach(function (m) {
      playNote(m, dur * 1.5, offset, perNoteGain);
    });
  }
}

// ── 3. State ─────────────────────────────────

var state = {
  mode: null,           // 'note' | 'interval' | 'chord'
  difficulty: 'easy',   // 'easy' | 'medium' | 'hard' | 'adaptive'
  screen: 'menu',
  previousScreen: 'menu',
  score: { correct: 0, total: 0 },
  streak: 0,
  bestStreak: { note: 0, interval: 0, chord: 0 },
  replaysUsed: 0,
  currentQuestion: null,
  userAnswer: null,
  hintUsed: false,
  timedMode: false,
  timerInterval: null,
  timerRemaining: TIMED_DURATION,
  timedAnswering: false,   // prevents double-answers in timed mode
  adaptive: {
    tier: 0,
    history: [],
  },
  settings: {
    octaveMin: 3,
    octaveMax: 5,
    waveform: 'triangle',
    volume: 0.6,
    referenceTone: false,
  },
};

// ── 4. Stats ─────────────────────────────────

function defaultStats() {
  return {
    items: { note: {}, interval: {}, chord: {} },
    timedBest: { note: 0, interval: 0, chord: 0 },
    totalCorrect: 0,
    totalQuestions: 0,
  };
}

var stats = defaultStats();

function recordStat(mode, itemKey, isCorrect) {
  if (!stats.items[mode]) stats.items[mode] = {};
  if (!stats.items[mode][itemKey]) stats.items[mode][itemKey] = [0, 0];
  stats.items[mode][itemKey][1]++;
  if (isCorrect) stats.items[mode][itemKey][0]++;
  stats.totalQuestions++;
  if (isCorrect) stats.totalCorrect++;
  saveData();
}

function getItemStats(mode) {
  var items = stats.items[mode] || {};
  return Object.keys(items).map(function (name) {
    var c = items[name][0];
    var t = items[name][1];
    return {
      name: name,
      correct: c,
      total: t,
      pct: t > 0 ? Math.round((c / t) * 100) : 0,
    };
  }).sort(function (a, b) { return a.pct - b.pct; });
}

function getWeakest(mode, n) {
  n = n || 3;
  return getItemStats(mode).filter(function (s) { return s.total >= 3; }).slice(0, n);
}

// ── 5. Persistence ───────────────────────────

function saveData() {
  try {
    localStorage.setItem('pitchTrainer', JSON.stringify({
      bestStreak: state.bestStreak,
      settings: state.settings,
      stats: stats,
    }));
  } catch (e) { /* ignore */ }
}

function loadData() {
  try {
    var raw = localStorage.getItem('pitchTrainer');
    if (!raw) return;
    var data = JSON.parse(raw);

    // Handle old format (single bestStreak number)
    if (typeof data.bestStreak === 'number') {
      state.bestStreak = { note: data.bestStreak, interval: data.bestStreak, chord: 0 };
    } else if (data.bestStreak) {
      state.bestStreak.note = data.bestStreak.note || 0;
      state.bestStreak.interval = data.bestStreak.interval || 0;
      state.bestStreak.chord = data.bestStreak.chord || 0;
    }

    if (data.settings) {
      Object.assign(state.settings, data.settings);
      // Ensure volume exists (old saves may not have it)
      if (typeof state.settings.volume !== 'number') {
        state.settings.volume = 0.6;
      }
    }

    if (data.stats) {
      stats = Object.assign(defaultStats(), data.stats);
      // Ensure sub-objects
      if (!stats.items) stats.items = { note: {}, interval: {}, chord: {} };
      if (!stats.items.note) stats.items.note = {};
      if (!stats.items.interval) stats.items.interval = {};
      if (!stats.items.chord) stats.items.chord = {};
      if (!stats.timedBest) stats.timedBest = { note: 0, interval: 0, chord: 0 };
    }
  } catch (e) { /* ignore */ }
}

// ── 6. Difficulty & Adaptive ─────────────────

function getEffectiveDifficulty() {
  if (state.difficulty !== 'adaptive') {
    return DIFFICULTY[state.difficulty];
  }
  var tiers = ADAPTIVE_TIERS[state.mode];
  if (!tiers) return DIFFICULTY.easy;
  var tier = Math.min(state.adaptive.tier, tiers.length - 1);
  var tc = tiers[tier];
  return {
    noteDuration: tc.noteDuration,
    replayLimit: tc.replayLimit,
    notePool: tc.notePool || 'natural',
    intervalPool: tc.intervalPool || 'easy',
    chordPool: tc.chordPool || 'basic',
  };
}

function getAdaptiveLabel() {
  var tiers = ADAPTIVE_TIERS[state.mode];
  if (!tiers) return '';
  var tier = Math.min(state.adaptive.tier, tiers.length - 1);
  return tiers[tier].label;
}

function updateAdaptive(isCorrect) {
  if (state.difficulty !== 'adaptive') return;

  state.adaptive.history.push(isCorrect);
  if (state.adaptive.history.length > 10) state.adaptive.history.shift();

  if (state.adaptive.history.length >= 5) {
    var correct = state.adaptive.history.filter(Boolean).length;
    var acc = correct / state.adaptive.history.length;
    var maxTier = (ADAPTIVE_TIERS[state.mode] || []).length - 1;

    if (acc >= 0.8 && state.adaptive.tier < maxTier) {
      state.adaptive.tier++;
      state.adaptive.history = [];
    } else if (acc < 0.4 && state.adaptive.tier > 0) {
      state.adaptive.tier--;
      state.adaptive.history = [];
    }
  }
}

// ── 7. Question Generation ───────────────────

function getMidiRange() {
  var low = (state.settings.octaveMin + 1) * 12;
  var high = (state.settings.octaveMax + 1) * 12 + 11;
  return { low: low, high: high };
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateNoteQuestion() {
  var range = getMidiRange();
  var diff = getEffectiveDifficulty();
  var midi;

  if (diff.notePool === 'natural') {
    var naturals = [];
    for (var m = range.low; m <= range.high; m++) {
      if (NATURAL_NOTES.indexOf(NOTE_NAMES[m % 12]) !== -1) {
        naturals.push(m);
      }
    }
    midi = naturals[randomInt(0, naturals.length - 1)];
  } else {
    midi = randomInt(range.low, range.high);
  }

  return { midi: midi, answer: noteNameFromMidi(midi) };
}

function generateIntervalQuestion() {
  var range = getMidiRange();
  var diff = getEffectiveDifficulty();
  var pool;

  if (diff.intervalPool === 'easy') {
    pool = INTERVALS.filter(function (i) { return EASY_INTERVALS.indexOf(i.semitones) !== -1; });
  } else {
    pool = INTERVALS.slice();
  }

  var interval = pool[randomInt(0, pool.length - 1)];
  var ascending = true;

  if (diff.intervalPool === 'all+descending' && interval.semitones > 0) {
    ascending = Math.random() < 0.5;
  }

  var midi1, midi2;
  if (ascending) {
    midi1 = randomInt(range.low, Math.max(range.low, range.high - interval.semitones));
    midi2 = midi1 + interval.semitones;
  } else {
    midi1 = randomInt(Math.min(range.high, range.low + interval.semitones), range.high);
    midi2 = midi1 - interval.semitones;
  }

  var dirLabel = ascending ? '' : ' (desc)';
  return {
    midi1: midi1,
    midi2: midi2,
    semitones: interval.semitones,
    ascending: ascending,
    answer: interval.name + dirLabel,
  };
}

function generateChordQuestion() {
  var range = getMidiRange();
  var diff = getEffectiveDifficulty();
  var pool;

  if (diff.chordPool === 'basic') {
    pool = CHORDS.filter(function (c) { return c.pool === 'basic'; });
  } else if (diff.chordPool === 'triads') {
    pool = CHORDS.filter(function (c) { return c.pool === 'basic' || c.pool === 'triads'; });
  } else {
    pool = CHORDS.slice();
  }

  var chord = pool[randomInt(0, pool.length - 1)];
  var maxSemitone = Math.max.apply(null, chord.semitones);
  var rootMidi = randomInt(range.low, Math.max(range.low, range.high - maxSemitone));
  var midiNotes = chord.semitones.map(function (s) { return rootMidi + s; });

  return {
    rootMidi: rootMidi,
    midiNotes: midiNotes,
    answer: chord.name,
  };
}

function generateQuestion() {
  if (state.mode === 'note') {
    state.currentQuestion = generateNoteQuestion();
  } else if (state.mode === 'interval') {
    state.currentQuestion = generateIntervalQuestion();
  } else {
    state.currentQuestion = generateChordQuestion();
  }
  state.replaysUsed = 0;
  state.userAnswer = null;
  state.hintUsed = false;
}

// ── 8. Answer Choices ────────────────────────

function getNoteChoices() {
  var diff = getEffectiveDifficulty();
  return diff.notePool === 'natural' ? NATURAL_NOTES.slice() : NOTE_NAMES.slice();
}

function getIntervalChoices() {
  var diff = getEffectiveDifficulty();

  if (diff.intervalPool === 'easy') {
    return INTERVALS.filter(function (i) {
      return EASY_INTERVALS.indexOf(i.semitones) !== -1;
    }).map(function (i) { return i.name; });
  }

  var names = INTERVALS.map(function (i) { return i.name; });

  if (diff.intervalPool === 'all+descending') {
    var desc = INTERVALS.filter(function (i) { return i.semitones > 0; })
      .map(function (i) { return i.name + ' (desc)'; });
    return names.concat(desc);
  }

  return names;
}

function getChordChoices() {
  var diff = getEffectiveDifficulty();

  if (diff.chordPool === 'basic') {
    return CHORDS.filter(function (c) { return c.pool === 'basic'; })
      .map(function (c) { return c.name; });
  }
  if (diff.chordPool === 'triads') {
    return CHORDS.filter(function (c) { return c.pool === 'basic' || c.pool === 'triads'; })
      .map(function (c) { return c.name; });
  }
  return CHORDS.map(function (c) { return c.name; });
}

function getChoices() {
  if (state.mode === 'note') return getNoteChoices();
  if (state.mode === 'interval') return getIntervalChoices();
  return getChordChoices();
}

// ── 9. Piano Renderer ────────────────────────

function renderPiano(container, highlights) {
  highlights = highlights || {};
  container.innerHTML = '';

  var minOct = state.settings.octaveMin;
  var maxOct = Math.min(state.settings.octaveMax, minOct + 2); // max 3 octaves displayed
  var startMidi = (minOct + 1) * 12;     // C of minOct
  var endMidi = (maxOct + 1) * 12 + 11;  // B of maxOct

  var piano = document.createElement('div');
  piano.className = 'piano-keyboard';

  // Count white keys for width calculation
  var whiteCount = 0;
  for (var m = startMidi; m <= endMidi; m++) {
    if (!BLACK_NOTE_INDICES.has(m % 12)) whiteCount++;
  }

  if (whiteCount === 0) {
    container.appendChild(piano);
    return;
  }

  var whiteW = 100 / whiteCount;
  var blackW = whiteW * 0.65;
  var wIdx = 0;

  // Render white keys first (lower z-index)
  var wIdxTemp = 0;
  for (var m = startMidi; m <= endMidi; m++) {
    var noteIdx = m % 12;
    if (BLACK_NOTE_INDICES.has(noteIdx)) continue;

    var key = document.createElement('div');
    key.className = 'piano-key white';
    key.dataset.midi = m;
    key.style.left = (wIdxTemp * whiteW) + '%';
    key.style.width = whiteW + '%';

    if (highlights[m]) key.classList.add(highlights[m]);
    piano.appendChild(key);
    wIdxTemp++;
  }

  // Render black keys (higher z-index)
  wIdx = 0;
  for (var m = startMidi; m <= endMidi; m++) {
    var noteIdx = m % 12;
    var isBlack = BLACK_NOTE_INDICES.has(noteIdx);

    if (!isBlack) {
      wIdx++;
      continue;
    }

    var key = document.createElement('div');
    key.className = 'piano-key black';
    key.dataset.midi = m;
    key.style.left = (wIdx * whiteW - blackW / 2) + '%';
    key.style.width = blackW + '%';

    if (highlights[m]) key.classList.add(highlights[m]);
    piano.appendChild(key);
  }

  container.appendChild(piano);
}

function getQuestionMidis() {
  if (!state.currentQuestion) return [];
  if (state.mode === 'note') return [state.currentQuestion.midi];
  if (state.mode === 'interval') return [state.currentQuestion.midi1, state.currentQuestion.midi2];
  if (state.mode === 'chord') return state.currentQuestion.midiNotes.slice();
  return [];
}

function makeHighlights(midis, className) {
  var h = {};
  midis.forEach(function (m) { h[m] = className; });
  return h;
}

// ── 10. Timer ────────────────────────────────

function startTimer() {
  state.timerRemaining = TIMED_DURATION;
  updateTimerDisplay();
  els.timerBar.style.display = '';

  state.timerInterval = setInterval(function () {
    state.timerRemaining--;
    updateTimerDisplay();

    if (state.timerRemaining <= 0) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
      endTimedChallenge();
    }
  }, 1000);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

function updateTimerDisplay() {
  var pct = (state.timerRemaining / TIMED_DURATION) * 100;
  els.timerFill.style.width = pct + '%';
  els.timerText.textContent = state.timerRemaining;

  if (state.timerRemaining <= 10) {
    els.timerFill.className = 'timer-fill danger';
  } else if (state.timerRemaining <= 20) {
    els.timerFill.className = 'timer-fill warning';
  } else {
    els.timerFill.className = 'timer-fill';
  }
}

function endTimedChallenge() {
  stopTimer();
  state.timedAnswering = false;

  var mode = state.mode;
  var score = state.score.correct;
  var isNewBest = score > (stats.timedBest[mode] || 0);

  if (isNewBest) {
    stats.timedBest[mode] = score;
    saveData();
  }

  showScreen('timed-result');
  renderTimedResult(isNewBest);
}

function showCountdown(callback) {
  var overlay = els.countdownOverlay;
  var numberEl = els.countdownNumber;
  var count = 3;

  overlay.style.display = 'flex';
  overlay.classList.remove('fade-out');
  numberEl.textContent = count;

  var interval = setInterval(function () {
    count--;
    if (count > 0) {
      numberEl.textContent = count;
    } else {
      clearInterval(interval);
      overlay.classList.add('fade-out');
      setTimeout(function () {
        overlay.style.display = 'none';
        overlay.classList.remove('fade-out');
        callback();
      }, 250);
    }
  }, 800);
}

// ── 11. Hints ────────────────────────────────

function applyHint() {
  if (state.hintUsed) return;
  state.hintUsed = true;

  var correctAnswer = state.currentQuestion.answer;
  var btns = els.answerGrid.querySelectorAll('.answer-btn:not(.eliminated)');

  var wrongBtns = [];
  btns.forEach(function (btn) {
    if (btn.dataset.answer !== correctAnswer) wrongBtns.push(btn);
  });

  // Shuffle and eliminate half
  var toEliminate = Math.max(1, Math.floor(wrongBtns.length / 2));
  for (var i = wrongBtns.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = wrongBtns[i];
    wrongBtns[i] = wrongBtns[j];
    wrongBtns[j] = temp;
  }

  for (var i = 0; i < toEliminate; i++) {
    wrongBtns[i].classList.add('eliminated');
  }

  els.hintBtn.disabled = true;
  els.hintBtn.classList.add('used');
}

// ── 12. DOM References ───────────────────────

var $ = function (sel) { return document.querySelector(sel); };
var $$ = function (sel) { return document.querySelectorAll(sel); };

var screens = {};
var els = {};

function initDomRefs() {
  screens = {
    menu: $('#screen-menu'),
    playing: $('#screen-playing'),
    result: $('#screen-result'),
    settings: $('#screen-settings'),
    stats: $('#screen-stats'),
    'timed-result': $('#screen-timed-result'),
  };

  els = {
    settingsBtn: $('#settings-btn'),
    statsBtn: $('#stats-btn'),
    scoreDisplay: $('#score-display'),
    streakDisplay: $('#streak-display'),
    resultScoreDisplay: $('#result-score-display'),
    resultStreakDisplay: $('#result-streak-display'),
    questionText: $('#question-text'),
    adaptiveLevel: $('#adaptive-level'),
    replayBtn: $('#replay-btn'),
    replayCount: $('#replay-count'),
    hintBtn: $('#hint-btn'),
    scaleBtn: $('#scale-btn'),
    backToMenuBtn: $('#back-to-menu-btn'),
    answerGrid: $('#answer-grid'),
    pianoContainer: $('#piano-container'),
    resultFeedback: $('#result-feedback'),
    resultText: $('#result-text'),
    resultDetail: $('#result-detail'),
    resultPianoContainer: $('#result-piano-container'),
    resultAnswerGrid: $('#result-answer-grid'),
    nextBtn: $('#next-btn'),
    timerBar: $('#timer-bar'),
    timerFill: $('#timer-fill'),
    timerText: $('#timer-text'),
    timedMode: $('#timed-mode'),
    timedFinalScore: $('#timed-final-score'),
    timedAccuracy: $('#timed-accuracy'),
    timedBestDisplay: $('#timed-best-display'),
    timedRetryBtn: $('#timed-retry-btn'),
    timedMenuBtn: $('#timed-menu-btn'),
    statsContent: $('#stats-content'),
    statsBackBtn: $('#stats-back-btn'),
    octaveMin: $('#octave-min'),
    octaveMax: $('#octave-max'),
    waveform: $('#waveform'),
    volumeSlider: $('#volume-slider'),
    volumeDisplay: $('#volume-display'),
    refTone: $('#ref-tone'),
    resetScoreBtn: $('#reset-score-btn'),
    resetStatsBtn: $('#reset-stats-btn'),
    settingsBackBtn: $('#settings-back-btn'),
    countdownOverlay: $('#countdown-overlay'),
    countdownNumber: $('#countdown-number'),
  };
}

// ── 13. Screen Management ────────────────────

function showScreen(name) {
  state.screen = name;
  Object.keys(screens).forEach(function (key) {
    screens[key].classList.remove('active');
  });
  if (screens[name]) screens[name].classList.add('active');
}

// ── 14. Render Functions ─────────────────────

function renderScoreBar() {
  var correct = state.score.correct;
  var total = state.score.total;
  var pct = total === 0 ? 0 : Math.round((correct / total) * 100);
  var scoreText = correct + ' / ' + total + ' (' + pct + '%)';
  var bestStreak = state.mode ? (state.bestStreak[state.mode] || 0) : 0;
  var streakText = 'Streak: ' + state.streak + ' | Best: ' + bestStreak;

  els.scoreDisplay.textContent = scoreText;
  els.streakDisplay.textContent = streakText;
  els.resultScoreDisplay.textContent = scoreText;
  els.resultStreakDisplay.textContent = streakText;
}

function renderReplayButton() {
  var limit = getEffectiveDifficulty().replayLimit;
  if (limit === Infinity) {
    els.replayCount.textContent = '';
    els.replayBtn.disabled = false;
  } else {
    var remaining = limit - state.replaysUsed;
    els.replayCount.textContent = ' (' + remaining + ' left)';
    els.replayBtn.disabled = remaining <= 0;
  }
}

function buildAnswerButtons(container, choices, clickHandler) {
  container.innerHTML = '';
  choices.forEach(function (choice, idx) {
    var btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.dataset.answer = choice;

    var keyNum = idx < 9 ? idx + 1 : (idx === 9 ? 0 : null);
    if (keyNum !== null) {
      var hint = document.createElement('span');
      hint.className = 'key-hint';
      hint.textContent = keyNum;
      btn.appendChild(hint);
    }

    var label = document.createTextNode(choice);
    btn.appendChild(label);

    btn.addEventListener('click', function () { clickHandler(choice); });
    container.appendChild(btn);
  });
}

function renderPlayingScreen() {
  var choices = getChoices();

  if (state.mode === 'note') {
    els.questionText.textContent = 'What note is this?';
  } else if (state.mode === 'interval') {
    els.questionText.textContent = 'What interval is this?';
  } else {
    els.questionText.textContent = 'What chord is this?';
  }

  buildAnswerButtons(els.answerGrid, choices, handleAnswer);
  renderScoreBar();
  renderReplayButton();

  // Scale button: only in note mode and not timed
  els.scaleBtn.style.display = (state.mode === 'note' && !state.timedMode) ? '' : 'none';

  // Hint button
  els.hintBtn.disabled = false;
  els.hintBtn.classList.remove('used');

  // Adaptive level display
  if (state.difficulty === 'adaptive') {
    els.adaptiveLevel.style.display = '';
    els.adaptiveLevel.textContent = getAdaptiveLabel();
  } else {
    els.adaptiveLevel.style.display = 'none';
  }

  // Piano (no highlights during play — don't give away note ID answers)
  renderPiano(els.pianoContainer);
}

function renderResultScreen(isCorrect) {
  var correctAnswer = state.currentQuestion.answer;
  var choices = getChoices();

  // Feedback banner
  els.resultFeedback.className = 'result-feedback ' + (isCorrect ? 'correct' : 'incorrect');
  els.resultText.textContent = isCorrect ? 'Correct!' : 'Incorrect';

  if (isCorrect) {
    els.resultDetail.textContent = 'The answer was ' + correctAnswer + '.';
  } else {
    els.resultDetail.textContent = 'You answered ' + state.userAnswer + '. The correct answer was ' + correctAnswer + '.';
  }

  // Piano with highlighted correct notes
  var midis = getQuestionMidis();
  var highlights = makeHighlights(midis, 'correct-key');
  renderPiano(els.resultPianoContainer, highlights);

  // Frozen answer grid
  buildAnswerButtons(els.resultAnswerGrid, choices, function () {});
  var resultBtns = els.resultAnswerGrid.querySelectorAll('.answer-btn');
  resultBtns.forEach(function (btn) {
    if (btn.dataset.answer === correctAnswer) {
      btn.classList.add('correct');
    }
    if (!isCorrect && btn.dataset.answer === state.userAnswer) {
      btn.classList.add('incorrect');
    }
  });

  renderScoreBar();
}

function renderTimedResult(isNewBest) {
  els.timedFinalScore.textContent = state.score.correct;

  var total = state.score.total;
  var pct = total === 0 ? 0 : Math.round((state.score.correct / total) * 100);
  els.timedAccuracy.textContent = state.score.correct + ' of ' + total + ' correct (' + pct + '%)';

  var best = stats.timedBest[state.mode] || 0;
  if (isNewBest) {
    els.timedBestDisplay.textContent = 'New Best Score!';
    els.timedBestDisplay.className = 'timed-best new-best';
  } else {
    els.timedBestDisplay.textContent = 'Best: ' + best;
    els.timedBestDisplay.className = 'timed-best';
  }
}

function applySettingsToUI() {
  els.octaveMin.value = state.settings.octaveMin;
  els.octaveMax.value = state.settings.octaveMax;
  els.waveform.value = state.settings.waveform;
  els.volumeSlider.value = Math.round(state.settings.volume * 100);
  els.volumeDisplay.textContent = Math.round(state.settings.volume * 100) + '%';
  els.refTone.checked = state.settings.referenceTone;
}

// ── 15. Stats Renderer ───────────────────────

var currentStatsTab = 'overview';

function renderStatsScreen() {
  var content = els.statsContent;
  content.innerHTML = '';

  if (currentStatsTab === 'overview') {
    renderStatsOverview(content);
  } else {
    renderStatsMode(content, currentStatsTab);
  }
}

function renderStatsOverview(container) {
  var overallPct = stats.totalQuestions > 0
    ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
    : 0;

  // Summary cards
  var cardsHtml = '<div class="stats-overview">' +
    '<div class="stat-card"><div class="stat-number">' + stats.totalQuestions + '</div><div class="stat-label">Questions Answered</div></div>' +
    '<div class="stat-card"><div class="stat-number">' + overallPct + '%</div><div class="stat-label">Overall Accuracy</div></div>' +
    '<div class="stat-card"><div class="stat-number">' + (state.bestStreak.note || 0) + '</div><div class="stat-label">Best Streak (Notes)</div></div>' +
    '<div class="stat-card"><div class="stat-number">' + (state.bestStreak.interval || 0) + '</div><div class="stat-label">Best Streak (Intervals)</div></div>' +
    '<div class="stat-card"><div class="stat-number">' + (state.bestStreak.chord || 0) + '</div><div class="stat-label">Best Streak (Chords)</div></div>' +
    '<div class="stat-card"><div class="stat-number">' + stats.totalCorrect + '</div><div class="stat-label">Total Correct</div></div>' +
    '</div>';

  // Timed bests
  var timedHtml = '<div class="timed-bests">' +
    '<div class="timed-best-card"><div class="mode-name">Notes</div><div class="best-score">' + (stats.timedBest.note || 0) + '</div></div>' +
    '<div class="timed-best-card"><div class="mode-name">Intervals</div><div class="best-score">' + (stats.timedBest.interval || 0) + '</div></div>' +
    '<div class="timed-best-card"><div class="mode-name">Chords</div><div class="best-score">' + (stats.timedBest.chord || 0) + '</div></div>' +
    '</div>';

  container.innerHTML = cardsHtml +
    '<h3 style="font-size:0.9rem;color:var(--text-secondary);margin-top:4px;">Timed Challenge Bests</h3>' +
    timedHtml;

  // Weak areas across all modes
  var allWeak = [];
  ['note', 'interval', 'chord'].forEach(function (mode) {
    getWeakest(mode, 2).forEach(function (item) {
      allWeak.push({ mode: mode, name: item.name, pct: item.pct, total: item.total, correct: item.correct });
    });
  });

  if (allWeak.length > 0) {
    allWeak.sort(function (a, b) { return a.pct - b.pct; });
    var weakHtml = '<div class="weak-areas"><h3>Areas to Practice</h3>';
    allWeak.slice(0, 5).forEach(function (w) {
      weakHtml += '<div class="weak-item">' + w.name + ' (' + w.mode + ') - ' + w.pct + '% (' + w.correct + '/' + w.total + ')</div>';
    });
    weakHtml += '</div>';
    container.innerHTML += weakHtml;
  }
}

function renderStatsMode(container, mode) {
  var items = getItemStats(mode);

  if (items.length === 0) {
    container.innerHTML = '<div class="stats-empty">No data yet. Play some rounds to see your stats!</div>';
    return;
  }

  // Sort alphabetically for display (override the accuracy sort for readability)
  var sorted = items.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });

  var html = '<div class="stats-bars">';
  sorted.forEach(function (item) {
    var fillClass = item.total === 0 ? 'none' : (item.pct >= 75 ? 'good' : (item.pct >= 50 ? 'ok' : 'weak'));
    var width = item.total === 0 ? 0 : item.pct;
    html += '<div class="stat-row">' +
      '<span class="stat-name">' + item.name + '</span>' +
      '<div class="stat-bar-track"><div class="stat-bar-fill ' + fillClass + '" style="width:' + width + '%"></div></div>' +
      '<span class="stat-detail">' + item.pct + '% (' + item.correct + '/' + item.total + ')</span>' +
      '</div>';
  });
  html += '</div>';

  container.innerHTML = html;

  // Show weakest
  var weakest = getWeakest(mode, 3);
  if (weakest.length > 0) {
    var weakHtml = '<div class="weak-areas"><h3>Focus Areas</h3>';
    weakest.forEach(function (w) {
      weakHtml += '<div class="weak-item">' + w.name + ' - ' + w.pct + '% accuracy (' + w.correct + '/' + w.total + ')</div>';
    });
    weakHtml += '</div>';
    container.innerHTML += weakHtml;
  }
}

// ── 16. Event Handlers ───────────────────────

function handleModeSelect(mode) {
  ensureAudioContext();
  state.mode = mode;
  state.score = { correct: 0, total: 0 };
  state.streak = 0;
  state.timedAnswering = false;
  state.adaptive.tier = 0;
  state.adaptive.history = [];
  state.timedMode = els.timedMode.checked;

  generateQuestion();
  showScreen('playing');
  renderPlayingScreen();

  // Timer bar visibility
  els.timerBar.style.display = state.timedMode ? '' : 'none';

  if (state.timedMode) {
    showCountdown(function () {
      startTimer();
      playCurrentQuestion();
    });
  } else {
    playCurrentQuestion();
  }
}

function handleAnswer(answer) {
  // Prevent double-answers in timed mode during transition
  if (state.timedAnswering) return;
  // Prevent answering after time runs out
  if (state.timedMode && state.timerRemaining <= 0) return;

  state.userAnswer = answer;
  var isCorrect = answer === state.currentQuestion.answer;

  state.score.total++;
  if (isCorrect) {
    state.score.correct++;
    state.streak++;
    var modeStreak = state.bestStreak[state.mode] || 0;
    if (state.streak > modeStreak) {
      state.bestStreak[state.mode] = state.streak;
      saveData();
    }
  } else {
    state.streak = 0;
  }

  // Record stats
  recordStat(state.mode, state.currentQuestion.answer, isCorrect);
  updateAdaptive(isCorrect);

  if (state.timedMode) {
    // Flash feedback directly on playing screen
    state.timedAnswering = true;
    flashTimedFeedback(answer, isCorrect);
    renderScoreBar();

    var delay = isCorrect ? 350 : 650;
    setTimeout(function () {
      state.timedAnswering = false;
      if (state.screen === 'playing' && state.timedMode && state.timerRemaining > 0) {
        generateQuestion();
        renderPlayingScreen();
        playCurrentQuestion();
      }
    }, delay);
  } else {
    showScreen('result');
    renderResultScreen(isCorrect);
  }
}

function flashTimedFeedback(answer, isCorrect) {
  var btns = els.answerGrid.querySelectorAll('.answer-btn');

  // Disable all
  btns.forEach(function (btn) { btn.disabled = true; });

  // Highlight correct answer
  btns.forEach(function (btn) {
    if (btn.dataset.answer === state.currentQuestion.answer) {
      btn.classList.add('correct');
    }
    if (!isCorrect && btn.dataset.answer === answer) {
      btn.classList.add('incorrect');
    }
  });
}

function handleReplay() {
  var limit = getEffectiveDifficulty().replayLimit;
  if (state.replaysUsed >= limit) return;
  state.replaysUsed++;
  renderReplayButton();
  playCurrentQuestion();
}

function handleNext() {
  generateQuestion();
  showScreen('playing');
  renderPlayingScreen();
  playCurrentQuestion();
}

function handleDifficulty(diff) {
  state.difficulty = diff;
  $$('.diff-btn').forEach(function (b) { b.classList.remove('active'); });
  var active = document.querySelector('.diff-btn[data-difficulty="' + diff + '"]');
  if (active) active.classList.add('active');
}

function handleSettingsOpen() {
  // Prevent opening settings during timed game (timer would keep running)
  if (state.timedMode && state.timerInterval) return;
  state.previousScreen = state.screen;
  applySettingsToUI();
  showScreen('settings');
}

function handleSettingsBack() {
  state.settings.octaveMin = parseInt(els.octaveMin.value, 10);
  state.settings.octaveMax = parseInt(els.octaveMax.value, 10);

  if (state.settings.octaveMin >= state.settings.octaveMax) {
    state.settings.octaveMax = state.settings.octaveMin + 1;
  }

  state.settings.waveform = els.waveform.value;
  state.settings.volume = parseInt(els.volumeSlider.value, 10) / 100;
  state.settings.referenceTone = els.refTone.checked;
  saveData();

  showScreen(state.previousScreen);
}

function handleStatsOpen() {
  // Prevent opening stats during timed game (timer would keep running)
  if (state.timedMode && state.timerInterval) return;
  state.previousScreen = state.screen;
  currentStatsTab = 'overview';
  updateStatsTabUI();
  renderStatsScreen();
  showScreen('stats');
}

function handleStatsBack() {
  showScreen(state.previousScreen);
}

function handleStatsTab(tab) {
  currentStatsTab = tab;
  updateStatsTabUI();
  renderStatsScreen();
}

function updateStatsTabUI() {
  $$('.stats-tab').forEach(function (t) { t.classList.remove('active'); });
  var active = document.querySelector('.stats-tab[data-tab="' + currentStatsTab + '"]');
  if (active) active.classList.add('active');
}

function handleResetScore() {
  state.score = { correct: 0, total: 0 };
  state.streak = 0;
  state.bestStreak = { note: 0, interval: 0, chord: 0 };
  saveData();
  renderScoreBar();
}

function handleResetStats() {
  stats = defaultStats();
  state.bestStreak = { note: 0, interval: 0, chord: 0 };
  saveData();
}

function handleBackToMenu() {
  stopTimer();
  state.timedMode = false;
  state.timedAnswering = false;
  showScreen('menu');
}

function handleTimedRetry() {
  if (!state.mode) return;
  handleModeSelect(state.mode);
}

// ── 17. Keyboard Shortcuts ───────────────────

function handleKeyboard(e) {
  if (state.screen === 'settings' || state.screen === 'menu' || state.screen === 'stats') return;

  var key = e.key;

  if (state.screen === 'playing' && !state.timedAnswering) {
    if (key >= '1' && key <= '9') {
      var idx = parseInt(key, 10) - 1;
      var btns = els.answerGrid.querySelectorAll('.answer-btn:not(.eliminated):not(:disabled)');
      var allBtns = els.answerGrid.querySelectorAll('.answer-btn');
      // Find the idx-th button by original index
      if (idx < allBtns.length && !allBtns[idx].classList.contains('eliminated') && !allBtns[idx].disabled) {
        allBtns[idx].click();
      }
    } else if (key === '0') {
      var allBtns = els.answerGrid.querySelectorAll('.answer-btn');
      if (allBtns.length >= 10 && !allBtns[9].classList.contains('eliminated') && !allBtns[9].disabled) {
        allBtns[9].click();
      }
    } else if (key === 'r' || key === 'R') {
      handleReplay();
    } else if (key === 'h' || key === 'H') {
      if (!state.hintUsed) applyHint();
    } else if ((key === 's' || key === 'S') && state.mode === 'note' && !state.timedMode) {
      playMajorScale();
    }
  }

  if (state.screen === 'result') {
    if (key === ' ' || key === 'Enter') {
      e.preventDefault();
      handleNext();
    }
  }

  if (state.screen === 'timed-result') {
    if (key === ' ' || key === 'Enter') {
      e.preventDefault();
      handleTimedRetry();
    }
  }
}

// ── 18. Init ─────────────────────────────────

function init() {
  initDomRefs();
  loadData();

  // Mode buttons
  $$('.mode-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      handleModeSelect(btn.dataset.mode);
    });
  });

  // Difficulty buttons
  $$('.diff-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      handleDifficulty(btn.dataset.difficulty);
    });
  });

  // Playback controls
  els.replayBtn.addEventListener('click', handleReplay);
  els.hintBtn.addEventListener('click', function () {
    if (!state.hintUsed) applyHint();
  });
  els.scaleBtn.addEventListener('click', function () {
    if (state.mode === 'note') playMajorScale();
  });
  els.backToMenuBtn.addEventListener('click', handleBackToMenu);

  // Next button
  els.nextBtn.addEventListener('click', handleNext);

  // Timed result buttons
  els.timedRetryBtn.addEventListener('click', handleTimedRetry);
  els.timedMenuBtn.addEventListener('click', handleBackToMenu);

  // Settings
  els.settingsBtn.addEventListener('click', handleSettingsOpen);
  els.settingsBackBtn.addEventListener('click', handleSettingsBack);
  els.resetScoreBtn.addEventListener('click', handleResetScore);
  els.resetStatsBtn.addEventListener('click', handleResetStats);

  // Volume slider live update
  els.volumeSlider.addEventListener('input', function () {
    els.volumeDisplay.textContent = els.volumeSlider.value + '%';
  });

  // Stats
  els.statsBtn.addEventListener('click', handleStatsOpen);
  els.statsBackBtn.addEventListener('click', handleStatsBack);
  $$('.stats-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      handleStatsTab(tab.dataset.tab);
    });
  });

  // Keyboard
  document.addEventListener('keydown', handleKeyboard);

  // Apply loaded settings to difficulty buttons
  $$('.diff-btn').forEach(function (b) { b.classList.remove('active'); });
  var activeBtn = document.querySelector('.diff-btn[data-difficulty="' + state.difficulty + '"]');
  if (activeBtn) activeBtn.classList.add('active');

  renderScoreBar();
}

document.addEventListener('DOMContentLoaded', init);
