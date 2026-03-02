/* ═══════════════════════════════════════════════
   Pitch Trainer — World-Class Ear Training
   ═══════════════════════════════════════════════ */

// ── 1. Constants ─────────────────────────────

var NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
var NATURAL_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
var BLACK_NOTE_INDICES = new Set([1, 3, 6, 8, 10]);
var MAJOR_SCALE_STEPS = [0, 2, 4, 5, 7, 9, 11, 12];
var MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
var MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10];

var INTERVALS = [
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
var EASY_INTERVALS = [0, 2, 4, 5, 7, 12];

var CHORDS = [
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

var KEYS = [
  { name: 'C Major',  root: 0,  type: 'major' },
  { name: 'G Major',  root: 7,  type: 'major' },
  { name: 'D Major',  root: 2,  type: 'major' },
  { name: 'A Major',  root: 9,  type: 'major' },
  { name: 'F Major',  root: 5,  type: 'major' },
  { name: 'Bb Major', root: 10, type: 'major' },
  { name: 'Eb Major', root: 3,  type: 'major' },
  { name: 'A Minor',  root: 9,  type: 'minor' },
  { name: 'E Minor',  root: 4,  type: 'minor' },
  { name: 'D Minor',  root: 2,  type: 'minor' },
  { name: 'G Minor',  root: 7,  type: 'minor' },
  { name: 'C Minor',  root: 0,  type: 'minor' },
];

var ROMAN_TO_CHORD = {
  'I':   { degree: 0, intervals: [0, 4, 7] },
  'ii':  { degree: 1, intervals: [0, 3, 7] },
  'iii': { degree: 2, intervals: [0, 3, 7] },
  'IV':  { degree: 3, intervals: [0, 4, 7] },
  'V':   { degree: 4, intervals: [0, 4, 7] },
  'vi':  { degree: 5, intervals: [0, 3, 7] },
};

var PROGRESSIONS = [
  { name: 'I - IV - V - I',   numerals: ['I','IV','V','I'],   pool: 'basic' },
  { name: 'I - V - vi - IV',  numerals: ['I','V','vi','IV'],  pool: 'basic' },
  { name: 'I - vi - IV - V',  numerals: ['I','vi','IV','V'],  pool: 'basic' },
  { name: 'ii - V - I',       numerals: ['ii','V','I'],       pool: 'basic' },
  { name: 'I - IV - vi - V',  numerals: ['I','IV','vi','V'],  pool: 'medium' },
  { name: 'vi - IV - I - V',  numerals: ['vi','IV','I','V'],  pool: 'medium' },
  { name: 'I - iii - IV - V', numerals: ['I','iii','IV','V'], pool: 'medium' },
  { name: 'I - V - IV - I',   numerals: ['I','V','IV','I'],   pool: 'medium' },
  { name: 'I - vi - ii - V',  numerals: ['I','vi','ii','V'],  pool: 'hard' },
  { name: 'I - IV - ii - V',  numerals: ['I','IV','ii','V'],  pool: 'hard' },
  { name: 'vi - ii - V - I',  numerals: ['vi','ii','V','I'],  pool: 'hard' },
  { name: 'I - V - vi - iii', numerals: ['I','V','vi','iii'], pool: 'hard' },
];

var DIFFICULTY = {
  easy:   { noteDuration: 1.5, replayLimit: Infinity, notePool: 'natural',   intervalPool: 'easy',           chordPool: 'basic',  progPool: 'basic',  chordInv: false },
  medium: { noteDuration: 1.0, replayLimit: Infinity, notePool: 'chromatic', intervalPool: 'all',            chordPool: 'triads', progPool: 'medium', chordInv: true },
  hard:   { noteDuration: 0.5, replayLimit: 2,        notePool: 'chromatic', intervalPool: 'all+descending', chordPool: 'all',    progPool: 'all',    chordInv: true },
};

var ADAPTIVE_TIERS = {
  note:        [{ notePool:'natural',  noteDuration:1.5, replayLimit:Infinity, label:'Natural Notes' },
                { notePool:'chromatic',noteDuration:1.2, replayLimit:Infinity, label:'All Notes' },
                { notePool:'chromatic',noteDuration:0.7, replayLimit:4,        label:'Fast Chromatic' }],
  interval:    [{ intervalPool:'easy',           noteDuration:1.5, replayLimit:Infinity, label:'Basic Intervals' },
                { intervalPool:'all',            noteDuration:1.0, replayLimit:Infinity, label:'All Intervals' },
                { intervalPool:'all+descending', noteDuration:0.7, replayLimit:3,        label:'All + Descending' }],
  chord:       [{ chordPool:'basic',  noteDuration:2.0, replayLimit:Infinity, chordInv:false, label:'Major & Minor' },
                { chordPool:'triads', noteDuration:1.5, replayLimit:Infinity, chordInv:true,  label:'All Triads' },
                { chordPool:'all',    noteDuration:1.2, replayLimit:3,        chordInv:true,  label:'All Chords' }],
  progression: [{ progPool:'basic',  noteDuration:1.8, replayLimit:Infinity, label:'Common Progressions' },
                { progPool:'medium', noteDuration:1.5, replayLimit:Infinity, label:'More Progressions' },
                { progPool:'all',    noteDuration:1.2, replayLimit:3,        label:'All Progressions' }],
};

var MIDI_TO_DIATONIC = [
  { step: 0, acc: '' },   { step: 0, acc: '#' },
  { step: 1, acc: '' },   { step: 1, acc: '#' },
  { step: 2, acc: '' },   { step: 3, acc: '' },
  { step: 3, acc: '#' },  { step: 4, acc: '' },
  { step: 4, acc: '#' },  { step: 5, acc: '' },
  { step: 5, acc: '#' },  { step: 6, acc: '' },
];

var ACHIEVEMENTS = [
  { id:'first_correct', icon:'1',   name:'First Steps',      desc:'Get your first correct answer' },
  { id:'streak_5',      icon:'5',   name:'On a Roll',        desc:'Get a 5-answer streak' },
  { id:'streak_10',     icon:'10',  name:'Unstoppable',      desc:'Get a 10-answer streak' },
  { id:'streak_25',     icon:'25',  name:'On Fire',          desc:'Get a 25-answer streak' },
  { id:'q_50',          icon:'50',  name:'Getting Started',  desc:'Answer 50 questions' },
  { id:'q_100',         icon:'100', name:'Dedicated',        desc:'Answer 100 questions' },
  { id:'q_500',         icon:'500', name:'Committed',        desc:'Answer 500 questions' },
  { id:'q_1000',        icon:'1K',  name:'Master Listener',  desc:'Answer 1000 questions' },
  { id:'timed_20',      icon:'T20', name:'Speed Listener',   desc:'Score 20+ in a timed challenge' },
  { id:'timed_30',      icon:'T30', name:'Speed Demon',      desc:'Score 30+ in a timed challenge' },
  { id:'all_notes',     icon:'N',   name:'Note Master',      desc:'80%+ on all 12 notes (5+ each)' },
  { id:'all_intervals', icon:'I',   name:'Interval Master',  desc:'80%+ on all intervals (5+ each)' },
  { id:'all_chords',    icon:'C',   name:'Chord Master',     desc:'80%+ on all chords (5+ each)' },
  { id:'adaptive_top',  icon:'A',   name:'Top Tier',         desc:'Reach highest adaptive tier' },
  { id:'perfect_10',    icon:'P',   name:'Perfect Ten',      desc:'10 in a row on Hard' },
];

var TIMED_DURATION = 60;
var isTouchDevice = false;

// ── 2. Audio Engine ──────────────────────────

var audioCtx = null;

function ensureAudioContext() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function midiToFreq(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }
function noteNameFromMidi(midi) { return NOTE_NAMES[midi % 12]; }

function playTone(freq, duration, delayStart, gainMul) {
  delayStart = delayStart || 0;
  gainMul = gainMul || 1;
  if (state.settings.waveform === 'piano') return playPianoTone(freq, duration, delayStart, gainMul);

  var ctx = ensureAudioContext();
  var vol = state.settings.volume * gainMul;
  var osc1 = ctx.createOscillator();
  osc1.type = state.settings.waveform;
  osc1.frequency.value = freq;
  var osc2 = ctx.createOscillator();
  osc2.type = state.settings.waveform;
  osc2.frequency.value = freq * 1.003;
  var filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = Math.min(freq * 4, 8000);
  filter.Q.value = 0.7;
  var gain = ctx.createGain();
  var t = ctx.currentTime + delayStart;
  var att = Math.min(0.04, duration * 0.1);
  var rel = Math.min(0.15, duration * 0.25);
  var peak = vol * 0.28;
  var sus = Math.max(vol * 0.2, 0.001);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(peak, t + att);
  gain.gain.exponentialRampToValueAtTime(sus, t + att + 0.1);
  if (t + duration - rel > t + att + 0.1) gain.gain.setValueAtTime(sus, t + duration - rel);
  gain.gain.linearRampToValueAtTime(0.0001, t + duration);
  osc1.connect(filter); osc2.connect(filter);
  filter.connect(gain); gain.connect(ctx.destination);
  osc1.start(t); osc1.stop(t + duration + 0.02);
  osc2.start(t); osc2.stop(t + duration + 0.02);
}

function playPianoTone(freq, duration, delayStart, gainMul) {
  var ctx = ensureAudioContext();
  var vol = state.settings.volume * (gainMul || 1);
  var t = ctx.currentTime + (delayStart || 0);
  var harmonics = [1, 2, 3, 4, 5, 6];
  var amps = [1, 0.5, 0.25, 0.12, 0.06, 0.03];
  var master = ctx.createGain();
  master.gain.setValueAtTime(0, t);
  master.gain.linearRampToValueAtTime(vol * 0.3, t + 0.005);
  master.gain.exponentialRampToValueAtTime(Math.max(vol * 0.12, 0.001), t + 0.15);
  master.gain.exponentialRampToValueAtTime(Math.max(vol * 0.02, 0.0001), t + duration);
  master.connect(ctx.destination);
  harmonics.forEach(function(h, i) {
    var osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq * h;
    var g = ctx.createGain();
    g.gain.value = amps[i] / harmonics.length;
    osc.connect(g); g.connect(master);
    osc.start(t); osc.stop(t + duration + 0.02);
  });
}

function playNote(midi, dur, delay, gm) { playTone(midiToFreq(midi), dur, delay, gm); }
function playReferenceTone() { playTone(440, 0.8); }

function playMajorScale() {
  var midi = state.currentQuestion.midi || state.currentQuestion.rootMidi;
  if (!midi) return;
  var oct = Math.floor(midi / 12) - 1;
  var root = (oct + 1) * 12;
  MAJOR_SCALE_STEPS.forEach(function(s, i) { playNote(root + s, 0.35, i * 0.4); });
}

function playCadence(keyIdx, callback) {
  var k = KEYS[keyIdx];
  var scale = k.type === 'major' ? MAJOR_SCALE : MINOR_SCALE;
  var base = 60 + k.root;
  var chords = [
    [base + scale[0], base + scale[2], base + scale[4]],
    [base + scale[3], base + scale[5], base + scale[0] + 12],
    [base + scale[4], base + scale[6], base + scale[1] + 12],
    [base + scale[0], base + scale[2], base + scale[4]],
  ];
  var dur = 0.5, gap = 0.1;
  chords.forEach(function(notes, i) {
    var off = i * (dur + gap);
    var gm = 0.7 / Math.sqrt(notes.length);
    notes.forEach(function(m) { playNote(m, dur, off, gm); });
  });
  if (callback) setTimeout(callback, (4 * (dur + gap)) * 1000 + 200);
}

function playProgressionChords(midiChords, dur) {
  var gap = 0.15;
  midiChords.forEach(function(notes, i) {
    var off = i * (dur + gap);
    var gm = 0.7 / Math.sqrt(notes.length);
    notes.forEach(function(m) { playNote(m, dur, off, gm); });
  });
}

function playCurrentQuestion() {
  var diff = getEffectiveDifficulty();
  var dur = diff.noteDuration;
  var offset = 0;
  if (state.settings.referenceTone) { playReferenceTone(); offset = 1.0; }
  if (state.settings.keyContext && state.mode !== 'progression') {
    var refDelay = offset ? offset * 1000 : 0;
    setTimeout(function() {
      playCadence(state.settings.selectedKey, function() { _playQuestionTones(dur); });
    }, refDelay);
  } else {
    _playQuestionTones(dur, offset);
  }
}

function _playQuestionTones(dur, offset) {
  offset = offset || 0;
  if (state.mode === 'note') {
    playNote(state.currentQuestion.midi, dur, offset);
  } else if (state.mode === 'interval') {
    playNote(state.currentQuestion.midi1, dur, offset);
    playNote(state.currentQuestion.midi2, dur, offset + dur + 0.15);
  } else if (state.mode === 'chord') {
    var mn = state.currentQuestion.midiNotes;
    var gm = 1.0 / Math.sqrt(mn.length);
    mn.forEach(function(m) { playNote(m, dur * 1.5, offset, gm); });
  } else if (state.mode === 'progression') {
    playProgressionChords(state.currentQuestion.midiChords, dur);
  }
}

// ── 3. State ─────────────────────────────────

var state = {
  mode: null,
  difficulty: 'easy',
  screen: 'menu',
  previousScreen: 'menu',
  score: { correct: 0, total: 0 },
  streak: 0,
  bestStreak: { note: 0, interval: 0, chord: 0, progression: 0 },
  replaysUsed: 0,
  currentQuestion: null,
  userAnswer: null,
  hintUsed: false,
  timedMode: false,
  timerInterval: null,
  timerRemaining: TIMED_DURATION,
  timedAnswering: false,
  focusedPractice: false,
  adaptive: { tier: 0, history: [] },
  settings: {
    octaveMin: 3, octaveMax: 5,
    waveform: 'triangle', volume: 0.6,
    referenceTone: false,
    keyContext: false, selectedKey: 0,
  },
};

// ── 4. Stats & History ───────────────────────

function defaultStats() {
  return {
    items: { note:{}, interval:{}, chord:{}, progression:{} },
    timedBest: { note:0, interval:0, chord:0, progression:0 },
    totalCorrect: 0, totalQuestions: 0,
    history: [],
    achievements: [],
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
}

function recordHistory(mode, question, userAnswer, correctAnswer, isCorrect) {
  stats.history.unshift({
    mode: mode, q: describeQuestion(question, mode),
    user: userAnswer, correct: correctAnswer, ok: isCorrect, t: Date.now(),
  });
  if (stats.history.length > 50) stats.history.pop();
}

function describeQuestion(q, mode) {
  if (mode === 'note') return noteNameFromMidi(q.midi) + (Math.floor(q.midi / 12) - 1);
  if (mode === 'interval') return noteNameFromMidi(q.midi1) + '-' + noteNameFromMidi(q.midi2);
  if (mode === 'chord') return NOTE_NAMES[q.rootMidi % 12] + ' ' + q.answer;
  if (mode === 'progression') return q.answer;
  return '';
}

function getItemStats(mode) {
  var items = stats.items[mode] || {};
  return Object.keys(items).map(function(name) {
    var c = items[name][0], t = items[name][1];
    return { name:name, correct:c, total:t, pct: t > 0 ? Math.round((c/t)*100) : 0 };
  }).sort(function(a,b) { return a.pct - b.pct; });
}

function getWeakest(mode, n) {
  return getItemStats(mode).filter(function(s) { return s.total >= 3; }).slice(0, n || 3);
}

function getAllWeakItems(mode) {
  return getItemStats(mode).filter(function(s) { return s.total >= 3 && s.pct < 60; });
}

// ── 5. Achievements ──────────────────────────

function checkAllItemsAccuracy(mode, names, minPct, minAttempts) {
  var items = stats.items[mode] || {};
  return names.every(function(n) {
    var d = items[n];
    if (!d || d[1] < minAttempts) return false;
    return Math.round((d[0]/d[1])*100) >= minPct;
  });
}

function checkAchievements() {
  var newOnes = [];
  var maxTimed = Math.max(stats.timedBest.note||0, stats.timedBest.interval||0,
    stats.timedBest.chord||0, stats.timedBest.progression||0);
  ACHIEVEMENTS.forEach(function(a) {
    if (stats.achievements.indexOf(a.id) !== -1) return;
    var ok = false;
    switch(a.id) {
      case 'first_correct': ok = stats.totalCorrect >= 1; break;
      case 'streak_5':  ok = state.streak >= 5; break;
      case 'streak_10': ok = state.streak >= 10; break;
      case 'streak_25': ok = state.streak >= 25; break;
      case 'q_50':   ok = stats.totalQuestions >= 50; break;
      case 'q_100':  ok = stats.totalQuestions >= 100; break;
      case 'q_500':  ok = stats.totalQuestions >= 500; break;
      case 'q_1000': ok = stats.totalQuestions >= 1000; break;
      case 'timed_20': ok = maxTimed >= 20; break;
      case 'timed_30': ok = maxTimed >= 30; break;
      case 'all_notes': ok = checkAllItemsAccuracy('note', NOTE_NAMES, 80, 5); break;
      case 'all_intervals': ok = checkAllItemsAccuracy('interval', INTERVALS.map(function(i){return i.name;}), 80, 5); break;
      case 'all_chords': ok = checkAllItemsAccuracy('chord', CHORDS.map(function(c){return c.name;}), 80, 5); break;
      case 'adaptive_top': ok = state.difficulty==='adaptive' && state.adaptive.tier >= 2; break;
      case 'perfect_10': ok = state.difficulty==='hard' && state.streak >= 10; break;
    }
    if (ok) { stats.achievements.push(a.id); newOnes.push(a); }
  });
  newOnes.forEach(showAchievementToast);
}

function showAchievementToast(achievement) {
  var toast = document.createElement('div');
  toast.className = 'achievement-toast';
  toast.innerHTML = '<span class="toast-icon">' + achievement.icon + '</span>' +
    '<div class="toast-body"><strong>' + achievement.name + '</strong><br><small>' + achievement.desc + '</small></div>';
  els.toastContainer.appendChild(toast);
  setTimeout(function() {
    toast.classList.add('toast-out');
    setTimeout(function() { toast.remove(); }, 400);
  }, 3000);
}

// ── 6. Persistence ───────────────────────────

function saveData() {
  try { localStorage.setItem('pitchTrainer', JSON.stringify({
    bestStreak: state.bestStreak, settings: state.settings, stats: stats,
  })); } catch(e) {}
}

function loadData() {
  try {
    var raw = localStorage.getItem('pitchTrainer');
    if (!raw) return;
    var d = JSON.parse(raw);
    if (typeof d.bestStreak === 'number') {
      state.bestStreak = { note:d.bestStreak, interval:d.bestStreak, chord:0, progression:0 };
    } else if (d.bestStreak) {
      ['note','interval','chord','progression'].forEach(function(m) {
        state.bestStreak[m] = d.bestStreak[m] || 0;
      });
    }
    if (d.settings) {
      Object.assign(state.settings, d.settings);
      if (typeof state.settings.volume !== 'number') state.settings.volume = 0.6;
      if (typeof state.settings.keyContext !== 'boolean') state.settings.keyContext = false;
      if (typeof state.settings.selectedKey !== 'number' || state.settings.selectedKey < 0 || state.settings.selectedKey >= KEYS.length) state.settings.selectedKey = 0;
    }
    if (d.stats) {
      stats = Object.assign(defaultStats(), d.stats);
      ['note','interval','chord','progression'].forEach(function(m) {
        if (!stats.items[m]) stats.items[m] = {};
        if (!stats.timedBest[m] && stats.timedBest[m] !== 0) stats.timedBest[m] = 0;
      });
      if (!Array.isArray(stats.history)) stats.history = [];
      if (!Array.isArray(stats.achievements)) stats.achievements = [];
    }
  } catch(e) {}
}

// ── 7. Difficulty & Adaptive ─────────────────

function getEffectiveDifficulty() {
  if (state.difficulty !== 'adaptive') return DIFFICULTY[state.difficulty];
  var tiers = ADAPTIVE_TIERS[state.mode];
  if (!tiers) return DIFFICULTY.easy;
  var t = Math.min(state.adaptive.tier, tiers.length - 1);
  var tc = tiers[t];
  return {
    noteDuration: tc.noteDuration, replayLimit: tc.replayLimit,
    notePool: tc.notePool||'natural', intervalPool: tc.intervalPool||'easy',
    chordPool: tc.chordPool||'basic', progPool: tc.progPool||'basic',
    chordInv: !!tc.chordInv,
  };
}
function getAdaptiveLabel() {
  var tiers = ADAPTIVE_TIERS[state.mode];
  if (!tiers) return '';
  return tiers[Math.min(state.adaptive.tier, tiers.length-1)].label;
}
function updateAdaptive(isCorrect) {
  if (state.difficulty !== 'adaptive') return;
  state.adaptive.history.push(isCorrect);
  if (state.adaptive.history.length > 10) state.adaptive.history.shift();
  if (state.adaptive.history.length >= 5) {
    var acc = state.adaptive.history.filter(Boolean).length / state.adaptive.history.length;
    var max = (ADAPTIVE_TIERS[state.mode]||[]).length - 1;
    if (acc >= 0.8 && state.adaptive.tier < max) { state.adaptive.tier++; state.adaptive.history = []; }
    else if (acc < 0.4 && state.adaptive.tier > 0) { state.adaptive.tier--; state.adaptive.history = []; }
  }
}

// ── 8. Question Generation ───────────────────

function getMidiRange() {
  return { low: (state.settings.octaveMin+1)*12, high: (state.settings.octaveMax+1)*12+11 };
}
function randomInt(min, max) { return Math.floor(Math.random()*(max-min+1))+min; }

function getKeyScaleNotes() {
  if (!state.settings.keyContext) return null;
  var k = KEYS[state.settings.selectedKey];
  var scale = k.type === 'major' ? MAJOR_SCALE : MINOR_SCALE;
  var r = getMidiRange(), notes = [];
  for (var m = r.low; m <= r.high; m++) {
    if (scale.indexOf((m - k.root + 120) % 12) !== -1) notes.push(m);
  }
  return notes.length > 0 ? notes : null;
}

function generateNoteQuestion() {
  var r = getMidiRange(), diff = getEffectiveDifficulty(), midi;
  var keyNotes = getKeyScaleNotes();
  if (keyNotes) {
    var pool = diff.notePool === 'natural'
      ? keyNotes.filter(function(m) { return NATURAL_NOTES.indexOf(NOTE_NAMES[m%12]) !== -1; })
      : keyNotes;
    if (pool.length === 0) pool = keyNotes;
    midi = pool[randomInt(0, pool.length-1)];
  } else if (diff.notePool === 'natural') {
    var nats = [];
    for (var m = r.low; m <= r.high; m++) { if (NATURAL_NOTES.indexOf(NOTE_NAMES[m%12])!==-1) nats.push(m); }
    midi = nats[randomInt(0, nats.length-1)];
  } else { midi = randomInt(r.low, r.high); }
  return { midi:midi, answer:noteNameFromMidi(midi) };
}

function generateIntervalQuestion() {
  var r = getMidiRange(), diff = getEffectiveDifficulty(), pool;
  if (diff.intervalPool === 'easy') pool = INTERVALS.filter(function(i) { return EASY_INTERVALS.indexOf(i.semitones)!==-1; });
  else pool = INTERVALS.slice();
  var iv = pool[randomInt(0, pool.length-1)], asc = true;
  if (diff.intervalPool === 'all+descending' && iv.semitones > 0) asc = Math.random() < 0.5;
  var m1, m2;
  if (asc) { m1 = randomInt(r.low, Math.max(r.low, r.high-iv.semitones)); m2 = m1+iv.semitones; }
  else { m1 = randomInt(Math.min(r.high, r.low+iv.semitones), r.high); m2 = m1-iv.semitones; }
  return { midi1:m1, midi2:m2, semitones:iv.semitones, ascending:asc, answer:iv.name+(asc?'':' (desc)') };
}

function generateChordQuestion() {
  var r = getMidiRange(), diff = getEffectiveDifficulty(), pool;
  if (diff.chordPool === 'basic') pool = CHORDS.filter(function(c) { return c.pool==='basic'; });
  else if (diff.chordPool === 'triads') pool = CHORDS.filter(function(c) { return c.pool==='basic'||c.pool==='triads'; });
  else pool = CHORDS.slice();
  var chord = pool[randomInt(0, pool.length-1)];
  var maxS = Math.max.apply(null, chord.semitones);
  var rootMidi = randomInt(r.low, Math.max(r.low, r.high-maxS));
  var sems = chord.semitones.slice();
  var inv = 0;
  if (diff.chordInv && sems.length > 1) {
    inv = randomInt(0, sems.length-1);
    for (var i = 0; i < inv; i++) sems.push(sems.shift()+12);
  }
  var midiNotes = sems.map(function(s) { return rootMidi+s; });
  var invLabel = inv === 0 ? '' : inv === 1 ? ' (1st inv)' : inv === 2 ? ' (2nd inv)' : ' (3rd inv)';
  return { rootMidi:rootMidi, midiNotes:midiNotes, answer:chord.name, inversion:inv, invLabel:invLabel };
}

function generateProgressionQuestion() {
  var diff = getEffectiveDifficulty();
  var pool;
  if (diff.progPool === 'basic') pool = PROGRESSIONS.filter(function(p){return p.pool==='basic';});
  else if (diff.progPool === 'medium') pool = PROGRESSIONS.filter(function(p){return p.pool==='basic'||p.pool==='medium';});
  else pool = PROGRESSIONS.slice();
  var prog = pool[randomInt(0, pool.length-1)];
  var keyIdx = state.settings.keyContext ? state.settings.selectedKey : randomInt(0, KEYS.length-1);
  var k = KEYS[keyIdx];
  var scale = k.type === 'major' ? MAJOR_SCALE : MINOR_SCALE;
  var base = 60 + k.root;
  var midiChords = prog.numerals.map(function(num) {
    var rc = ROMAN_TO_CHORD[num];
    var rootNote = base + scale[rc.degree];
    return rc.intervals.map(function(iv) { return rootNote + iv; });
  });
  return { answer:prog.name, numerals:prog.numerals, midiChords:midiChords, keyIdx:keyIdx, rootMidi:base };
}

function generateQuestionForAnswer(mode, targetName) {
  var attempts = 0;
  while (attempts < 50) {
    var q;
    if (mode === 'note') q = generateNoteQuestion();
    else if (mode === 'interval') q = generateIntervalQuestion();
    else if (mode === 'chord') q = generateChordQuestion();
    else q = generateProgressionQuestion();
    if (q.answer === targetName) return q;
    attempts++;
  }
  // Fallback: regular question
  if (mode === 'note') return generateNoteQuestion();
  if (mode === 'interval') return generateIntervalQuestion();
  if (mode === 'chord') return generateChordQuestion();
  return generateProgressionQuestion();
}

function generateQuestion() {
  if (state.focusedPractice) {
    var weak = getAllWeakItems(state.mode);
    if (weak.length > 0) {
      var weights = weak.map(function(w) { return Math.max(1, 100-w.pct); });
      var totalW = weights.reduce(function(a,b){return a+b;},0);
      var r = Math.random() * totalW, cum = 0, target = weak[0];
      for (var i = 0; i < weights.length; i++) { cum += weights[i]; if (r <= cum) { target = weak[i]; break; } }
      state.currentQuestion = generateQuestionForAnswer(state.mode, target.name);
    } else {
      state.currentQuestion = generateRegularQuestion();
    }
  } else {
    state.currentQuestion = generateRegularQuestion();
  }
  state.replaysUsed = 0;
  state.userAnswer = null;
  state.hintUsed = false;
}

function generateRegularQuestion() {
  if (state.mode === 'note') return generateNoteQuestion();
  if (state.mode === 'interval') return generateIntervalQuestion();
  if (state.mode === 'chord') return generateChordQuestion();
  return generateProgressionQuestion();
}

// ── 9. Answer Choices ────────────────────────

function getNoteChoices() {
  var d = getEffectiveDifficulty();
  return d.notePool === 'natural' ? NATURAL_NOTES.slice() : NOTE_NAMES.slice();
}
function getIntervalChoices() {
  var d = getEffectiveDifficulty();
  if (d.intervalPool === 'easy') return INTERVALS.filter(function(i){return EASY_INTERVALS.indexOf(i.semitones)!==-1;}).map(function(i){return i.name;});
  var names = INTERVALS.map(function(i){return i.name;});
  if (d.intervalPool === 'all+descending') {
    return names.concat(INTERVALS.filter(function(i){return i.semitones>0;}).map(function(i){return i.name+' (desc)';}));
  }
  return names;
}
function getChordChoices() {
  var d = getEffectiveDifficulty();
  if (d.chordPool === 'basic') return CHORDS.filter(function(c){return c.pool==='basic';}).map(function(c){return c.name;});
  if (d.chordPool === 'triads') return CHORDS.filter(function(c){return c.pool==='basic'||c.pool==='triads';}).map(function(c){return c.name;});
  return CHORDS.map(function(c){return c.name;});
}
function getProgressionChoices() {
  var d = getEffectiveDifficulty();
  if (d.progPool === 'basic') return PROGRESSIONS.filter(function(p){return p.pool==='basic';}).map(function(p){return p.name;});
  if (d.progPool === 'medium') return PROGRESSIONS.filter(function(p){return p.pool==='basic'||p.pool==='medium';}).map(function(p){return p.name;});
  return PROGRESSIONS.map(function(p){return p.name;});
}
function getChoices() {
  if (state.mode === 'note') return getNoteChoices();
  if (state.mode === 'interval') return getIntervalChoices();
  if (state.mode === 'chord') return getChordChoices();
  return getProgressionChoices();
}

// ── 10. Piano Renderer ───────────────────────

function renderPiano(container, highlights) {
  highlights = highlights || {};
  container.innerHTML = '';
  var minO = state.settings.octaveMin, maxO = Math.min(state.settings.octaveMax, minO+2);
  var startM = (minO+1)*12, endM = (maxO+1)*12+11;
  var piano = document.createElement('div');
  piano.className = 'piano-keyboard';
  piano.setAttribute('aria-hidden', 'true');
  var wc = 0;
  for (var m = startM; m <= endM; m++) { if (!BLACK_NOTE_INDICES.has(m%12)) wc++; }
  if (wc === 0) { container.appendChild(piano); return; }
  var wW = 100/wc, bW = wW*0.65, wi = 0;
  for (var m = startM; m <= endM; m++) {
    if (BLACK_NOTE_INDICES.has(m%12)) continue;
    var k = document.createElement('div');
    k.className = 'piano-key white';
    k.style.left = (wi*wW)+'%'; k.style.width = wW+'%';
    if (highlights[m]) k.classList.add(highlights[m]);
    piano.appendChild(k); wi++;
  }
  wi = 0;
  for (var m = startM; m <= endM; m++) {
    if (!BLACK_NOTE_INDICES.has(m%12)) { wi++; continue; }
    var k = document.createElement('div');
    k.className = 'piano-key black';
    k.style.left = (wi*wW - bW/2)+'%'; k.style.width = bW+'%';
    if (highlights[m]) k.classList.add(highlights[m]);
    piano.appendChild(k);
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

function makeHighlights(midis, cls) {
  var h = {};
  midis.forEach(function(m) { h[m] = cls; });
  return h;
}

// ── 11. Staff Notation ───────────────────────

function midiToStaffY(midi) {
  var oct = Math.floor(midi / 12) - 1;
  var info = MIDI_TO_DIATONIC[midi % 12];
  var diatonicPos = (oct - 4) * 7 + info.step;
  var relToE4 = diatonicPos - 2;
  return 52 - relToE4 * 4;
}

function renderStaffNotation(container, midis, highlightColor) {
  container.innerHTML = '';
  if (!midis || midis.length === 0) return;
  highlightColor = highlightColor || '#e94560';

  var svgNS = 'http://www.w3.org/2000/svg';
  var w = 200, h = 80;
  var svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
  svg.setAttribute('class', 'staff-svg');
  svg.setAttribute('aria-hidden', 'true');

  // Draw staff lines
  for (var i = 0; i < 5; i++) {
    var line = document.createElementNS(svgNS, 'line');
    var y = 20 + i * 8;
    line.setAttribute('x1', '10'); line.setAttribute('x2', String(w - 10));
    line.setAttribute('y1', String(y)); line.setAttribute('y2', String(y));
    line.setAttribute('stroke', '#556'); line.setAttribute('stroke-width', '1');
    svg.appendChild(line);
  }

  // Draw notes
  var noteX = midis.length === 1 ? w / 2 : 0;
  var spacing = midis.length > 1 ? (w - 60) / (midis.length - 1) : 0;
  midis.forEach(function(midi, idx) {
    var x = midis.length === 1 ? w / 2 : 30 + idx * spacing;
    var y = midiToStaffY(midi);
    var info = MIDI_TO_DIATONIC[midi % 12];

    // Ledger lines
    if (y > 52) {
      for (var ly = 60; ly <= y; ly += 8) { if (ly % 8 === 4 || (ly - 20) % 8 === 0) {
        var ll = document.createElementNS(svgNS, 'line');
        ll.setAttribute('x1', String(x - 10)); ll.setAttribute('x2', String(x + 10));
        ll.setAttribute('y1', String(ly)); ll.setAttribute('y2', String(ly));
        ll.setAttribute('stroke', '#556'); ll.setAttribute('stroke-width', '1');
        svg.appendChild(ll);
      }}
    }
    if (y < 20) {
      for (var ly = 12; ly >= y; ly -= 8) { if ((ly - 20 + 800) % 8 === 0) {
        var ll = document.createElementNS(svgNS, 'line');
        ll.setAttribute('x1', String(x - 10)); ll.setAttribute('x2', String(x + 10));
        ll.setAttribute('y1', String(ly)); ll.setAttribute('y2', String(ly));
        ll.setAttribute('stroke', '#556'); ll.setAttribute('stroke-width', '1');
        svg.appendChild(ll);
      }}
    }

    // Note head
    var ellipse = document.createElementNS(svgNS, 'ellipse');
    ellipse.setAttribute('cx', String(x)); ellipse.setAttribute('cy', String(y));
    ellipse.setAttribute('rx', '5'); ellipse.setAttribute('ry', '3.5');
    ellipse.setAttribute('fill', highlightColor);
    ellipse.setAttribute('transform', 'rotate(-15 ' + x + ' ' + y + ')');
    svg.appendChild(ellipse);

    // Accidental
    if (info.acc) {
      var txt = document.createElementNS(svgNS, 'text');
      txt.setAttribute('x', String(x - 10)); txt.setAttribute('y', String(y + 3));
      txt.setAttribute('fill', highlightColor); txt.setAttribute('font-size', '10');
      txt.setAttribute('font-weight', 'bold');
      txt.textContent = info.acc;
      svg.appendChild(txt);
    }
  });

  container.appendChild(svg);
}

// ── 12. Timer ────────────────────────────────

function startTimer() {
  state.timerRemaining = TIMED_DURATION;
  updateTimerDisplay();
  els.timerBar.style.display = '';
  state.timerInterval = setInterval(function() {
    state.timerRemaining--;
    updateTimerDisplay();
    if (state.timerRemaining <= 0) { clearInterval(state.timerInterval); state.timerInterval = null; endTimedChallenge(); }
  }, 1000);
}
function stopTimer() { if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; } }
function updateTimerDisplay() {
  var pct = (state.timerRemaining / TIMED_DURATION) * 100;
  els.timerFill.style.width = pct + '%';
  els.timerText.textContent = state.timerRemaining;
  els.timerFill.className = state.timerRemaining <= 10 ? 'timer-fill danger' : state.timerRemaining <= 20 ? 'timer-fill warning' : 'timer-fill';
}
function endTimedChallenge() {
  stopTimer(); state.timedAnswering = false;
  var score = state.score.correct;
  var isNew = score > (stats.timedBest[state.mode]||0);
  if (isNew) { stats.timedBest[state.mode] = score; }
  checkAchievements(); saveData();
  showScreen('timed-result'); renderTimedResult(isNew);
}
function showCountdown(cb) {
  var ov = els.countdownOverlay, num = els.countdownNumber, c = 3;
  ov.style.display = 'flex'; ov.classList.remove('fade-out'); num.textContent = c;
  var iv = setInterval(function() {
    c--;
    if (c > 0) { num.textContent = c; }
    else { clearInterval(iv); ov.classList.add('fade-out'); setTimeout(function() { ov.style.display='none'; ov.classList.remove('fade-out'); cb(); }, 250); }
  }, 800);
}

// ── 13. Hints ────────────────────────────────

function applyHint() {
  if (state.hintUsed) return;
  state.hintUsed = true;
  var ans = state.currentQuestion.answer;
  var btns = els.answerGrid.querySelectorAll('.answer-btn:not(.eliminated)');
  var wrong = [];
  btns.forEach(function(b) { if (b.dataset.answer !== ans) wrong.push(b); });
  var n = Math.max(1, Math.floor(wrong.length / 2));
  for (var i = wrong.length - 1; i > 0; i--) { var j = randomInt(0,i); var t = wrong[i]; wrong[i]=wrong[j]; wrong[j]=t; }
  for (var i = 0; i < n; i++) wrong[i].classList.add('eliminated');
  els.hintBtn.disabled = true; els.hintBtn.classList.add('used');
}

// ── 14. DOM References ───────────────────────

var $ = function(s) { return document.querySelector(s); };
var $$ = function(s) { return document.querySelectorAll(s); };
var screens = {}, els = {};

function initDomRefs() {
  screens = {
    menu:$('#screen-menu'), playing:$('#screen-playing'), result:$('#screen-result'),
    settings:$('#screen-settings'), stats:$('#screen-stats'),
    'timed-result':$('#screen-timed-result'),
  };
  els = {
    settingsBtn:$('#settings-btn'), statsBtn:$('#stats-btn'),
    scoreDisplay:$('#score-display'), streakDisplay:$('#streak-display'),
    resultScoreDisplay:$('#result-score-display'), resultStreakDisplay:$('#result-streak-display'),
    questionText:$('#question-text'), adaptiveLevel:$('#adaptive-level'),
    keyIndicator:$('#key-indicator'),
    replayBtn:$('#replay-btn'), replayCount:$('#replay-count'),
    hintBtn:$('#hint-btn'), scaleBtn:$('#scale-btn'),
    backToMenuBtn:$('#back-to-menu-btn'),
    answerGrid:$('#answer-grid'), pianoContainer:$('#piano-container'),
    staffContainer:$('#staff-container'),
    resultFeedback:$('#result-feedback'), resultText:$('#result-text'), resultDetail:$('#result-detail'),
    resultPianoContainer:$('#result-piano-container'),
    resultStaffContainer:$('#result-staff-container'),
    resultAnswerGrid:$('#result-answer-grid'), nextBtn:$('#next-btn'),
    timerBar:$('#timer-bar'), timerFill:$('#timer-fill'), timerText:$('#timer-text'),
    timedMode:$('#timed-mode'), focusedMode:$('#focused-mode'),
    timedFinalScore:$('#timed-final-score'), timedAccuracy:$('#timed-accuracy'),
    timedBestDisplay:$('#timed-best-display'),
    timedShareBtn:$('#timed-share-btn'),
    timedRetryBtn:$('#timed-retry-btn'), timedMenuBtn:$('#timed-menu-btn'),
    statsContent:$('#stats-content'), statsBackBtn:$('#stats-back-btn'),
    octaveMin:$('#octave-min'), octaveMax:$('#octave-max'),
    waveform:$('#waveform'), volumeSlider:$('#volume-slider'), volumeDisplay:$('#volume-display'),
    refTone:$('#ref-tone'),
    keyContext:$('#key-context'), keySelect:$('#key-select'),
    resetScoreBtn:$('#reset-score-btn'), resetStatsBtn:$('#reset-stats-btn'),
    exportBtn:$('#export-btn'), importInput:$('#import-input'),
    settingsBackBtn:$('#settings-back-btn'),
    countdownOverlay:$('#countdown-overlay'), countdownNumber:$('#countdown-number'),
    toastContainer:$('#toast-container'), srAnnounce:$('#sr-announce'),
  };
}

// ── 15. Screen Management ────────────────────

function showScreen(name) {
  state.screen = name;
  Object.keys(screens).forEach(function(k) { screens[k].classList.remove('active'); });
  if (screens[name]) screens[name].classList.add('active');
}

function announce(msg) {
  if (els.srAnnounce) { els.srAnnounce.textContent = ''; setTimeout(function() { els.srAnnounce.textContent = msg; }, 50); }
}

// ── 16. Render Functions ─────────────────────

function renderScoreBar() {
  var c = state.score.correct, t = state.score.total;
  var pct = t === 0 ? 0 : Math.round((c/t)*100);
  var s = c + ' / ' + t + ' (' + pct + '%)';
  var best = state.mode ? (state.bestStreak[state.mode]||0) : 0;
  var sk = 'Streak: ' + state.streak + ' | Best: ' + best;
  els.scoreDisplay.textContent = s;
  els.streakDisplay.textContent = sk;
  els.resultScoreDisplay.textContent = s;
  els.resultStreakDisplay.textContent = sk;
}

function renderReplayButton() {
  var lim = getEffectiveDifficulty().replayLimit;
  if (lim === Infinity) { els.replayCount.textContent = ''; els.replayBtn.disabled = false; }
  else { var r = lim - state.replaysUsed; els.replayCount.textContent = ' ('+r+' left)'; els.replayBtn.disabled = r <= 0; }
}

function buildAnswerButtons(container, choices, handler) {
  container.innerHTML = '';
  choices.forEach(function(ch, idx) {
    var btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.dataset.answer = ch;
    btn.setAttribute('aria-label', ch);
    var kn = idx < 9 ? idx+1 : (idx === 9 ? 0 : null);
    if (kn !== null && !isTouchDevice) {
      var hint = document.createElement('span');
      hint.className = 'key-hint'; hint.textContent = kn; btn.appendChild(hint);
    }
    btn.appendChild(document.createTextNode(ch));
    btn.addEventListener('click', function() { handler(ch); });
    container.appendChild(btn);
  });
}

function renderPlayingScreen() {
  var choices = getChoices();
  var questions = {note:'What note is this?', interval:'What interval is this?', chord:'What chord is this?', progression:'What progression is this?'};
  els.questionText.textContent = questions[state.mode] || 'Listen and answer';
  buildAnswerButtons(els.answerGrid, choices, handleAnswer);
  renderScoreBar(); renderReplayButton();
  els.scaleBtn.style.display = (state.mode === 'note' && !state.timedMode) ? '' : 'none';
  els.hintBtn.disabled = false; els.hintBtn.classList.remove('used');
  if (state.difficulty === 'adaptive') { els.adaptiveLevel.style.display = ''; els.adaptiveLevel.textContent = getAdaptiveLabel(); }
  else els.adaptiveLevel.style.display = 'none';
  if (state.settings.keyContext) { els.keyIndicator.style.display = ''; els.keyIndicator.textContent = KEYS[state.settings.selectedKey].name; }
  else els.keyIndicator.style.display = 'none';
  renderPiano(els.pianoContainer);
  els.staffContainer.innerHTML = '';
}

function renderResultScreen(isCorrect) {
  var ans = state.currentQuestion.answer;
  var choices = getChoices();
  els.resultFeedback.className = 'result-feedback ' + (isCorrect ? 'correct' : 'incorrect');
  els.resultText.textContent = isCorrect ? 'Correct!' : 'Incorrect';
  var detail = isCorrect ? 'The answer was ' + ans + '.' : 'You answered ' + state.userAnswer + '. The correct answer was ' + ans + '.';
  if (state.mode === 'chord' && state.currentQuestion.invLabel) detail += ' ' + state.currentQuestion.invLabel;
  els.resultDetail.textContent = detail;
  announce(isCorrect ? 'Correct! ' + ans : 'Incorrect. The answer was ' + ans);
  var midis = getQuestionMidis();
  renderPiano(els.resultPianoContainer, makeHighlights(midis, 'correct-key'));
  renderStaffNotation(els.resultStaffContainer, midis, isCorrect ? '#2ecc71' : '#e74c3c');
  buildAnswerButtons(els.resultAnswerGrid, choices, function(){});
  els.resultAnswerGrid.querySelectorAll('.answer-btn').forEach(function(btn) {
    if (btn.dataset.answer === ans) btn.classList.add('correct');
    if (!isCorrect && btn.dataset.answer === state.userAnswer) btn.classList.add('incorrect');
  });
  renderScoreBar();
}

function renderTimedResult(isNew) {
  els.timedFinalScore.textContent = state.score.correct;
  var t = state.score.total, pct = t===0?0:Math.round((state.score.correct/t)*100);
  els.timedAccuracy.textContent = state.score.correct + ' of ' + t + ' correct (' + pct + '%)';
  if (isNew) { els.timedBestDisplay.textContent = 'New Best Score!'; els.timedBestDisplay.className = 'timed-best new-best'; }
  else { els.timedBestDisplay.textContent = 'Best: ' + (stats.timedBest[state.mode]||0); els.timedBestDisplay.className = 'timed-best'; }
}

function applySettingsToUI() {
  els.octaveMin.value = state.settings.octaveMin;
  els.octaveMax.value = state.settings.octaveMax;
  els.waveform.value = state.settings.waveform;
  els.volumeSlider.value = Math.round(state.settings.volume * 100);
  els.volumeDisplay.textContent = Math.round(state.settings.volume * 100) + '%';
  els.refTone.checked = state.settings.referenceTone;
  els.keyContext.checked = state.settings.keyContext;
  els.keySelect.value = state.settings.selectedKey;
  els.keySelect.disabled = !state.settings.keyContext;
}

// ── 17. Stats Renderer ───────────────────────

var currentStatsTab = 'overview';

function renderStatsScreen() {
  var c = els.statsContent; c.innerHTML = '';
  if (currentStatsTab === 'overview') renderStatsOverview(c);
  else if (currentStatsTab === 'history') renderStatsHistory(c);
  else if (currentStatsTab === 'achievements') renderStatsAchievements(c);
  else renderStatsMode(c, currentStatsTab);
}

function renderStatsOverview(c) {
  var pct = stats.totalQuestions > 0 ? Math.round((stats.totalCorrect/stats.totalQuestions)*100) : 0;
  c.innerHTML = '<div class="stats-overview">' +
    '<div class="stat-card"><div class="stat-number">'+stats.totalQuestions+'</div><div class="stat-label">Questions</div></div>' +
    '<div class="stat-card"><div class="stat-number">'+pct+'%</div><div class="stat-label">Accuracy</div></div>' +
    '<div class="stat-card"><div class="stat-number">'+(state.bestStreak.note||0)+'</div><div class="stat-label">Best (Notes)</div></div>' +
    '<div class="stat-card"><div class="stat-number">'+(state.bestStreak.interval||0)+'</div><div class="stat-label">Best (Intervals)</div></div>' +
    '<div class="stat-card"><div class="stat-number">'+(state.bestStreak.chord||0)+'</div><div class="stat-label">Best (Chords)</div></div>' +
    '<div class="stat-card"><div class="stat-number">'+(state.bestStreak.progression||0)+'</div><div class="stat-label">Best (Prog)</div></div>' +
    '</div>' +
    '<h3 style="font-size:0.9rem;color:var(--text-secondary);margin-top:6px;">Timed Challenge Bests</h3>' +
    '<div class="timed-bests">' +
    '<div class="timed-best-card"><div class="mode-name">Notes</div><div class="best-score">'+(stats.timedBest.note||0)+'</div></div>' +
    '<div class="timed-best-card"><div class="mode-name">Intervals</div><div class="best-score">'+(stats.timedBest.interval||0)+'</div></div>' +
    '<div class="timed-best-card"><div class="mode-name">Chords</div><div class="best-score">'+(stats.timedBest.chord||0)+'</div></div>' +
    '<div class="timed-best-card"><div class="mode-name">Prog</div><div class="best-score">'+(stats.timedBest.progression||0)+'</div></div>' +
    '</div>';
  var all = [];
  ['note','interval','chord','progression'].forEach(function(m) {
    getWeakest(m, 2).forEach(function(it) { all.push({mode:m,name:it.name,pct:it.pct,c:it.correct,t:it.total}); });
  });
  if (all.length > 0) {
    all.sort(function(a,b){return a.pct-b.pct;});
    var h = '<div class="weak-areas"><h3>Areas to Practice</h3>';
    all.slice(0,5).forEach(function(w) { h += '<div class="weak-item">'+w.name+' ('+w.mode+') - '+w.pct+'% ('+w.c+'/'+w.t+')</div>'; });
    c.innerHTML += h + '</div>';
  }
}

function renderStatsMode(c, mode) {
  var items = getItemStats(mode);
  if (items.length === 0) { c.innerHTML = '<div class="stats-empty">No data yet. Play some rounds to see your stats!</div>'; return; }
  var sorted = items.slice().sort(function(a,b){return a.name.localeCompare(b.name);});
  var h = '<div class="stats-bars">';
  sorted.forEach(function(it) {
    var cls = it.total===0?'none':(it.pct>=75?'good':(it.pct>=50?'ok':'weak'));
    h += '<div class="stat-row"><span class="stat-name">'+it.name+'</span><div class="stat-bar-track"><div class="stat-bar-fill '+cls+'" style="width:'+it.pct+'%"></div></div><span class="stat-detail">'+it.pct+'% ('+it.correct+'/'+it.total+')</span></div>';
  });
  c.innerHTML = h + '</div>';
  var weak = getWeakest(mode, 3);
  if (weak.length > 0) {
    var wh = '<div class="weak-areas"><h3>Focus Areas</h3>';
    weak.forEach(function(w) { wh += '<div class="weak-item">'+w.name+' - '+w.pct+'% ('+w.correct+'/'+w.total+')</div>'; });
    c.innerHTML += wh + '</div>';
  }
}

function renderStatsHistory(c) {
  if (!stats.history || stats.history.length === 0) { c.innerHTML = '<div class="stats-empty">No history yet.</div>'; return; }
  var h = '<div class="history-list">';
  stats.history.slice(0, 30).forEach(function(entry) {
    var icon = entry.ok ? '<span class="hist-ok">&#10003;</span>' : '<span class="hist-wrong">&#10007;</span>';
    var ago = formatAgo(entry.t);
    h += '<div class="history-item">' + icon +
      '<div class="hist-detail"><span class="hist-q">' + entry.q + '</span>' +
      '<span class="hist-ans">' + (entry.ok ? entry.correct : entry.user + ' → ' + entry.correct) + '</span></div>' +
      '<span class="hist-mode">' + entry.mode + '</span><span class="hist-ago">' + ago + '</span></div>';
  });
  c.innerHTML = h + '</div>';
}

function formatAgo(ts) {
  var diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'now';
  if (diff < 3600) return Math.floor(diff/60) + 'm';
  if (diff < 86400) return Math.floor(diff/3600) + 'h';
  return Math.floor(diff/86400) + 'd';
}

function renderStatsAchievements(c) {
  var h = '<div class="achievements-grid">';
  ACHIEVEMENTS.forEach(function(a) {
    var unlocked = stats.achievements.indexOf(a.id) !== -1;
    h += '<div class="achievement-card' + (unlocked ? ' unlocked' : '') + '">' +
      '<span class="ach-icon">' + a.icon + '</span>' +
      '<strong>' + a.name + '</strong>' +
      '<small>' + a.desc + '</small></div>';
  });
  c.innerHTML = h + '</div>';
}

// ── 18. Event Handlers ───────────────────────

function handleModeSelect(mode) {
  ensureAudioContext();
  state.mode = mode;
  state.score = {correct:0, total:0};
  state.streak = 0;
  state.timedAnswering = false;
  state.adaptive.tier = 0; state.adaptive.history = [];
  state.timedMode = els.timedMode.checked;
  state.focusedPractice = els.focusedMode.checked;
  generateQuestion();
  showScreen('playing'); renderPlayingScreen();
  els.timerBar.style.display = state.timedMode ? '' : 'none';
  if (state.timedMode) {
    showCountdown(function() { startTimer(); playCurrentQuestion(); });
  } else { playCurrentQuestion(); }
  announce('Game started: ' + mode + ' mode');
}

function handleAnswer(answer) {
  if (state.timedAnswering) return;
  if (state.timedMode && state.timerRemaining <= 0) return;
  state.userAnswer = answer;
  var isCorrect = answer === state.currentQuestion.answer;
  state.score.total++;
  if (isCorrect) {
    state.score.correct++; state.streak++;
    if (state.streak > (state.bestStreak[state.mode]||0)) { state.bestStreak[state.mode] = state.streak; }
    haptic(10);
  } else { state.streak = 0; haptic([20, 30, 20]); }
  recordStat(state.mode, state.currentQuestion.answer, isCorrect);
  recordHistory(state.mode, state.currentQuestion, answer, state.currentQuestion.answer, isCorrect);
  updateAdaptive(isCorrect);
  checkAchievements(); saveData();
  if (state.timedMode) {
    state.timedAnswering = true;
    flashTimedFeedback(answer, isCorrect);
    renderScoreBar();
    setTimeout(function() {
      state.timedAnswering = false;
      if (state.screen==='playing' && state.timedMode && state.timerRemaining>0) {
        generateQuestion(); renderPlayingScreen(); playCurrentQuestion();
      }
    }, isCorrect ? 350 : 650);
  } else { showScreen('result'); renderResultScreen(isCorrect); }
}

function flashTimedFeedback(answer, isCorrect) {
  var btns = els.answerGrid.querySelectorAll('.answer-btn');
  btns.forEach(function(b) { b.disabled = true; });
  btns.forEach(function(b) {
    if (b.dataset.answer === state.currentQuestion.answer) b.classList.add('correct');
    if (!isCorrect && b.dataset.answer === answer) b.classList.add('incorrect');
  });
}

function handleReplay() {
  var lim = getEffectiveDifficulty().replayLimit;
  if (state.replaysUsed >= lim) return;
  state.replaysUsed++; renderReplayButton(); playCurrentQuestion();
}

function handleNext() {
  generateQuestion(); showScreen('playing'); renderPlayingScreen(); playCurrentQuestion();
}

function handleDifficulty(diff) {
  state.difficulty = diff;
  $$('.diff-btn').forEach(function(b){b.classList.remove('active');});
  var a = document.querySelector('.diff-btn[data-difficulty="'+diff+'"]');
  if (a) a.classList.add('active');
}

function handleSettingsOpen() {
  if (state.timedMode && state.timerInterval) return;
  state.previousScreen = state.screen;
  applySettingsToUI(); showScreen('settings');
}

function handleSettingsBack() {
  state.settings.octaveMin = parseInt(els.octaveMin.value, 10);
  state.settings.octaveMax = parseInt(els.octaveMax.value, 10);
  if (state.settings.octaveMin >= state.settings.octaveMax) state.settings.octaveMax = Math.min(state.settings.octaveMin + 1, 6);
  if (state.settings.octaveMin >= state.settings.octaveMax) state.settings.octaveMin = state.settings.octaveMax - 1;
  state.settings.waveform = els.waveform.value;
  state.settings.volume = parseInt(els.volumeSlider.value, 10) / 100;
  state.settings.referenceTone = els.refTone.checked;
  state.settings.keyContext = els.keyContext.checked;
  state.settings.selectedKey = parseInt(els.keySelect.value, 10);
  saveData(); showScreen(state.previousScreen);
}

function handleStatsOpen() {
  if (state.timedMode && state.timerInterval) return;
  state.previousScreen = state.screen;
  currentStatsTab = 'overview'; updateStatsTabUI(); renderStatsScreen(); showScreen('stats');
}
function handleStatsBack() { showScreen(state.previousScreen); }
function handleStatsTab(tab) {
  currentStatsTab = tab; updateStatsTabUI(); renderStatsScreen();
}
function updateStatsTabUI() {
  $$('.stats-tab').forEach(function(t) {
    var isActive = t.dataset.tab === currentStatsTab;
    t.classList.toggle('active', isActive);
    t.setAttribute('aria-selected', String(isActive));
  });
}

function handleResetScore() {
  state.score = {correct:0,total:0}; state.streak = 0;
  state.bestStreak = {note:0,interval:0,chord:0,progression:0};
  saveData(); renderScoreBar();
}
function handleResetStats() {
  stats = defaultStats();
  state.bestStreak = {note:0,interval:0,chord:0,progression:0};
  saveData();
}

function handleBackToMenu() {
  stopTimer(); state.timedMode = false; state.timedAnswering = false; showScreen('menu');
}
function handleTimedRetry() { if (state.mode) { els.timedMode.checked = true; handleModeSelect(state.mode); } }

function shareTimedResult() {
  var text = 'Pitch Trainer - Timed Challenge\n' +
    'Mode: ' + capitalize(state.mode) + ' | Difficulty: ' + capitalize(state.difficulty) + '\n' +
    'Score: ' + state.score.correct + ' correct in 60s\n' +
    'Best: ' + (stats.timedBest[state.mode]||0);
  if (navigator.share) { navigator.share({title:'Pitch Trainer', text:text}).catch(function(){}); }
  else if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function() {
      showAchievementToast({icon:'!', name:'Copied', desc:'Result copied to clipboard'});
    });
  }
}

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

function exportStats() {
  var data = JSON.stringify({settings:state.settings, bestStreak:state.bestStreak, stats:stats}, null, 2);
  var blob = new Blob([data], {type:'application/json'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = 'pitch-trainer-stats.json'; a.click();
  URL.revokeObjectURL(url);
}

function importStats(file) {
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var d = JSON.parse(e.target.result);
      if (d.settings) Object.assign(state.settings, d.settings);
      if (d.bestStreak) Object.assign(state.bestStreak, d.bestStreak);
      if (d.stats) stats = Object.assign(defaultStats(), d.stats);
      saveData();
      showAchievementToast({icon:'!', name:'Imported', desc:'Stats imported successfully'});
    } catch(err) {
      showAchievementToast({icon:'X', name:'Error', desc:'Invalid file format'});
    }
  };
  reader.readAsText(file);
}

// ── 19. Keyboard Shortcuts ───────────────────

function handleKeyboard(e) {
  if (state.screen === 'settings' || state.screen === 'menu' || state.screen === 'stats') return;
  var key = e.key;
  if (state.screen === 'playing' && !state.timedAnswering) {
    if (key >= '1' && key <= '9') {
      var idx = parseInt(key,10)-1;
      var btns = els.answerGrid.querySelectorAll('.answer-btn');
      if (idx < btns.length && !btns[idx].classList.contains('eliminated') && !btns[idx].disabled) btns[idx].click();
    } else if (key === '0') {
      var btns = els.answerGrid.querySelectorAll('.answer-btn');
      if (btns.length >= 10 && !btns[9].classList.contains('eliminated') && !btns[9].disabled) btns[9].click();
    } else if (key==='r'||key==='R') handleReplay();
    else if (key==='h'||key==='H') { if (!state.hintUsed) applyHint(); }
    else if ((key==='s'||key==='S') && state.mode==='note' && !state.timedMode) playMajorScale();
  }
  if (state.screen === 'result' && (key === ' ' || key === 'Enter')) { e.preventDefault(); handleNext(); }
  if (state.screen === 'timed-result' && (key === ' ' || key === 'Enter')) { e.preventDefault(); handleTimedRetry(); }
}

// ── 20. Mobile & Accessibility ───────────────

function haptic(pattern) {
  if (navigator.vibrate) { try { navigator.vibrate(pattern); } catch(e) {} }
}

function setupAccessibility() {
  isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  if (isTouchDevice) document.body.classList.add('touch-device');
}

// ── 21. Init ─────────────────────────────────

function init() {
  initDomRefs(); loadData(); setupAccessibility();

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(function() {});
  }

  // Mode buttons
  $$('.mode-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { handleModeSelect(btn.dataset.mode); });
  });
  $$('.diff-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { handleDifficulty(btn.dataset.difficulty); });
  });

  // Playback
  els.replayBtn.addEventListener('click', handleReplay);
  els.hintBtn.addEventListener('click', function() { if (!state.hintUsed) applyHint(); });
  els.scaleBtn.addEventListener('click', function() { if (state.mode==='note') playMajorScale(); });
  els.backToMenuBtn.addEventListener('click', handleBackToMenu);
  els.nextBtn.addEventListener('click', handleNext);

  // Timed result
  els.timedRetryBtn.addEventListener('click', handleTimedRetry);
  els.timedMenuBtn.addEventListener('click', handleBackToMenu);
  els.timedShareBtn.addEventListener('click', shareTimedResult);

  // Settings
  els.settingsBtn.addEventListener('click', handleSettingsOpen);
  els.settingsBackBtn.addEventListener('click', handleSettingsBack);
  els.resetScoreBtn.addEventListener('click', handleResetScore);
  els.resetStatsBtn.addEventListener('click', handleResetStats);
  els.volumeSlider.addEventListener('input', function() { els.volumeDisplay.textContent = els.volumeSlider.value + '%'; });
  els.keyContext.addEventListener('change', function() { els.keySelect.disabled = !els.keyContext.checked; });
  els.exportBtn.addEventListener('click', exportStats);
  els.importInput.addEventListener('change', function(e) { if (e.target.files[0]) importStats(e.target.files[0]); });

  // Stats
  els.statsBtn.addEventListener('click', handleStatsOpen);
  els.statsBackBtn.addEventListener('click', handleStatsBack);
  $$('.stats-tab').forEach(function(tab) {
    tab.addEventListener('click', function() { handleStatsTab(tab.dataset.tab); });
  });

  // Keyboard
  document.addEventListener('keydown', handleKeyboard);

  // Apply state to UI
  $$('.diff-btn').forEach(function(b){b.classList.remove('active');});
  var ab = document.querySelector('.diff-btn[data-difficulty="'+state.difficulty+'"]');
  if (ab) ab.classList.add('active');
  renderScoreBar();
}

document.addEventListener('DOMContentLoaded', init);
