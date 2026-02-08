/* ════════════════════════════════════════════
   Pitch Trainer - Musical Note & Interval Game
   ════════════════════════════════════════════ */

// ── Constants ──────────────────────────────

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NATURAL_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Major scale intervals in semitones from root: W W H W W W H
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

const EASY_INTERVALS = [0, 2, 4, 5, 7, 12]; // Unison, M2, M3, P4, P5, Octave

const DIFFICULTY = {
  easy:   { noteDuration: 1.5, replayLimit: Infinity, notePool: 'natural', intervalPool: 'easy' },
  medium: { noteDuration: 1.0, replayLimit: Infinity, notePool: 'chromatic', intervalPool: 'all' },
  hard:   { noteDuration: 0.5, replayLimit: 2,        notePool: 'chromatic', intervalPool: 'all+descending' },
};

// ── Audio Engine ───────────────────────────

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

function playTone(freq, duration, delayStart = 0) {
  const ctx = ensureAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = state.settings.waveform;
  osc.frequency.value = freq;

  const startTime = ctx.currentTime + delayStart;
  const attackEnd = startTime + 0.02;
  const releaseStart = startTime + duration - 0.05;
  const endTime = startTime + duration;

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.3, attackEnd);
  gain.gain.setValueAtTime(0.3, Math.max(attackEnd, releaseStart));
  gain.gain.linearRampToValueAtTime(0, endTime);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(endTime + 0.01);
}

function playNote(midi, duration, delayStart = 0) {
  playTone(midiToFreq(midi), duration, delayStart);
}

function playReferenceTone() {
  playTone(440, 0.8); // A4
}

function playMajorScale() {
  // Play the C major scale in the octave of the current question note
  const midi = state.currentQuestion.midi;
  const octave = Math.floor(midi / 12) - 1; // scientific pitch octave
  const rootMidi = (octave + 1) * 12; // C of that octave
  const noteDur = 0.35;
  const gap = 0.05;

  MAJOR_SCALE_STEPS.forEach((step, i) => {
    playNote(rootMidi + step, noteDur, i * (noteDur + gap));
  });
}

function playCurrentQuestion() {
  const dur = DIFFICULTY[state.difficulty].noteDuration;
  let offset = 0;

  if (state.settings.referenceTone) {
    playReferenceTone();
    offset = 1.0;
  }

  if (state.mode === 'note') {
    playNote(state.currentQuestion.midi, dur, offset);
  } else {
    playNote(state.currentQuestion.midi1, dur, offset);
    playNote(state.currentQuestion.midi2, dur, offset + dur + 0.15);
  }
}

// ── Game State ─────────────────────────────

const state = {
  mode: null,        // 'note' | 'interval'
  difficulty: 'easy',
  screen: 'menu',    // 'menu' | 'playing' | 'result' | 'settings'
  previousScreen: 'menu',
  score: { correct: 0, total: 0 },
  streak: 0,
  bestStreak: 0,
  replaysUsed: 0,
  currentQuestion: null,
  userAnswer: null,
  settings: {
    octaveMin: 3,
    octaveMax: 5,
    waveform: 'triangle',
    referenceTone: false,
  },
};

// ── Persistence ────────────────────────────

function saveState() {
  const data = {
    bestStreak: state.bestStreak,
    settings: state.settings,
  };
  try {
    localStorage.setItem('pitchTrainer', JSON.stringify(data));
  } catch (e) { /* ignore */ }
}

function loadState() {
  try {
    const raw = localStorage.getItem('pitchTrainer');
    if (!raw) return;
    const data = JSON.parse(raw);
    if (typeof data.bestStreak === 'number') state.bestStreak = data.bestStreak;
    if (data.settings) {
      Object.assign(state.settings, data.settings);
    }
  } catch (e) { /* ignore */ }
}

// ── Question Generation ────────────────────

function getMidiRange() {
  const low = state.settings.octaveMin * 12 + 12;  // C of octaveMin (MIDI: octave*12+12 for scientific pitch)
  const high = state.settings.octaveMax * 12 + 12 + 11; // B of octaveMax
  return { low, high };
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateNoteQuestion() {
  const { low, high } = getMidiRange();
  const diff = DIFFICULTY[state.difficulty];
  let midi;

  if (diff.notePool === 'natural') {
    // Only natural notes
    const naturals = [];
    for (let m = low; m <= high; m++) {
      if (NATURAL_NOTES.includes(NOTE_NAMES[m % 12])) {
        naturals.push(m);
      }
    }
    midi = naturals[randomInt(0, naturals.length - 1)];
  } else {
    midi = randomInt(low, high);
  }

  return { midi, answer: noteNameFromMidi(midi) };
}

function generateIntervalQuestion() {
  const { low, high } = getMidiRange();
  const diff = DIFFICULTY[state.difficulty];
  let pool;

  if (diff.intervalPool === 'easy') {
    pool = INTERVALS.filter(i => EASY_INTERVALS.includes(i.semitones));
  } else {
    pool = [...INTERVALS];
  }

  const interval = pool[randomInt(0, pool.length - 1)];
  let ascending = true;

  if (diff.intervalPool === 'all+descending' && interval.semitones > 0) {
    ascending = Math.random() < 0.5;
  }

  // Pick base note such that the second note is in range
  let midi1, midi2;
  if (ascending) {
    midi1 = randomInt(low, high - interval.semitones);
    midi2 = midi1 + interval.semitones;
  } else {
    midi1 = randomInt(low + interval.semitones, high);
    midi2 = midi1 - interval.semitones;
  }

  const dirLabel = ascending ? '' : ' (desc)';
  const answerName = interval.name + dirLabel;

  return {
    midi1,
    midi2,
    semitones: interval.semitones,
    ascending,
    answer: answerName,
  };
}

function generateQuestion() {
  if (state.mode === 'note') {
    state.currentQuestion = generateNoteQuestion();
  } else {
    state.currentQuestion = generateIntervalQuestion();
  }
  state.replaysUsed = 0;
  state.userAnswer = null;
}

// ── Answer Choices ─────────────────────────

function getNoteChoices() {
  const diff = DIFFICULTY[state.difficulty];
  return diff.notePool === 'natural' ? [...NATURAL_NOTES] : [...NOTE_NAMES];
}

function getIntervalChoices() {
  const diff = DIFFICULTY[state.difficulty];

  if (diff.intervalPool === 'easy') {
    return INTERVALS.filter(i => EASY_INTERVALS.includes(i.semitones)).map(i => i.name);
  }

  const names = INTERVALS.map(i => i.name);

  if (diff.intervalPool === 'all+descending') {
    const descending = INTERVALS.filter(i => i.semitones > 0).map(i => i.name + ' (desc)');
    return [...names, ...descending];
  }

  return names;
}

// ── DOM References ─────────────────────────

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const screens = {
  menu: $('#screen-menu'),
  playing: $('#screen-playing'),
  result: $('#screen-result'),
  settings: $('#screen-settings'),
};

const els = {
  settingsBtn: $('#settings-btn'),
  scoreDisplay: $('#score-display'),
  streakDisplay: $('#streak-display'),
  resultScoreDisplay: $('#result-score-display'),
  resultStreakDisplay: $('#result-streak-display'),
  questionText: $('#question-text'),
  replayBtn: $('#replay-btn'),
  replayCount: $('#replay-count'),
  scaleBtn: $('#scale-btn'),
  backToMenuBtn: $('#back-to-menu-btn'),
  answerGrid: $('#answer-grid'),
  resultFeedback: $('#result-feedback'),
  resultText: $('#result-text'),
  resultDetail: $('#result-detail'),
  resultAnswerGrid: $('#result-answer-grid'),
  nextBtn: $('#next-btn'),
  octaveMin: $('#octave-min'),
  octaveMax: $('#octave-max'),
  waveform: $('#waveform'),
  refTone: $('#ref-tone'),
  resetScoreBtn: $('#reset-score-btn'),
  settingsBackBtn: $('#settings-back-btn'),
};

// ── Render Functions ───────────────────────

function showScreen(name) {
  state.screen = name;
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

function renderScoreBar() {
  const { correct, total } = state.score;
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
  const scoreText = `${correct} / ${total} (${pct}%)`;
  const streakText = `Streak: ${state.streak} | Best: ${state.bestStreak}`;

  els.scoreDisplay.textContent = scoreText;
  els.streakDisplay.textContent = streakText;
  els.resultScoreDisplay.textContent = scoreText;
  els.resultStreakDisplay.textContent = streakText;
}

function renderReplayButton() {
  const limit = DIFFICULTY[state.difficulty].replayLimit;
  if (limit === Infinity) {
    els.replayCount.textContent = '';
    els.replayBtn.disabled = false;
  } else {
    const remaining = limit - state.replaysUsed;
    els.replayCount.textContent = ` (${remaining} left)`;
    els.replayBtn.disabled = remaining <= 0;
  }
}

function buildAnswerButtons(container, choices, clickHandler) {
  container.innerHTML = '';
  choices.forEach((choice, idx) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.dataset.answer = choice;

    // Key hint (1-9, 0 for 10th)
    const keyNum = idx < 9 ? idx + 1 : (idx === 9 ? 0 : null);
    if (keyNum !== null) {
      const hint = document.createElement('span');
      hint.className = 'key-hint';
      hint.textContent = keyNum;
      btn.appendChild(hint);
    }

    const label = document.createTextNode(choice);
    btn.appendChild(label);

    btn.addEventListener('click', () => clickHandler(choice));
    container.appendChild(btn);
  });
}

function renderPlayingScreen() {
  const choices = state.mode === 'note' ? getNoteChoices() : getIntervalChoices();

  els.questionText.textContent =
    state.mode === 'note'
      ? 'What note is this?'
      : 'What interval is this?';

  buildAnswerButtons(els.answerGrid, choices, handleAnswer);
  renderScoreBar();
  renderReplayButton();
  els.scaleBtn.style.display = state.mode === 'note' ? '' : 'none';
}

function renderResultScreen(isCorrect) {
  const correctAnswer = state.currentQuestion.answer;
  const choices = state.mode === 'note' ? getNoteChoices() : getIntervalChoices();

  // Feedback banner
  els.resultFeedback.className = 'result-feedback ' + (isCorrect ? 'correct' : 'incorrect');
  els.resultText.textContent = isCorrect ? 'Correct!' : 'Incorrect';

  if (isCorrect) {
    els.resultDetail.textContent = `The answer was ${correctAnswer}.`;
  } else {
    els.resultDetail.textContent = `You answered ${state.userAnswer}. The correct answer was ${correctAnswer}.`;
  }

  // Frozen answer grid with highlights
  buildAnswerButtons(els.resultAnswerGrid, choices, () => {});
  const resultBtns = els.resultAnswerGrid.querySelectorAll('.answer-btn');
  resultBtns.forEach(btn => {
    if (btn.dataset.answer === correctAnswer) {
      btn.classList.add('correct');
    }
    if (!isCorrect && btn.dataset.answer === state.userAnswer) {
      btn.classList.add('incorrect');
    }
  });

  renderScoreBar();
}

function applySettingsToUI() {
  els.octaveMin.value = state.settings.octaveMin;
  els.octaveMax.value = state.settings.octaveMax;
  els.waveform.value = state.settings.waveform;
  els.refTone.checked = state.settings.referenceTone;
}

// ── Event Handlers ─────────────────────────

function handleModeSelect(mode) {
  ensureAudioContext();
  state.mode = mode;
  state.score = { correct: 0, total: 0 };
  state.streak = 0;
  generateQuestion();
  showScreen('playing');
  renderPlayingScreen();
  playCurrentQuestion();
}

function handleAnswer(answer) {
  state.userAnswer = answer;
  const isCorrect = answer === state.currentQuestion.answer;

  state.score.total++;
  if (isCorrect) {
    state.score.correct++;
    state.streak++;
    if (state.streak > state.bestStreak) {
      state.bestStreak = state.streak;
      saveState();
    }
  } else {
    state.streak = 0;
  }

  showScreen('result');
  renderResultScreen(isCorrect);
}

function handleReplay() {
  const limit = DIFFICULTY[state.difficulty].replayLimit;
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
  $$('.diff-btn').forEach(b => b.classList.remove('active'));
  $(`.diff-btn[data-difficulty="${diff}"]`).classList.add('active');
}

function handleSettingsOpen() {
  state.previousScreen = state.screen;
  applySettingsToUI();
  showScreen('settings');
}

function handleSettingsBack() {
  // Read settings from UI
  state.settings.octaveMin = parseInt(els.octaveMin.value, 10);
  state.settings.octaveMax = parseInt(els.octaveMax.value, 10);

  // Validate: min must be less than max
  if (state.settings.octaveMin >= state.settings.octaveMax) {
    state.settings.octaveMax = state.settings.octaveMin + 1;
  }

  state.settings.waveform = els.waveform.value;
  state.settings.referenceTone = els.refTone.checked;
  saveState();

  showScreen(state.previousScreen);
}

function handleResetScore() {
  state.score = { correct: 0, total: 0 };
  state.streak = 0;
  state.bestStreak = 0;
  saveState();
  renderScoreBar();
}

// ── Keyboard Shortcuts ─────────────────────

function handleKeyboard(e) {
  // Don't capture keys when in settings or menu
  if (state.screen === 'settings' || state.screen === 'menu') return;

  const key = e.key;

  if (state.screen === 'playing') {
    // Number keys 1-9, 0 for answers
    if (key >= '1' && key <= '9') {
      const idx = parseInt(key, 10) - 1;
      const btns = els.answerGrid.querySelectorAll('.answer-btn');
      if (idx < btns.length) {
        btns[idx].click();
      }
    } else if (key === '0') {
      const btns = els.answerGrid.querySelectorAll('.answer-btn');
      if (btns.length >= 10) {
        btns[9].click();
      }
    } else if (key === 'r' || key === 'R') {
      handleReplay();
    } else if ((key === 's' || key === 'S') && state.mode === 'note') {
      playMajorScale();
    }
  }

  if (state.screen === 'result') {
    if (key === ' ' || key === 'Enter') {
      e.preventDefault();
      handleNext();
    }
  }
}

// ── Init ───────────────────────────────────

function init() {
  loadState();

  // Mode buttons
  $$('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => handleModeSelect(btn.dataset.mode));
  });

  // Difficulty buttons
  $$('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => handleDifficulty(btn.dataset.difficulty));
  });

  // Playback controls
  els.replayBtn.addEventListener('click', handleReplay);
  els.scaleBtn.addEventListener('click', () => {
    if (state.mode === 'note') playMajorScale();
  });
  els.backToMenuBtn.addEventListener('click', () => {
    showScreen('menu');
  });

  // Next button
  els.nextBtn.addEventListener('click', handleNext);

  // Settings
  els.settingsBtn.addEventListener('click', handleSettingsOpen);
  els.settingsBackBtn.addEventListener('click', handleSettingsBack);
  els.resetScoreBtn.addEventListener('click', handleResetScore);

  // Keyboard
  document.addEventListener('keydown', handleKeyboard);

  // Apply loaded settings to difficulty buttons
  $$('.diff-btn').forEach(b => b.classList.remove('active'));
  $(`.diff-btn[data-difficulty="${state.difficulty}"]`).classList.add('active');

  renderScoreBar();
}

document.addEventListener('DOMContentLoaded', init);
