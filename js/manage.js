import { quizzes, addQuiz, updateQuiz, deleteQuiz as deleteQuizFromData, saveData } from './data.js';
import { showPage, renderEditor, renderManageList } from './ui.js';
import { toast, esc } from './utils.js';

export let editTarget = null;
export let createSettings = { qCount: 3, optCount: 4, timer: 30 };

// ─── Start create new quiz ──────────────────────────────────────────────
export function startCreate() {
  editTarget = null;
  createSettings = { qCount: 3, optCount: 4, timer: 30 };
  document.getElementById('quiz-name').value = '';
  document.getElementById('quiz-icon').value = '';
  document.getElementById('q-count-val').textContent = 3;
  document.getElementById('opt-count-val').textContent = 4;
  document.getElementById('timer-val').textContent = 30;
  document.getElementById('create-page-title').textContent = 'Новый тест';
  applySettings(); // render empty editor
  showPage('page-create');
}

// ─── Edit existing quiz ─────────────────────────────────────────────────
export function editQuiz(id) {
  const quiz = quizzes.find(q => q.id === id);
  if (!quiz) return;
  editTarget = id;
  createSettings = {
    qCount: quiz.questions.length,
    optCount: quiz.questions[0]?.options.length || 4,
    timer: quiz.timePerQ || 0
  };
  document.getElementById('quiz-name').value = quiz.name;
  document.getElementById('quiz-icon').value = quiz.icon || '';
  document.getElementById('q-count-val').textContent = createSettings.qCount;
  document.getElementById('opt-count-val').textContent = createSettings.optCount;
  document.getElementById('timer-val').textContent = createSettings.timer;
  document.getElementById('create-page-title').textContent = 'Редактировать тест';
  renderEditor(quiz.questions);
  showPage('page-create');
}

// ─── Delete quiz ────────────────────────────────────────────────────────
export function deleteQuiz(id) {
  if (!confirm('Удалить этот тест?')) return;
  deleteQuizFromData(id);
  renderManageList();
  toast('Тест удалён', 'error');
}

// ─── Settings controls ──────────────────────────────────────────────────
export function changeQCount(delta) {
  createSettings.qCount = Math.max(1, Math.min(30, createSettings.qCount + delta));
  document.getElementById('q-count-val').textContent = createSettings.qCount;
}
export function changeOptCount(delta) {
  createSettings.optCount = Math.max(2, Math.min(6, createSettings.optCount + delta));
  document.getElementById('opt-count-val').textContent = createSettings.optCount;
}
export function changeTimerVal(delta) {
  createSettings.timer = Math.max(0, Math.min(300, createSettings.timer + delta));
  document.getElementById('timer-val').textContent = createSettings.timer;
}

// ─── Apply settings: regenerate editor with new question/option counts ──
export function applySettings() {
  const existing = collectQuestionsFromEditor();
  const n = createSettings.qCount;
  const opts = createSettings.optCount;
  const qs = [];
  for (let i = 0; i < n; i++) {
    if (existing[i]) {
      const eq = existing[i];
      while (eq.options.length < opts) eq.options.push('');
      eq.options = eq.options.slice(0, opts);
      if (eq.correctAnswer >= opts) eq.correctAnswer = 0;
      qs.push(eq);
    } else {
      qs.push({ question: '', options: Array(opts).fill(''), correctAnswer: 0 });
    }
  }
  renderEditor(qs);
}

// ─── Collect questions from editor DOM ──────────────────────────────────
export function collectQuestionsFromEditor() {
  const qs = [];
  let qi = 0;
  while (document.getElementById(`qt-${qi}`) !== null) {
    const question = document.getElementById(`qt-${qi}`).value.trim();
    const options = [];
    let oi = 0;
    while (document.getElementById(`qo-${qi}-${oi}`) !== null) {
      options.push(document.getElementById(`qo-${qi}-${oi}`).value.trim());
      oi++;
    }
    const radioSel = document.querySelector(`input[name="correct-${qi}"]:checked`);
    const correctAnswer = radioSel ? parseInt(radioSel.value) : 0;
    qs.push({ question, options, correctAnswer });
    qi++;
  }
  return qs;
}

// ─── Save quiz (create or update) ───────────────────────────────────────
export function saveQuiz() {
  const name = document.getElementById('quiz-name').value.trim();
  const icon = document.getElementById('quiz-icon').value.trim() || '📋';
  const timer = parseInt(document.getElementById('timer-val').textContent) || 0;
  if (!name) { toast('Введите название теста!', 'error'); return; }
  const questions = collectQuestionsFromEditor();
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.question) { toast(`Вопрос ${i + 1}: введите текст вопроса`, 'error'); return; }
    for (let j = 0; j < q.options.length; j++) {
      if (!q.options[j]) { toast(`Вопрос ${i + 1}: заполните вариант ${j + 1}`, 'error'); return; }
    }
  }
  if (!questions.length) { toast('Добавьте хотя бы один вопрос', 'error'); return; }

  if (editTarget) {
    updateQuiz(editTarget, { name, icon, timePerQ: timer, questions });
  } else {
    addQuiz({ id: 'q' + Date.now(), name, icon, timePerQ: timer, questions });
  }
  toast('Тест сохранён!', 'success');
  setTimeout(() => {
    showPage('page-manage');
    renderManageList();
  }, 600);
}

// ─── Export quiz as JSON ────────────────────────────────────────────────
export function exportQuiz() {
  const name = document.getElementById('quiz-name').value.trim() || 'quiz';
  const questions = collectQuestionsFromEditor();
  const blob = new Blob([JSON.stringify(questions, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name + '.json';
  a.click();
  toast('JSON скачан!', 'success');
}

// ─── Import quiz from JSON file ─────────────────────────────────────────
export function importQuiz(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw new Error('Не массив');

      
      const isQuizArray = data[0] && data[0].questions && Array.isArray(data[0].questions);

      if (isQuizArray) {
        // Формат: [{id, name, questions: [...]}, ...]
        data.forEach(quiz => {
          if (!quiz.id) quiz.id = 'q' + Date.now() + Math.random();
          const exists = quizzes.find(q => q.id === quiz.id);
          if (exists) {
            updateQuiz(quiz.id, quiz);
          } else {
            addQuiz(quiz);
          }
        });
        toast(`Импортировано тестов: ${data.length}`, 'success');
        renderManageList();
        showPage('page-manage');
      } else {
        // Формат: [{question, options, correctAnswer}, ...] 
        const optCount = data[0]?.options?.length || 4;
        createSettings.qCount = data.length;
        createSettings.optCount = optCount;
        document.getElementById('q-count-val').textContent = data.length;
        document.getElementById('opt-count-val').textContent = optCount;
        renderEditor(data);
        toast('Вопросы импортированы!', 'success');
      }
    } catch (err) {
      toast('Ошибка: неверный формат JSON', 'error');
    }
  };
  reader.onerror = () => toast('Ошибка чтения файла', 'error');
  reader.readAsText(file);
  input.value = '';
}