import { showPage, renderResultsPage } from './ui.js';

export function showResults(data) {
  renderResultsPage(data);
  showPage('page-results');
}