// ─── Toast ─────────────────────────────────────────────────────────────
let toastTimer = null;
export function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show toast-' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

// ─── Escape HTML ───────────────────────────────────────────────────────
export function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Time formatting ───────────────────────────────────────────────────
export function formatTime(s) {
  if (s < 60) return s + 'с';
  return Math.floor(s / 60) + 'м ' + (s % 60) + 'с';
}

// ─── LocalStorage helpers ──────────────────────────────────────────────
export function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
export function loadFromStorage(key, defaultValue = null) {
  const raw = localStorage.getItem(key);
  if (raw === null) return defaultValue;
  try { return JSON.parse(raw); } catch { return defaultValue; }
}

// ─── Best score management ─────────────────────────────────────────────
export function getBest(quizId) {
  const key = 'best_' + quizId;
  const v = localStorage.getItem(key);
  return v !== null ? parseInt(v) : null;
}
export function saveBest(quizId, pct) {
  const prev = getBest(quizId);
  if (prev === null || pct > prev) {
    localStorage.setItem('best_' + quizId, pct);
  }
}