// Light / dark theme. The inline script in index.html sets data-theme on <html> before the CSS loads;
// this module keeps it in step: it follows the system until the visitor picks a theme, then remembers the pick.

import iSun from '@phosphor-icons/core/assets/regular/sun.svg?raw';
import iMoon from '@phosphor-icons/core/assets/regular/moon.svg?raw';

const KEY = 'rbm-theme'; // also read by the inline script in index.html
const COLOURS = { light: '#ededeb', dark: '#121314' }; // theme-color, matches --bg in styles.css
const system = window.matchMedia('(prefers-color-scheme: dark)');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const root = document.documentElement;

function stored() {
  try {
    const t = localStorage.getItem(KEY);
    return t === 'light' || t === 'dark' ? t : null;
  } catch {
    return null;
  }
}

let chosen = stored(); // null until the visitor picks, so the system setting is followed
const systemTheme = () => (system.matches ? 'dark' : 'light');

export const currentTheme = () => (root.dataset.theme === 'dark' ? 'dark' : 'light');

// Both toggles hold a sun and a moon; CSS shows the one for the mode a click switches to
export const themeIcons = () =>
  `<span class="theme-ico theme-ico--sun" aria-hidden="true">${iSun}</span><span class="theme-ico theme-ico--moon" aria-hidden="true">${iMoon}</span>`;

function apply(theme) {
  root.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COLOURS[theme]);
  const label = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
  document.querySelectorAll('[data-theme-toggle]').forEach((b) => b.setAttribute('aria-label', label));
}

export function toggleTheme() {
  chosen = currentTheme() === 'dark' ? 'light' : 'dark';
  try {
    localStorage.setItem(KEY, chosen);
  } catch {
    // storage blocked: the choice still holds for this visit
  }
  const run = () => apply(chosen);
  if (document.startViewTransition && !reduce.matches) document.startViewTransition(run);
  else run();
}

// Call once the toggles are in the DOM, so their labels are set
export function initTheme() {
  apply(chosen || systemTheme());
  system.addEventListener('change', () => chosen || apply(systemTheme()));
}
