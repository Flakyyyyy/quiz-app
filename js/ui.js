import { quizzes } from './data.js';
import { getBest } from './utils.js';
import { esc } from './utils.js';

// ─── Page navigation ───────────────────────────────────────────────────
export function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

// ─── Render quiz list (для игры) ───────────────────────────────────────
export function renderQuizList() {
  const container = document.getElementById('quiz-list-container');
  if (!quizzes.length) {
    container.innerHTML = `<div class="empty"><div class="empty-icon">📭</div><p>Тестов пока нет. Создайте первый!</p></div>`;
    return;
  }
  container.innerHTML = quizzes.map(q => {
    const best = getBest(q.id);
    return `<div class="quiz-item" onclick="window.app.startQuiz('${q.id}')">
      <div class="quiz-item-icon">${q.icon || '📋'}</div>
      <div class="quiz-item-info">
        <div class="quiz-item-title">${esc(q.name)}</div>
        <div class="quiz-item-meta">${q.questions.length} вопр. · ${q.timePerQ ? q.timePerQ + 'с/вопрос' : 'без таймера'}
          ${best !== null ? ` · <span style="color:var(--green)">Рекорд: ${best}%</span>` : ''}
        </div>
      </div>
      <span class="badge badge-purple">${q.questions.length} Q</span>
    </div>`;
  }).join('');
}

// ─── Render manage list ────────────────────────────────────────────────
export function renderManageList() {
  const container = document.getElementById('manage-list-container');
  if (!quizzes.length) {
    container.innerHTML = `<div class="empty"><div class="empty-icon">📝</div><p>Нет тестов. Создайте первый!</p></div>`;
    return;
  }
  container.innerHTML = quizzes.map(q => `
    <div class="edit-quiz-item">
      <div class="quiz-item-icon">${q.icon || '📋'}</div>
      <div class="quiz-item-info">
        <div class="quiz-item-title">${esc(q.name)}</div>
        <div class="quiz-item-meta">${q.questions.length} вопр. · ${q.timePerQ ? q.timePerQ + 'с' : 'без таймера'}</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-sm btn-secondary" onclick="window.app.editQuiz('${q.id}');event.stopPropagation()">Изм.</button>
        <button class="btn btn-sm btn-danger" onclick="window.app.deleteQuiz('${q.id}');event.stopPropagation()">Удал.</button>
      </div>
    </div>`
  ).join('');
}

// ─── Render question editor ─────────────────────────────────────────────
export function renderEditor(questions) {
  const el = document.getElementById('questions-editor');
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  el.innerHTML = questions.map((q, qi) => `
    <div class="q-block" id="qb-${qi}">
      <div class="q-block-header">
        <span class="q-block-num">Вопрос ${qi + 1}</span>
      </div>
      <div class="form-group">
        <label class="form-label">Текст вопроса</label>
        <input class="form-input" id="qt-${qi}" placeholder="Введите вопрос..." value="${esc(q.question)}" />
      </div>
      <div class="form-group">
        <label class="form-label">Варианты ответа (отметьте правильный)</label>
        <div class="options-list">
          ${q.options.map((opt, oi) => `
            <div class="option-row">
              <div class="option-index">${letters[oi]}</div>
              <input class="form-input" id="qo-${qi}-${oi}" placeholder="Вариант ${letters[oi]}" value="${esc(opt)}" />
              <input type="radio" class="correct-radio" name="correct-${qi}" value="${oi}" ${q.correctAnswer === oi ? 'checked' : ''} title="Правильный ответ" />
            </div>`).join('')}
        </div>
      </div>
    </div>`
  ).join('');
}

// ─── Update play header stats ──────────────────────────────────────────
export function updatePlayStats(score, correct, wrong, streak) {
  document.getElementById('score-display').textContent = score;
  document.getElementById('correct-display').textContent = correct;
  document.getElementById('wrong-display').textContent = wrong;
  document.getElementById('streak-info').textContent = streak > 1 ? `🔥 серия: ${streak}` : '';
}

// ─── Render question in play mode ───────────────────────────────────────
export function renderPlayQuestion(question, idx, total, score, correct, wrong, streak) {
  document.getElementById('question-num').textContent = `Вопрос ${idx + 1} из ${total}`;
  document.getElementById('progress-fill').style.width = `${(idx / total) * 100}%`;
  document.getElementById('question-text').textContent = question.question;
  updatePlayStats(score, correct, wrong, streak);

  const optsContainer = document.getElementById('options-container');
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  optsContainer.innerHTML = question.options.map((opt, i) =>
    `<button class="option-btn" onclick="window.app.selectOption(${i})" id="opt-${i}">
      <div class="option-letter">${letters[i] || i + 1}</div>
      <span>${esc(opt)}</span>
    </button>`
  ).join('');

  const fb = document.getElementById('feedback-box');
  fb.className = 'feedback';
  fb.textContent = '';
  document.getElementById('next-btn').style.display = 'none';
}

// ─── Disable option buttons ─────────────────────────────────────────────
export function disableOptions() {
  document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
}

// ─── Highlight answers ──────────────────────────────────────────────────
export function highlightAnswers(chosen, correct) {
  document.querySelectorAll('.option-btn').forEach((btn, i) => {
    if (i === correct) btn.classList.add('correct');
    else if (i === chosen) btn.classList.add('wrong');
  });
}

// ─── Show feedback ──────────────────────────────────────────────────────
export function showFeedback(ok, msg) {
  const fb = document.getElementById('feedback-box');
  fb.className = 'feedback show ' + (ok ? 'correct-fb' : 'wrong-fb');
  fb.textContent = msg;
}

// ─── Timer display ──────────────────────────────────────────────────────
export function updateTimerDisplay(seconds, limit) {
  const txt = document.getElementById('timer-text');
  const pill = document.getElementById('timer-pill');
  if (!limit) {
    txt.textContent = '∞';
    pill.classList.remove('danger');
  } else {
    txt.textContent = seconds + 's';
    if (seconds <= 5) pill.classList.add('danger');
    else pill.classList.remove('danger');
  }
}

// ─── Set next button visibility ─────────────────────────────────────────
export function setNextButtonVisible(visible) {
  document.getElementById('next-btn').style.display = visible ? 'block' : 'none';
}

// ─── Render results page (вся статистика и разбор) ─────────────────────
export function renderResultsPage(data) {
  const { pct, correctCount, wrongCount, score, elapsed, avgTime, maxStreak, title, sub, userAnswers } = data;
  document.getElementById('res-pct').textContent = pct + '%';
  document.getElementById('res-correct').textContent = correctCount;
  document.getElementById('res-wrong').textContent = wrongCount;
  document.getElementById('res-score').textContent = score;
  document.getElementById('res-time').textContent = formatTime(elapsed);
  document.getElementById('res-avg').textContent = formatTime(avgTime);
  document.getElementById('res-streak').textContent = maxStreak;
  document.getElementById('res-title').textContent = title;
  document.getElementById('res-sub').textContent = sub;

  const rev = document.getElementById('review-container');
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  rev.innerHTML = userAnswers.map((a, i) => {
    const icon = a.correct ? '✅' : '❌';
    return `<div style="padding:14px;border-radius:var(--radius);background:var(--surface2);border:1px solid var(--border);margin-bottom:10px">
      <div style="font-size:13px;color:var(--text2);margin-bottom:6px">${icon} Вопрос ${i + 1} · ${a.time}с</div>
      <div style="font-weight:600;margin-bottom:10px">${esc(a.q.question)}</div>
      ${a.q.options.map((opt, j) => {
        let color = 'var(--text2)';
        if (j === a.q.correctAnswer) color = 'var(--green)';
        else if (j === a.chosen && !a.correct) color = 'var(--red)';
        return `<div style="font-size:14px;color:${color};margin-bottom:4px">${letters[j]}. ${esc(opt)}</div>`;
      }).join('')}
    </div>`;
  }).join('');
}

function formatTime(s) {
  if (s < 60) return s + 'с';
  return Math.floor(s / 60) + 'м ' + (s % 60) + 'с';
}

// ─── Обновление заголовка плейлиста ────────────────────────────────────
export function setPlayTitle(title) {
  document.getElementById('play-title').textContent = title;
}