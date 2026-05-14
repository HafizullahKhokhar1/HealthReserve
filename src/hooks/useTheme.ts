import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'health-reserve-theme';

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch (error) {
    console.warn('Failed to read localStorage:', error);
  }

  return getSystemTheme();
}

let currentTheme: Theme = getStoredTheme();
const listeners = new Set<() => void>();

function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') return;

  document.documentElement.classList.toggle('dark', theme === 'dark');

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (error) {
    console.warn('Failed to write to localStorage:', error);
  }
}

if (typeof window !== 'undefined') {
  applyTheme(currentTheme);

  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return;
    if (event.newValue !== 'light' && event.newValue !== 'dark') return;

    currentTheme = event.newValue;
    applyTheme(currentTheme);
    listeners.forEach((listener) => listener());
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setTheme(nextTheme: Theme) {
  currentTheme = nextTheme;
  applyTheme(nextTheme);
  listeners.forEach((listener) => listener());
}

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribe,
    () => currentTheme,
    () => 'light'
  );

  const toggleTheme = () => {
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
}
