'use client';

import { useState, useRef, useEffect } from 'react';
import { themes, themeNames } from '@/lib/themes';
import { ThemeName } from '@/types';

interface ThemePickerProps {
  currentTheme: ThemeName;
  onThemeChange: (name: ThemeName) => void;
}

export default function ThemePicker({ currentTheme, onThemeChange }: ThemePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (isOpen && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [isOpen]);

  const handleSelect = (name: ThemeName) => {
    const t = themes[name];
    onThemeChange(name);
    setFlash(t.flashColor);
    setTimeout(() => setFlash(null), 500);
  };

  return (
    <>
      {/* Flash overlay */}
      {flash && (
        <div
          className="fixed inset-0 z-50 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${flash}, transparent 70%)`,
            animation: 'flash-pop 0.5s ease-out forwards',
          }}
        />
      )}

      <div ref={containerRef} className="fixed bottom-6 right-6 z-10 flex flex-col items-end gap-3 max-md:bottom-4 max-md:right-4">
        {/* Orbs */}
        <div
          className="flex flex-col gap-2 p-2.5 rounded-[20px] backdrop-blur-[16px] transition-all duration-350"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.9)',
            pointerEvents: isOpen ? 'all' : 'none',
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {themeNames.map((name) => {
            const t = themes[name];
            const isActive = currentTheme === name;
            return (
              <button
                key={name}
                className="relative w-9 h-9 rounded-full cursor-pointer transition-all duration-250 max-md:w-[30px] max-md:h-[30px]"
                style={{
                  background: t.orbGradient,
                  border: isActive ? '3px solid #fff' : '3px solid transparent',
                  boxShadow: isActive
                    ? `0 0 0 2px rgba(255,255,255,0.2), 0 0 20px ${t.orbGlow}`
                    : '0 2px 8px rgba(0,0,0,0.3)',
                  animation: isActive ? 'orb-pulse 2s ease-in-out infinite' : 'none',
                  ['--orb-glow' as string]: t.orbGlow,
                  transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
                title={t.label}
                onClick={() => handleSelect(name as ThemeName)}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.2)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}
              >
                <span className="absolute inset-[3px] rounded-full pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, transparent 60%)' }} />
                <span
                  className="absolute right-[calc(100%+10px)] top-1/2 -translate-y-1/2 text-[11px] font-bold whitespace-nowrap opacity-0 pointer-events-none transition-opacity duration-200 px-2 py-1 rounded-md backdrop-blur-[8px]"
                  style={{
                    color: 'rgba(var(--card-text-rgb), 0.7)',
                    background: 'rgba(0,0,0,0.6)',
                  }}
                >
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Palette button */}
        <button
          className="w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-200 max-md:w-[42px] max-md:h-[42px] max-md:rounded-[14px]"
          style={{
            background: isOpen ? 'rgba(var(--accent-rgb), 0.15)' : 'var(--card-bg)',
            border: isOpen ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 3px 0 rgba(0,0,0,0.3), 0 6px 20px rgba(0,0,0,0.3)',
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          title="Change theme"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.18-.62-1.61-.37-.41-.58-.97-.58-1.59 0-1.38 1.12-2.5 2.5-2.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9z"
              fill="rgba(255,255,255,0.15)"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="1.5"
            />
            <circle cx="7.5" cy="11.5" r="1.8" fill="#f87171" />
            <circle cx="10" cy="7.5" r="1.8" fill="#fbbf24" />
            <circle cx="14.5" cy="7.5" r="1.8" fill="#34d399" />
            <circle cx="17" cy="11.5" r="1.8" fill="#60a5fa" />
          </svg>
        </button>
      </div>
    </>
  );
}
