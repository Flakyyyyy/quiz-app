import { loadInitialQuizzes } from './data.js';
import { showPage, renderQuizList, renderManageList } from './ui.js';
import { startQuiz, nextQuestion, selectOption, confirmExit, restartQuiz, currentQuiz } from './quiz.js';
import { startCreate, editQuiz, deleteQuiz, changeQCount, changeOptCount, changeTimerVal, applySettings, saveQuiz, exportQuiz, importQuiz } from './manage.js';
import { toast } from './utils.js';

// Инициализация приложения
async function init() {
  await loadInitialQuizzes();

  // Навигация
  window.app = {
    showHome: () => showPage('page-home'),
    showQuizList: () => { renderQuizList(); showPage('page-quiz-list'); },
    showManage: () => { renderManageList(); showPage('page-manage'); },
    // Quiz play
    startQuiz: (id) => startQuiz(id),
    selectOption: (idx) => selectOption(idx),
    nextQuestion: () => nextQuestion(),
    confirmExit: () => confirmExit(),
    restartQuiz: () => restartQuiz(),
    // Manage
    startCreate: () => startCreate(),
    editQuiz: (id) => editQuiz(id),
    deleteQuiz: (id) => deleteQuiz(id),
    changeQCount: (d) => changeQCount(d),
    changeOptCount: (d) => changeOptCount(d),
    changeTimerVal: (d) => changeTimerVal(d),
    applySettings: () => applySettings(),
    saveQuiz: () => saveQuiz(),
    exportQuiz: () => exportQuiz(),
    importQuiz: (input) => importQuiz(input),
    // Toast
    toast: (msg, type) => toast(msg, type)
  };

  // Первоначальный рендер списка тестов (на случай если страница сразу открыта)
  renderQuizList();
  renderManageList();
}

init();