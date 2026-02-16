'use client';

import { useEffect } from 'react';

type ThemeSetting = 'LIGHT' | 'DARK' | 'SYSTEM';

const THEME_STORAGE_KEY = 'datalyst_theme';

function applyTheme(theme: ThemeSetting) {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = theme === 'DARK' || (theme === 'SYSTEM' && prefersDark);

    root.classList.toggle('dark', shouldUseDark);
    root.classList.toggle('light', !shouldUseDark);
}

export function ThemeSync() {
    useEffect(() => {
        const saved = (window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeSetting | null) || 'SYSTEM';
        applyTheme(saved);

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const onMediaChange = () => {
            const current = (window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeSetting | null) || 'SYSTEM';
            if (current === 'SYSTEM') {
                applyTheme('SYSTEM');
            }
        };

        const onThemeChange = () => {
            const current = (window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeSetting | null) || 'SYSTEM';
            applyTheme(current);
        };

        media.addEventListener('change', onMediaChange);
        window.addEventListener('datalyst-theme-change', onThemeChange as EventListener);

        return () => {
            media.removeEventListener('change', onMediaChange);
            window.removeEventListener('datalyst-theme-change', onThemeChange as EventListener);
        };
    }, []);

    return null;
}

