import { getQuiz } from './data.js';
import { saveBest } from './utils.js';
import { showPage, renderPlayQuestion, disableOptions, highlightAnswers, showFeedback, updateTimerDisplay, setNextButtonVisible, updatePlayStats, setPlayTitle } from './ui.js';
import { showResults } from './results.js';

export let currentQuiz = null;
export let currentQIdx = 0;
export let score = 0;
export let correctCount = 0;
export let wrongCount = 0;
export let streak = 0;
export let maxStreak = 0;
export let timerInterval = null;
export let timerLeft = 0;
export let startTime = null;
export let questionStartTime = null;
export let userAnswers = [];

// ─── Start quiz ─────────────────────────────────────────────────────────
export function startQuiz(id) {
  currentQuiz = getQuiz(id);
  if (!currentQuiz) return;
  currentQIdx = 0; score = 0; correctCount = 0; wrongCount = 0;
  streak = 0; maxStreak = 0; userAnswers = [];
  startTime = Date.now();
  setPlayTitle(currentQuiz.name);
  showPage('page-play');
  renderQuestion();
}

// ─── Render current question ────────────────────────────────────────────
function renderQuestion() {
  const q = currentQuiz.questions[currentQIdx];
  const total = currentQuiz.questions.length;
  renderPlayQuestion(q, currentQIdx, total, score, correctCount, wrongCount, streak);
  questionStartTime = Date.now();
  startTimer();
}

// ─── Timer ──────────────────────────────────────────────────────────────
function startTimer() {
  clearInterval(timerInterval);
  const limit = currentQuiz.timePerQ || 0;
  if (!limit) {
    updateTimerDisplay(0, 0);
    return;
  }
  timerLeft = limit;
  updateTimerDisplay(timerLeft, limit);
  timerInterval = setInterval(() => {
    timerLeft--;
    updateTimerDisplay(timerLeft, limit);
    if (timerLeft <= 0) {
      clearInterval(timerInterval);
      timeUp();
    }
  }, 1000);
}

function timeUp() {
  const q = currentQuiz.questions[currentQIdx];
  disableOptions();
  showFeedback(false, `Время вышло! Правильный: ${q.options[q.correctAnswer]}`);
  highlightAnswers(-1, q.correctAnswer);
  wrongCount++;
  streak = 0;
  userAnswers.push({ q, chosen: -1, correct: false, time: currentQuiz.timePerQ });
  updatePlayStats(score, correctCount, wrongCount, streak);
  setNextButtonVisible(true);
}

// ─── Option selection ───────────────────────────────────────────────────
export function selectOption(idx) {
  clearInterval(timerInterval);
  const q = currentQuiz.questions[currentQIdx];
  const elapsed = Math.round((Date.now() - questionStartTime) / 1000);
  const isCorrect = idx === q.correctAnswer;
  disableOptions();
  highlightAnswers(idx, q.correctAnswer);
  if (isCorrect) {
    score++; correctCount++; streak++;
    if (streak > maxStreak) maxStreak = streak;
    showFeedback(true, '✓ Верно!');
  } else {
    wrongCount++; streak = 0;
    showFeedback(false, `✗ Неверно. Правильный: ${q.options[q.correctAnswer]}`);
  }
  userAnswers.push({ q, chosen: idx, correct: isCorrect, time: elapsed });
  updatePlayStats(score, correctCount, wrongCount, streak);
  setNextButtonVisible(true);
}

// ─── Next question ──────────────────────────────────────────────────────
export function nextQuestion() {
  currentQIdx++;
  if (currentQIdx >= currentQuiz.questions.length) {
    finishQuiz();
  } else {
    renderQuestion();
  }
}

// ─── Finish and show results ────────────────────────────────────────────
function finishQuiz() {
  clearInterval(timerInterval);
  const total = currentQuiz.questions.length;
  const pct = Math.round((correctCount / total) * 100);
  const elapsed = Math.round((Date.now() - startTime) / 1000);
  saveBest(currentQuiz.id, pct);

  // Prepare data for results page
  let title, sub;
  if (pct >= 90) { title = '🏆 Великолепно!'; sub = 'Ты настоящий эксперт'; }
  else if (pct >= 70) { title = '🎉 Отличный результат!'; sub = 'Продолжай в том же духе'; }
  else if (pct >= 50) { title = '👍 Неплохо!'; sub = 'Ещё немного практики'; }
  else { title = '📚 Нужно подтянуть!'; sub = 'Повтори материал и попробуй снова'; }

  showResults({
    pct, correctCount, wrongCount, score,
    elapsed, avgTime: Math.round(elapsed / total),
    maxStreak, title, sub, userAnswers
  });
}

// ─── Confirm exit ───────────────────────────────────────────────────────
export function confirmExit() {
  clearInterval(timerInterval);
  if (confirm('Выйти из теста? Прогресс будет потерян.')) {
    showPage('page-home');
  }
}

// ─── Restart quiz ───────────────────────────────────────────────────────
export function restartQuiz() {
  if (currentQuiz) startQuiz(currentQuiz.id);
}