import { loadFromStorage, saveToStorage } from './utils.js';

export let quizzes = [];

const STORAGE_KEY = 'quizzes';

// Загрузка начальных данных: если localStorage пуст, пытаемся загрузить из JSON
export async function loadInitialQuizzes() {
  const stored = loadFromStorage(STORAGE_KEY, null);
  if (stored && Array.isArray(stored) && stored.length > 0) {
    quizzes = stored;
    return;
  }
  try {
    const response = await fetch('data/initial-quizzes.json');
    if (response.ok) {
      const data = await response.json();
      quizzes = data;
      saveData();
    } else {
      // fallback
      quizzes = [];
    }
  } catch (e) {
    console.warn('Не удалось загрузить начальные тесты, используется пустой массив');
    quizzes = [];
  }
}

export function saveData() {
  saveToStorage(STORAGE_KEY, quizzes);
}

// ─── Quiz CRUD ──────────────────────────────────────────────────────────
export function getQuiz(id) {
  return quizzes.find(q => q.id === id);
}

export function addQuiz(quiz) {
  quizzes.push(quiz);
  saveData();
}

export function updateQuiz(id, updatedData) {
  const idx = quizzes.findIndex(q => q.id === id);
  if (idx !== -1) {
    quizzes[idx] = { ...quizzes[idx], ...updatedData };
    saveData();
    return true;
  }
  return false;
}

export function deleteQuiz(id) {
  quizzes = quizzes.filter(q => q.id !== id);
  saveData();
}