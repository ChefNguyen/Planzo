export type ThemeMode = 'light';

export const getInitialTheme = (): ThemeMode => 'light';

export const applyTheme = (_theme?: ThemeMode): void => {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  const body = document.body;

  root.classList.remove('dark');
  root.classList.add('light');
  if (body) {
    body.classList.remove('dark');
    body.style.colorScheme = 'light';
  }
};
