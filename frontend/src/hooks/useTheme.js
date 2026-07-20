import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectTheme, toggleTheme, setTheme } from '@/store/uiSlice';

/**
 * Applies the current theme to <html data-theme> and persists it.
 * Call once high in the tree (App).
 */
export function useApplyTheme() {
  const theme = useSelector(selectTheme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('ramp_theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);
  return theme;
}

/** Read + control the theme from any component. */
export function useTheme() {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);
  return {
    theme,
    isDark: theme === 'dark',
    toggle: () => dispatch(toggleTheme()),
    setMode: (mode) => dispatch(setTheme(mode)),
  };
}

export default useTheme;
