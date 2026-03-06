'use client';

import { useState, useCallback, useEffect } from 'react';
import { themes } from '@/lib/themes';
import { ThemeName } from '@/types';

export function useTheme() {
  const [themeName, setThemeName] = useState<ThemeName>('violet');
  const theme = themes[themeName];

  const applyTheme = useCallback((name: ThemeName) => {
    const t = themes[name];
    if (!t) return;
    setThemeName(name);

    const r = document.documentElement.style;
    r.setProperty('--accent', t.accent);
    r.setProperty('--accent-rgb', t.accentRgb);
    r.setProperty('--accent-light', t.light);
    r.setProperty('--accent-dark', t.dark);
    r.setProperty('--accent-darker', t.darker);
    r.setProperty('--accent-tip', t.tip);
    r.setProperty('--bg1', t.bg1);
    r.setProperty('--bg2', t.bg2);
    r.setProperty('--body-grad-0', t.bodyGrad[0]);
    r.setProperty('--body-grad-1', t.bodyGrad[1]);
    r.setProperty('--body-grad-2', t.bodyGrad[2]);
  }, []);

  useEffect(() => {
    applyTheme('violet');
  }, [applyTheme]);

  return { theme, themeName, applyTheme };
}
